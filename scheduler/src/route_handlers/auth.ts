import DataAccess, { user_account_schema } from '@services/DataAccess';
import { api_output_schema } from '@utils/api_responses';
import ApiError from '@utils/errors/ApiError';
import {
  any_input_schema,
  api_endpoints_factory,
  cookie_tools_middleware,
  csrf_token_middleware,
  require_and_verify_access_token_middleware,
  require_and_verify_refresh_token_middleware,
} from '@utils/express_zod_api';
import StatusCodes from '@utils/StatusCodes';
import {
  ACCESS_COOKIE_CONFIG,
  CSRF_COOKIE_CONFIG,
  REFRESH_COOKIE_CONFIG,
  createAccessToken,
  createRefreshToken,
  verify,
} from '@utils/tokens';
import { Request, Response } from 'express';
import { getLogger } from '@utils/logger';

const logger = getLogger(__filename);

export const verify_get = api_endpoints_factory
  .addMiddleware(cookie_tools_middleware)
  .addMiddleware(csrf_token_middleware)
  .build({
    method: 'get',
    input: any_input_schema,
    output: api_output_schema,
    handler: async ({ options: { cookies, csrf } }) => {
      /*  Note: It's up to the downstream code to check that a token is received (which is why we allow
       *  requests without tokens to pass this check); and if there is a token, it will have passed
       *  this check, so it can be assumed to be valid downstream */
      // If there is no access token included in the request, don't try to verify, just return a 204.
      const access_token = cookies?.access_token;
      if (typeof access_token === 'string' && access_token) {
        // The verify function will throw an error if the request does not pass the auth check.
        // The csrf is required here since we may be verifying the token for a non-GET request downstream.
        await verify(access_token, csrf);
      }
      return { data: null };
    },
  });

export const identify_get = api_endpoints_factory
  .addMiddleware(require_and_verify_access_token_middleware)
  .build({
    method: 'get',
    input: any_input_schema,
    output: api_output_schema.extend({ data: user_account_schema }),
    handler: async ({ options: { access_token, access_token_decoded } }) => {
      const { payload } = access_token_decoded;
      const data = await DataAccess.getUserByUuid(payload.sub, access_token);
      return { data };
    },
  });

export const refresh_get = api_endpoints_factory
  .addMiddleware(cookie_tools_middleware)
  .addMiddleware(require_and_verify_refresh_token_middleware)
  .build({
    method: 'get',
    input: any_input_schema,
    output: api_output_schema,
    handler: async ({ options: { refresh_token_decoded, clearCookie, setCookie } }) => {
      try {
        const { payload } = refresh_token_decoded;
        const { jwt, csrf } = await createAccessToken(payload.sub);
        setCookie('access_token', jwt, ACCESS_COOKIE_CONFIG);
        setCookie('csrf', csrf, CSRF_COOKIE_CONFIG);
      } catch (e: unknown) {
        if (e instanceof ApiError && e.status_code === StatusCodes.UNAUTHORIZED) {
          clearCookie('access_token', { path: ACCESS_COOKIE_CONFIG.path });
          clearCookie('refresh_token', { path: REFRESH_COOKIE_CONFIG.path });
          clearCookie('csrf', { path: CSRF_COOKIE_CONFIG.path });
        }
        throw e;
      }
      return { data: null };
    },
  });

export const sign_out_get = api_endpoints_factory.addMiddleware(cookie_tools_middleware).build({
  method: 'get',
  input: any_input_schema,
  output: api_output_schema,
  handler: async ({ options: { clearCookie } }) => {
    clearCookie('access_token', { path: ACCESS_COOKIE_CONFIG.path });
    clearCookie('refresh_token', { path: REFRESH_COOKIE_CONFIG.path });
    clearCookie('csrf', { path: CSRF_COOKIE_CONFIG.path });
    return { data: null };
  },
});

/**
 * Used to handle the user-sign-in process after they have authenticated with an identity provider.
 * It creates the JWTs and sends them to the client using cookies.
 * @param req the Express request object
 * @param res the Express response object
 */
export async function handleSignIn(req: Request, res: Response): Promise<void> {
  if (req.user) {
    logger.info(`Handling sign in for user: ${JSON.stringify(req.user)}`);
    const { jwt, csrf } = await createAccessToken(req.user.uuid);
    const refresh_token = await createRefreshToken(req.user.uuid);

    res.cookie('access_token', jwt, ACCESS_COOKIE_CONFIG);
    res.cookie('refresh_token', refresh_token, REFRESH_COOKIE_CONFIG);
    res.cookie('csrf', csrf, CSRF_COOKIE_CONFIG);
    res.redirect(process.env.AUTH_BASE_HOST ?? '/');
  } else {
    logger.error(
      'Error in "handleSignIn" function: Somehow the user object was undefined, this should never happen',
    );
    res.redirect('/messages/500');
  }
}
