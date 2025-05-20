import { HTTP_404, file_output_schema } from '@utils/api_responses';
import {
  getParseUrlParamsMiddleware,
  require_and_verify_access_token_middleware,
  schedule_download_endpoints_factory,
} from '@utils/express_zod_api';
import {
  schedule_download_by_id_input_schema,
  schedule_download_by_skeleton_input_schema,
  url_param_id_schema,
} from './schemas_v3';
import ApiError from '@utils/errors/ApiError';
import { uSchedule } from '@src/uSchedule';

export const schedule_download_post = schedule_download_endpoints_factory.build({
  method: 'post',
  input: schedule_download_by_skeleton_input_schema,
  output: file_output_schema,
  handler: async ({ input: { format, timetable_skeletons } }) =>
    await uSchedule.schedule_download_service.getFileMeta(format, timetable_skeletons),
});

export const schedule_download_get = schedule_download_endpoints_factory
  .addMiddleware(getParseUrlParamsMiddleware(url_param_id_schema))
  .addMiddleware(require_and_verify_access_token_middleware)
  .build({
    method: 'get',
    input: schedule_download_by_id_input_schema,
    output: file_output_schema,
    handler: async ({ input, options: { params, access_token_decoded } }) => {
      const components = await uSchedule.db_schedule_service.getScheduleComponents(
        params.id,
        access_token_decoded.payload.sub,
      );

      if (!components.length) {
        throw new ApiError(HTTP_404);
      }

      return await uSchedule.schedule_download_service.getFileMetaByComponentsMeta(
        components,
        input.format,
      );
    },
  });
