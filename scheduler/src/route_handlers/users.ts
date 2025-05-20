import {
  api_endpoints_factory,
  require_and_verify_access_token_middleware,
} from '@utils/express_zod_api';
import { COMMON_1103, api_output_schema } from '@utils/api_responses';
import { user_schema, users_filter_params_schema } from '@services/DatabaseService';
import ApiError from '@utils/errors/ApiError';
import StatusCodes from '@utils/StatusCodes';
import { uSchedule } from '@src/uSchedule';

export const users_query = api_endpoints_factory
  .addMiddleware(require_and_verify_access_token_middleware)
  .build({
    method: 'get',
    input: users_filter_params_schema,
    output: api_output_schema.extend({
      data: user_schema.array(),
    }),
    handler: async ({ input, options: { access_token_decoded } }) => {
      // currently we only allow fetching users that are shared with the current user
      if (input.shared_with !== access_token_decoded.payload.sub) {
        throw new ApiError(
          {
            ...COMMON_1103,
            message: 'Cannot fetch all users',
          },
          StatusCodes.FORBIDDEN,
        );
      }
      const users = await uSchedule.db_user_service.getUsers(input);
      return {
        data: users,
      };
    },
  });
