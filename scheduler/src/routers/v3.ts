import { Routing } from 'express-zod-api';
import { schedules_generate } from '@route_handlers/schedules_v2';
import {
  handleSignIn,
  identify_get,
  refresh_get,
  sign_out_get,
  verify_get,
} from '@route_handlers/auth';
import ci_router from './ci';
import debug_router from './debug';
import { Router } from 'express';
import passport from 'passport';
import { PROVIDER_CONFIG, passportRedirectWrapper } from '@id_providers';
import { asyncHandler } from '@utils/api_responses';
import { users_query } from '@route_handlers/users';
import {
  timetable_id_get,
  timetable_query_get,
  timetable_summaries_get,
} from '@route_handlers/timetables';
import { terms_query_get } from '@route_handlers/terms';
import { schedule_download_get, schedule_download_post } from '@route_handlers/schedules_v3';

const v3_router: Routing = {
  users: users_query,
  terms: terms_query_get,
  timetables: {
    query: timetable_query_get,
    summaries: timetable_summaries_get,
    ':id': timetable_id_get, // Variable route has to come last in its group
  },
  schedules: {
    generate: schedules_generate,
    download: schedule_download_post,
    // Variable route has to come last in its group
    ':id': {
      download: schedule_download_get,
    },
  },
  auth: {
    verify: verify_get,
    identify: identify_get,
    refresh: refresh_get,
    'sign-out': sign_out_get,
  },
  ci: process.env.ENABLE_CI_ENDPOINTS === 'true' ? ci_router : {},
  debug: process.env.ENABLE_DEBUG_ENDPOINTS === 'true' ? debug_router : {},
};

export default v3_router;

// eslint-disable-next-line @typescript-eslint/naming-convention
export const v3_id_providers_router = Router();

for (const [provider, config] of Object.entries(PROVIDER_CONFIG)) {
  v3_id_providers_router.get(
    config.paths.authenticate,
    passport.authenticate(provider, config.authenticate_options),
  );

  v3_id_providers_router.get(
    config.paths.redirect,
    passportRedirectWrapper(provider),
    asyncHandler(handleSignIn),
  );
}
