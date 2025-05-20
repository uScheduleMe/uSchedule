import { z } from 'zod';
import { any_data_endpoints_factory, any_input_schema } from '@utils/express_zod_api';
import { createAccessToken, getServiceToken, token_set_schema } from '@utils/tokens';
import { ci_token_user_query_data_schema } from './schemas';

export const token_user_get = any_data_endpoints_factory.build({
  method: 'get',
  input: ci_token_user_query_data_schema,
  output: token_set_schema,
  handler: async ({ input }) => await createAccessToken(input.sub, input.scopes.split(',')),
});

export const token_service_get = any_data_endpoints_factory.build({
  method: 'get',
  input: any_input_schema,
  output: z.object({ jwt: z.string() }),
  handler: async () => ({ jwt: getServiceToken() }),
});
