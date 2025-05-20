import { token_service_get, token_user_get } from '@route_handlers/ci';
import { Routing } from 'express-zod-api';

const ci_router: Routing = {
  token: {
    user: token_user_get,
    service: token_service_get,
  },
};

export default ci_router;
