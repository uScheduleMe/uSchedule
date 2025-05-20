import { Routing } from 'express-zod-api';
import { course, course_query, courses_summaries_get } from '@route_handlers/courses';
import {
  schedule,
  schedule_download_get,
  schedule_download_post,
  schedules,
  schedules_generate,
} from '@route_handlers/schedules';

const v1_router: Routing = {
  courses: {
    summaries: courses_summaries_get,
    query: course_query,
    ':id': course, // Variable route has to come last in its group
  },
  schedules: {
    generate: schedules_generate,
    download: schedule_download_post,
    '': schedules,
    // Variable route has to come last in its group
    ':id': {
      '': schedule,
      download: schedule_download_get,
    },
  },
};

export default v1_router;
