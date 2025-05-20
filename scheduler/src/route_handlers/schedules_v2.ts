import {
  compressed_schedules_bundle_schema,
  schedule_generate_v2_body_data_schema,
} from '@route_handlers/schemas';
import ApiError from '@utils/errors/ApiError';
import { api_endpoints_factory } from '@utils/express_zod_api';
import { api_output_schema } from '@utils/api_responses';
import { main_pool } from '@src/initWorkerPool';
import { main_pool_executors } from '@workers/main_pool';

export const schedules_generate = api_endpoints_factory.build({
  method: 'post',
  input: schedule_generate_v2_body_data_schema,
  output: api_output_schema.extend({
    data: compressed_schedules_bundle_schema,
  }),
  handler: async ({ input }) => {
    const response_data = main_pool
      ? await main_pool.run('scheduleGeneratorV2', input)
      : await main_pool_executors.scheduleGeneratorV2(input);
    if (!response_data.data) {
      // Set this as 'logged' since the error will have been logged in the worker
      throw new ApiError(response_data.messages, response_data.status).setIsLogged();
    }
    return response_data;
  },
});
