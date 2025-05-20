import {
  any_input_schema,
  api_endpoints_factory,
  getParseUrlParamsMiddleware,
} from '@utils/express_zod_api';
import { url_param_id_schema } from './schemas_v3';
import { HTTP_404, api_output_schema } from '@utils/api_responses';
import {
  course_timetable_schema,
  timetable_query_schema,
  timetable_summary_query_schema,
  timetable_summary_schema,
} from '@services/Timetable';
import ApiError from '@utils/errors/ApiError';
import { uSchedule } from '@src/uSchedule';

export const timetable_id_get = api_endpoints_factory
  .addMiddleware(getParseUrlParamsMiddleware(url_param_id_schema))
  .build({
    method: 'get',
    input: any_input_schema,
    output: api_output_schema.extend({
      data: course_timetable_schema,
    }),
    handler: async ({ options: { params } }) => {
      const data = await uSchedule.timetable_service.getTimetableById(params.id);
      if (!data) {
        throw new ApiError(HTTP_404);
      }
      return { data };
    },
  });

export const timetable_query_get = api_endpoints_factory.build({
  method: 'get',
  input: timetable_query_schema,
  output: api_output_schema.extend({
    data: course_timetable_schema,
  }),
  handler: async ({ input }) => {
    const data = await uSchedule.timetable_service.getTimetableByQuery(input);
    if (!data) {
      throw new ApiError(HTTP_404);
    }
    return { data };
  },
});

export const timetable_summaries_get = api_endpoints_factory.build({
  method: 'get',
  input: timetable_summary_query_schema,
  output: api_output_schema.extend({
    data: timetable_summary_schema.array(),
  }),
  handler: async ({ input }) => ({
    data: await uSchedule.timetable_service.searchForSummaries(input.search, input.term),
  }),
});
