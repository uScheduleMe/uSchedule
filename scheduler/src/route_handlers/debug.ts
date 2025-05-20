import { z } from 'zod';
import {
  any_data_endpoints_factory,
  any_input_schema,
  cookie_tools_middleware,
  header_tools_middleware,
} from '@utils/express_zod_api';
import {
  ACCESS_COOKIE_CONFIG,
  CSRF_COOKIE_CONFIG,
  REFRESH_COOKIE_CONFIG,
  createAccessToken,
  createUnsignedToken,
  token_set_schema,
} from '@utils/tokens';

// Test token generation
export const token_get = any_data_endpoints_factory.addMiddleware(cookie_tools_middleware).build({
  method: 'get',
  input: any_input_schema,
  output: token_set_schema,
  handler: async ({ options: { setCookie } }) => {
    const tokens = await createAccessToken('74dc22d5-fc72-4e9e-8a02-a7e1948490ac', ['profile']);
    setCookie('test_access_token', tokens.jwt, ACCESS_COOKIE_CONFIG);
    setCookie('test_csrf', tokens.csrf, CSRF_COOKIE_CONFIG);
    return tokens;
  },
});

// Tell the browser to remove the access_token cookie (for testing in dev)
export const cookie_remove_access_get = any_data_endpoints_factory
  .addMiddleware(cookie_tools_middleware)
  .build({
    method: 'get',
    input: any_input_schema,
    output: z.object({ 'cookies-before-removal': z.any() }),
    handler: async ({ options: { clearCookie, cookies } }) => {
      clearCookie('access_token', { path: ACCESS_COOKIE_CONFIG.path });
      return { 'cookies-before-removal': cookies };
    },
  });

// Tell the browser to remove all the testing cookies (for testing in dev)
export const cookie_remove_get = any_data_endpoints_factory
  .addMiddleware(cookie_tools_middleware)
  .build({
    method: 'get',
    input: any_input_schema,
    output: z.object({ 'cookies-before-removal': z.any() }),
    handler: async ({ options: { clearCookie, cookies } }) => {
      clearCookie('access_token', { path: ACCESS_COOKIE_CONFIG.path });
      clearCookie('test_access_token', { path: ACCESS_COOKIE_CONFIG.path });
      clearCookie('refresh_token', { path: REFRESH_COOKIE_CONFIG.path });
      clearCookie('test_refresh_token', { path: REFRESH_COOKIE_CONFIG.path });
      clearCookie('csrf', { path: CSRF_COOKIE_CONFIG.path });
      clearCookie('test_csrf', { path: CSRF_COOKIE_CONFIG.path });
      clearCookie('test', { path: ACCESS_COOKIE_CONFIG.path });
      return { 'cookies-before-removal': cookies };
    },
  });

// Get the cookies being sent to the back-end (for testing in dev)
export const cookie_get = any_data_endpoints_factory.addMiddleware(cookie_tools_middleware).build({
  method: 'get',
  input: any_input_schema,
  output: z.object({ cookies: z.any(), signed_cookies: z.any() }),
  handler: async ({ options: { cookies, signed_cookies } }) => ({ cookies, signed_cookies }),
});

// CSRF Testing
export const csrf_get = any_data_endpoints_factory.addMiddleware(header_tools_middleware).build({
  method: 'get',
  input: any_input_schema,
  output: z.object({ csrf: z.any(), headers: z.any() }),
  handler: async ({ options: { headers } }) => ({ csrf: headers['x-csrf-token'], headers }),
});

// Get a service token for internal use between services
export const service_token_get = any_data_endpoints_factory.build({
  method: 'get',
  input: any_input_schema,
  output: z.object({ service_token: z.string() }),
  handler: async () => ({
    service_token: createUnsignedToken({ client_id: 'auth', scopes: ['service'] }),
  }),
});
