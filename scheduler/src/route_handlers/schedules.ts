import {
  schedule_download_body_data_schema,
  schedule_download_query_data_schema,
  schedule_generate_body_data_schema,
  schedules_by_user_query_data_schema,
  url_param_id_schema,
} from '@route_handlers/schemas';
import ApiError from '@utils/errors/ApiError';
import {
  any_input_schema,
  api_endpoints_factory,
  getParseUrlParamsMiddleware,
  require_and_verify_access_token_middleware,
  schedule_download_endpoints_factory,
} from '@utils/express_zod_api';
import { api_output_schema, file_output_schema } from '@utils/api_responses';
import { main_pool } from '@src/initWorkerPool';
import Schedules, { extended_schedule_schema, formatted_schedules_schema } from '@schedules';
import DataAccess, {
  save_schedule_skeleton_schema,
  schedule_skeleton_schema,
} from '@services/DataAccess';
import { z } from 'zod';
import { DependsOnMethod } from 'express-zod-api';
import { main_pool_executors } from '@workers/main_pool';

export const schedules_generate = api_endpoints_factory.build({
  method: 'post',
  input: schedule_generate_body_data_schema,
  output: api_output_schema.extend({
    data: formatted_schedules_schema,
  }),
  handler: async ({ input }) => {
    const response_data = main_pool
      ? await main_pool.run('scheduleGenerator', input)
      : await main_pool_executors.scheduleGenerator(input);
    if (!response_data.data) {
      // Set this as 'logged' since the error was logged in the worker
      throw new ApiError(response_data.messages, response_data.status).setIsLogged();
    }
    return response_data;
  },
});

export const schedules = new DependsOnMethod({
  get: api_endpoints_factory.addMiddleware(require_and_verify_access_token_middleware).build({
    method: 'get',
    input: schedules_by_user_query_data_schema,
    output: api_output_schema.extend({
      data: extended_schedule_schema.array(),
    }),
    handler: async ({ input, options: { access_token } }) =>
      await Schedules.getSchedulesByUserUuid(input, access_token),
  }),

  post: api_endpoints_factory.addMiddleware(require_and_verify_access_token_middleware).build({
    method: 'post',
    input: save_schedule_skeleton_schema,
    output: api_output_schema.extend({
      data: extended_schedule_schema,
    }),
    handler: async ({ input, options: { access_token } }) => {
      const schedule_skeleton = await DataAccess.postSchedule(access_token, input);
      return await Schedules.expandScheduleSkeleton(schedule_skeleton);
    },
  }),
});

export const schedule = new DependsOnMethod({
  get: api_endpoints_factory
    .addMiddleware(getParseUrlParamsMiddleware(url_param_id_schema))
    .addMiddleware(require_and_verify_access_token_middleware)
    .build({
      method: 'get',
      input: any_input_schema,
      output: api_output_schema.extend({
        data: extended_schedule_schema,
      }),
      handler: async ({ options: { params, access_token } }) => {
        const skeleton = await DataAccess.getSchedule(params.id, access_token);
        return await Schedules.expandScheduleSkeleton(skeleton);
      },
    }),

  patch: api_endpoints_factory
    .addMiddleware(getParseUrlParamsMiddleware(url_param_id_schema))
    .addMiddleware(require_and_verify_access_token_middleware)
    .build({
      method: 'patch',
      input: schedule_skeleton_schema.partial(),
      output: api_output_schema.extend({
        data: extended_schedule_schema,
      }),
      handler: async ({ input, options: { params, access_token } }) => {
        const skeleton = await DataAccess.patchSchedule(params.id, access_token, input);
        return await Schedules.expandScheduleSkeleton(skeleton);
      },
    }),

  delete: api_endpoints_factory
    .addMiddleware(getParseUrlParamsMiddleware(url_param_id_schema))
    .addMiddleware(require_and_verify_access_token_middleware)
    .build({
      method: 'delete',
      input: any_input_schema,
      output: api_output_schema.extend({
        data: z.null(),
      }),
      handler: async ({ options: { params, access_token } }) => {
        await DataAccess.deleteSchedule(params.id, access_token);
        return { data: null };
      },
    }),
});

export const schedule_download_post = schedule_download_endpoints_factory.build({
  method: 'post',
  input: schedule_download_body_data_schema,
  output: file_output_schema,
  handler: async ({ input }) => await Schedules.downloadScheduleByQuery(input),
});

export const schedule_download_get = schedule_download_endpoints_factory
  .addMiddleware(getParseUrlParamsMiddleware(url_param_id_schema))
  .addMiddleware(require_and_verify_access_token_middleware)
  .build({
    method: 'get',
    input: schedule_download_query_data_schema,
    output: file_output_schema,
    handler: async ({ input, options: { params, access_token } }) =>
      await Schedules.downloadSchedule(params.id, input, access_token),
  });
