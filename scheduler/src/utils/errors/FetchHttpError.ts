import { ResponseMessage } from '../api_responses';
import ApiError from './ApiError';

/**
 *  An API Error used for HTTP errors (non 2xx code) returned from a fetch data query.
 */
export default class FetchHttpError extends ApiError {
  /**
   * Creates a new error object
   * @param response_messages The response messages being wrapped by this error
   * @param status_code The HTTP status code
   * @param original (optional) The original error object if this is used to wrap an existing error
   */
  constructor(
    response_messages: ResponseMessage | ResponseMessage[],
    status_code: number,
    original?: Error,
  ) {
    super(response_messages, status_code, original);

    if (!this.response_messages.length) {
      this.name = 'HttpError';
      this.message = 'HttpError';
    }
  }
}
