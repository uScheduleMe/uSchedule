import fetch, { FetchError, Response } from 'node-fetch';
import ApiError from '@utils/errors/ApiError';
import StatusCodes, { isSuccess } from '@utils/StatusCodes';
import { Json, ResponseSchema, response_schema } from './schemas';
import { ZodError } from 'zod';
import FetchHttpError from '@utils/errors/FetchHttpError';
import { COMMON_1000, COMMON_1001 } from '@utils/api_responses';

const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'] as const;

type Method = (typeof methods)[never];
type OmittedProperties =
  | 'arrayBuffer'
  | 'blob'
  | 'body'
  | 'buffer'
  | 'json'
  | 'text'
  | 'textConverted';

export interface ExtendedResponse extends Omit<Response, OmittedProperties> {
  body_obj?: ResponseSchema;
}

export interface FetcherOptions {
  body?: Array<Json> | Record<string, Json> | string;
  query?: ConstructorParameters<typeof URLSearchParams>[0];
  headers?: Record<string, string>;
  access_token?: string;
}

const isJsonParseError = (e: unknown) => e instanceof FetchError && e.type === 'invalid-json';

const isString = (item: unknown): item is string => typeof item === 'string';

/**
 * A wrapper for the fetch API that includes some common settings and returns JSON data
 * @param resource the url of the request
 * @param method the HTTP method
 * @param options options available in this wrapper
 */
const fetcher = async (
  resource: string,
  method: Method = 'GET',
  options: FetcherOptions = {},
): Promise<ExtendedResponse> => {
  const { body, headers, access_token, query } = options;
  const query_string = new URLSearchParams(query).toString();

  try {
    const res = await fetch(`${resource}?${query_string}`, {
      method,
      headers: {
        ...(body && !isString(body) ? { 'Content-Type': 'application/json' } : {}),
        ...(access_token ? { cookie: `access_token="${access_token}"` } : {}),
        ...headers,
      },
      body: !body || isString(body) ? body : JSON.stringify(body),
    });

    const res_ext: ExtendedResponse = res;

    // If there is no content, just return the response
    if (res.status === StatusCodes.NO_CONTENT) {
      return res_ext;
    }

    // If there IS content, process the body and check for HTTP errors
    try {
      res_ext.body_obj = response_schema.parse(await res.json());
    } catch (e: unknown) {
      if (e instanceof Error) {
        if (isJsonParseError(e) || e instanceof ZodError) {
          if (isSuccess(res.status)) {
            throw new ApiError(COMMON_1001, StatusCodes.INTERNAL_SERVER_ERROR, e);
          } else {
            throw new FetchHttpError([], res.status, e);
          }
        }
      }
      throw e;
    }

    if (!isSuccess(res.status)) {
      throw new FetchHttpError(res_ext.body_obj.messages, res.status);
    }

    return res_ext;
  } catch (e) {
    if (e instanceof FetchError) {
      throw new ApiError(COMMON_1000, StatusCodes.SERVICE_UNAVAILABLE, e);
    }
    throw e;
  }
};

type FetcherFunctions = Record<
  Lowercase<Method>,
  (resource: string, options?: FetcherOptions) => Promise<ExtendedResponse>
>;

const fetch_json = methods
  .map((method) => {
    return {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      method: method.toLowerCase() as Lowercase<Method>,
      func: async (resource: string, options?: FetcherOptions) =>
        fetcher(resource, method, options),
    };
  })
  .reduce((obj, { method, func }) => {
    obj[method] = func;
    return obj;
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/prefer-reduce-type-parameter
  }, {} as FetcherFunctions);

export default fetch_json;
