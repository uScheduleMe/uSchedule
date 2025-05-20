import { Routing } from 'express-zod-api';
import {
  cookie_get,
  cookie_remove_access_get,
  cookie_remove_get,
  csrf_get,
  service_token_get,
  token_get,
} from '@route_handlers/debug';

const debug_router: Routing = {
  token: token_get,
  'cookie-remove-access': cookie_remove_access_get,
  'cookie-remove': cookie_remove_get,
  cookie: cookie_get,
  csrf: csrf_get,
  'service-token': service_token_get,
};

export default debug_router;
