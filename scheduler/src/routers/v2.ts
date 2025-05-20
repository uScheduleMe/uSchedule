import { Routing } from 'express-zod-api';
import { schedules_generate } from '@route_handlers/schedules_v2';

const v2_router: Routing = {
  schedules: {
    generate: schedules_generate,
  },
};

export default v2_router;
