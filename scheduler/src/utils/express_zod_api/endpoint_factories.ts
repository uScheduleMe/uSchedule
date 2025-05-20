import { EndpointsFactory } from 'express-zod-api';
import {
  any_data_result_handler,
  api_result_handler,
  schedule_download_result_handler,
} from './result_handlers';

/**
 * The standard api endpoint factory
 */
export const api_endpoints_factory = new EndpointsFactory(api_result_handler);

/**
 * The endpoint factory for unspecified 'any' data schemas
 */
export const any_data_endpoints_factory = new EndpointsFactory(any_data_result_handler);

/**
 * The endpoint factory for endpoints used to download schedules
 */
export const schedule_download_endpoints_factory = new EndpointsFactory(
  schedule_download_result_handler,
);
