import { Routing } from 'express-zod-api';
import { heartbeat } from '@utils/express_zod_api';
import v1_router from '@routers/v1';
import v2_router from './v2';
import v3_router from './v3';

const main_router: Routing = {
  heartbeat,
  v1: v1_router,
  v2: v2_router,
  v3: v3_router,
};

export default main_router;
