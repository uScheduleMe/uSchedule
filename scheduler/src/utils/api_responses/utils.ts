import { MetaResult, ResponseData, ResponseMessage, StdBody } from './types';
import { Response } from 'express';
import StatusCodes, { StatusCode } from '../StatusCodes';
import { ZodError } from 'zod';

/**
 * A type guard to determine if an object has the minimum fields to be
 * considered a ResponseData or MixedResult type of object.
 * @param input an unknown object to check
 * @returns true if the input is an object with the required fields, false otherwise
 */
export const isResponseOrResult = (input: unknown): input is MetaResult | ResponseData =>
  input instanceof Object && input.hasOwnProperty('data') && input.hasOwnProperty('messages');

/**
 * Returns a result that might have partial data. If some data is missing, there will be
 * messages in the object, otherwise the messages will be an empty array.
 * @param data the response data
 * @param messages (optional) messages relating to issues with the response
 * @returns an object containing the data and messages
 */
export const createResult = <D>(
  data: D,
  messages: ResponseMessage | ResponseMessage[] = [],
): MetaResult<D> => ({
  data,
  messages: Array.isArray(messages) ? messages : [messages],
});

/**
 * Create a standard response object
 * @param data the data to include in the body of the response
 * @param messages a single or array of messages for the response [default: empty array]
 * @param status (optional) the HTTP status code for the response [default: 200]
 */
export const createResponse = <D>(
  data: D,
  messages: ResponseMessage | ResponseMessage[],
  status?: StatusCode,
): ResponseData<D> => ({
  is_meta: true,
  data,
  messages: Array.isArray(messages) ? messages : [messages],
  status,
});

/**
 * Create a response object with a null data value
 * @param messages a single or array of messages for the response [default: empty array]
 * @param status (optional) the HTTP status code for the response [default: 500]
 */
export const createErrorResponse = (
  messages: ResponseMessage | ResponseMessage[],
  status: StatusCode = StatusCodes.INTERNAL_SERVER_ERROR,
): ResponseData<null> => createResponse(null, messages, status);

/**
 * Send a response back to the client with a 204 status code and no body
 * @param res The Express response object
 * @returns The Express response object
 */
export function sendResponse(res: Response): Response<undefined>;

/**
 * Send a response back to the client.
 * @param res The Express response object
 * @param result The Result data object from a module that can return partial data
 * @returns The Express response object
 */
export function sendResponse<D>(res: Response, result: MetaResult<D>): Response<StdBody<D>>;

/**
 * Send a response back to the client.
 * @param res The Express response object
 * @param response The Response Data metadata object
 * @returns The Express response object
 */
export function sendResponse<D>(res: Response, response: ResponseData<D>): Response<StdBody<D>>;

/**
 * Send a response back to the client.
 * @param res The Express response object
 * @param data The data to be sent in the body
 * @returns The Express response object
 */
export function sendResponse<D>(res: Response, data: D): Response<StdBody<D>>;

/**
 * Send a response back to the client.
 * This function implements the signatures above.
 * @param res The Express response object
 * @param input The raw data, a Result data object or a Response Data metadata object
 * @returns The Express response object
 */
export function sendResponse<D>(
  res: Response,
  input?: D | MetaResult<D> | ResponseData<D>,
): Response<StdBody<D>> | Response<undefined> {
  if (!input) {
    // If we have no content at all, return a 204 status with no body
    return res.status(StatusCodes.NO_CONTENT).send();
  }

  // Handle the data bundled with metadata
  if (isResponseOrResult(input)) {
    // If the metadata is provided, use it to send the response
    if (input.is_meta) {
      return res
        .status(input.status ?? StatusCodes.OK)
        .json({ data: input.data, messages: input.messages });
    }

    // If the data is null and there are no messages, send back a 204 with no body
    if (input.data === null && !input.messages.length) {
      return res.status(StatusCodes.NO_CONTENT).send();
    }

    // Else we have a MixedResult with messages, return a partial content code with the data
    return res
      .status(input.messages.length ? StatusCodes.PARTIAL_CONTENT : StatusCodes.OK)
      .json({ ...input });
  }

  // Handle only the data supplied with no meta
  return res.status(StatusCodes.OK).json({ data: input, messages: [] });
}

export type DataSource = 'body_data' | 'query_param';

const pathToString = (path: Array<number | string>) =>
  path
    .map((p) => (typeof p === 'number' ? `[${p}]` : p))
    .join('.')
    .replace(/\.\[/g, '[');

export const zodToResponseMessages = (e: ZodError, source?: DataSource): ResponseMessage[] =>
  e.errors.map(({ path, code, message, ...rest }) => ({
    code: `valid.${code}`,
    type: 'error',
    title: 'Data Format Error',
    message,
    vars: { ...rest, source, field: pathToString(path) },
  }));
