import { ResponseMessage } from '../api_responses';
import StatusCodes from '../StatusCodes';

/**
 * The class ApiError is used for creating errors which have a status_code to be returned to the client.
 */
export default class ApiError extends Error {
  /**
   * The HTTP status code to be sent to the client
   */
  status_code: number;

  /**
   * The original error object if this is used to wrap an existing error
   */
  original_error: Error | undefined;

  /**
   * The response_messages in the standard format
   */
  response_messages: ResponseMessage[];

  /**
   * Prevent the error from being logged
   */
  is_logged: boolean;

  /**
   * Create a new error object
   * @param response_messages The response messages being wrapped by this error
   * @param status_code (optional) The HTTP status code to be used (defaults to 500: Server Error)
   * @param original_error (optional) The original error object if this is used to wrap an existing error
   */
  constructor(
    response_messages: ResponseMessage | ResponseMessage[],
    status_code: number = StatusCodes.INTERNAL_SERVER_ERROR,
    original_error?: unknown,
  ) {
    const messages = Array.isArray(response_messages) ? response_messages : [response_messages];

    super(messages.length ? messages[0].message : 'ApiError');

    this.name = messages.length ? messages[0].title : 'ApiError';
    this.response_messages = messages;
    this.status_code = status_code;
    if (original_error instanceof Error) {
      this.original_error = original_error;
    }
    this.is_logged = false;
  }

  /**
   * Sets the no is logged flag to true
   * @returns the Error object that this was called on
   */
  setIsLogged(): ApiError {
    this.is_logged = true;
    return this;
  }
}
