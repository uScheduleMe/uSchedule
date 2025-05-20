import { ZodError, ZodSchema, ZodTypeDef } from 'zod';
import ApiError from '@utils/errors/ApiError';
import { COMMON_1002 } from '@utils/api_responses';
import StatusCodes from '@utils/StatusCodes';
import { ExtendedResponse } from './fetch_json';
import { getLogger } from '@utils/logger';

const logger = getLogger(__filename);

export function expandEndpoint(
  api_root: string,
  endpoint: string,
  api_version: string,
  ep_params: Record<string, number | string> = {},
): string {
  const ep = endpoint.replace(/\{([^}]*)\}/gi, (_, key) => {
    const param_value = ep_params[key].toString();
    if (!param_value) {
      throw new Error('Missing parameter value');
    }
    return param_value;
  });
  return `${api_root}${api_version}${ep}/`;
}

export const parseData = <T, D extends ZodTypeDef, I>(
  schema: ZodSchema<T, D, I>,
  res: ExtendedResponse,
): T => {
  try {
    return schema.parse(res.body_obj?.data);
  } catch (e) {
    try {
      logger.debug(`Data parse error. \nData: ${JSON.stringify(res.body_obj?.data)}\nError: ${e}`);
    } catch (err) {
      logger.debug(`Data parse error. \nData: Unable to stringify data\nError: ${e}`);
    }

    if (e instanceof ZodError) {
      throw new ApiError(COMMON_1002, StatusCodes.INTERNAL_SERVER_ERROR, e);
    }
    throw e;
  }
};
