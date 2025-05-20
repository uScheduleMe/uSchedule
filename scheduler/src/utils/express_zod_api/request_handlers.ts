import { z } from 'zod';
import { api_output_schema } from '@utils/api_responses';
import { api_endpoints_factory } from './endpoint_factories';
import { empty_input_schema } from './schemas';

export const heartbeat = api_endpoints_factory.build({
  method: 'get',
  input: empty_input_schema,
  output: api_output_schema.extend({
    data: z.object({
      ENV: z.string(),
      VERSION: z.string(),
    }),
  }),
  handler: async () => ({
    messages: [],
    data: {
      ENV: process.env.ENV ?? '',
      VERSION: process.env.VERSION ?? '',
    },
  }),
});
