import {
  course_query_data_schema,
  course_summary_query_data_schema,
  url_param_id_schema,
} from '@route_handlers/schemas';
import DataAccess, { course_summary_schema } from '@services/DataAccess';
import ApiError from '@utils/errors/ApiError';
import { SCHED_3001 } from '@utils/scheduler_messages';
import StatusCodes from '@utils/StatusCodes';
import Courses, { Course, plain_course_schema } from '@courses';
import {
  api_endpoints_factory,
  empty_input_schema,
  getParseUrlParamsMiddleware,
} from '@utils/express_zod_api';
import { api_output_schema } from '@utils/api_responses';

export const course_query = api_endpoints_factory.build({
  method: 'get',
  input: course_query_data_schema,
  output: api_output_schema.extend({
    data: plain_course_schema,
  }),
  handler: async ({ input }) => {
    try {
      const courses = await DataAccess.getCourseByQuery(input);
      if (!courses.length) {
        throw new ApiError(SCHED_3001, StatusCodes.NOT_FOUND);
      }
      return {
        data: new Course(courses[0]).toJSON(),
      };
    } catch (e) {
      if (e instanceof ApiError && e.status_code === StatusCodes.NOT_FOUND) {
        throw new ApiError(
          {
            ...SCHED_3001,
            message: `The course "${input.subject_code} ${input.course_code}" is not offered in the ${input.season} ${input.year} term.`,
            vars: input,
          },
          StatusCodes.NOT_FOUND,
        );
      }
      throw e;
    }
  },
});

export const course = api_endpoints_factory
  .addMiddleware(getParseUrlParamsMiddleware(url_param_id_schema))
  .build({
    method: 'get',
    input: empty_input_schema,
    output: api_output_schema.extend({
      data: plain_course_schema,
    }),
    handler: async ({ options: { params } }) => ({
      data: (await Courses.getCourse(params.id)).toJSON(),
    }),
  });

export const courses_summaries_get = api_endpoints_factory.build({
  method: 'get',
  input: course_summary_query_data_schema,
  output: api_output_schema.extend({
    data: course_summary_schema.array(),
  }),
  handler: async ({ input }) => ({
    data: await DataAccess.getCourseSummaries(input),
  }),
});
