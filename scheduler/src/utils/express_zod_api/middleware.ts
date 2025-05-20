import { Method, createMiddleware } from 'express-zod-api';
import { ZodSchema, ZodTypeDef, z } from 'zod';
import { empty_input_schema } from './schemas';
import { CookieOptions, Request } from 'express';
import { verify } from '@utils/tokens';

function getCsrfToken(request: Request): string[] | string {
  const parsed = z.string().or(z.array(z.string())).safeParse(request.headers['x-csrf-token']);
  return parsed.success ? parsed.data : '';
}

function getAccessToken(request: Request): string {
  const parsed = z.string().safeParse(request.cookies?.access_token);
  return parsed.success ? parsed.data : '';
}

function getRefreshToken(request: Request): string {
  const parsed = z.string().safeParse(request.cookies?.refresh_token);
  return parsed.success ? parsed.data : '';
}

/**
 * Gets the HTTP Method and adds it to the options object.
 */
export const get_method_middleware = createMiddleware({
  input: empty_input_schema,
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  middleware: async ({ request }) => ({ method: request.method.toLowerCase() as Method }),
});

/**
 * Returns a middleware that parses the request params with the provided schema and
 * adds the parsed params to the options object in a 'params' key.
 * @param schema the Zod Schema to use for parsing the params
 * @returns a middleware
 */
export const getParseUrlParamsMiddleware = <
  T extends Record<number | string, unknown>,
  D extends ZodTypeDef,
  I,
>(
  schema: ZodSchema<T, D, I>,
) =>
  createMiddleware({
    input: empty_input_schema,
    middleware: async ({ request }) => ({ params: schema.parse(request.params) }),
  });

/**
 * Makes sure there is a verified access token and makes it available in the options object.
 * @throws an ApiError if the token is not valid
 */
export const require_and_verify_access_token_middleware = createMiddleware({
  input: empty_input_schema,
  middleware: async ({ request }) => {
    const csrf = getCsrfToken(request);
    const access_token = getAccessToken(request);
    const access_token_decoded = await verify(access_token, csrf);
    return { access_token, access_token_decoded };
  },
});

/**
 * Makes sure there is a verified refresh token and makes it available in the options object.
 * @throws an ApiError if the token is not valid
 */
export const require_and_verify_refresh_token_middleware = createMiddleware({
  input: empty_input_schema,
  middleware: async ({ request }) => {
    const refresh_token = getRefreshToken(request);
    const refresh_token_decoded = await verify(refresh_token, null, ['refresh']);
    return { refresh_token, refresh_token_decoded };
  },
});

/**
 * Gets the CSRF Token from the headers. Returns an empty string if the header is invalid
 */
export const csrf_token_middleware = createMiddleware({
  input: empty_input_schema,
  middleware: async ({ request }) => ({ csrf: getCsrfToken(request) }),
});

/**
 * Adds tools to get, set and clear cookies
 */
export const cookie_tools_middleware = createMiddleware({
  input: empty_input_schema,
  middleware: async ({ request, response }) => ({
    cookies: request.cookies,
    signed_cookies: request.signedCookies,
    setCookie: (name: string, val: string, options?: CookieOptions) =>
      options ? response.cookie(name, val, options) : response.cookie(name, val),
    clearCookie: (...args: Parameters<typeof response.clearCookie>) =>
      response.clearCookie(...args),
  }),
});

/**
 * Adds tools to get the request headers
 */
export const header_tools_middleware = createMiddleware({
  input: empty_input_schema,
  middleware: async ({ request }) => ({ headers: request.headers }),
});
