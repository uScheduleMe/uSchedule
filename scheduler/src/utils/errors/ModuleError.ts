import { ResponseMessage } from '../api_responses';

/**
 * The class ModuleError is used for creating errors for a particular response message.
 */
export default class ModuleError extends Error {
  /**
   * Create a new APIError
   * @param response_message The response message for this error
   * @param original (optional) The original error object, if this is used to wrap an existing error
   */
  constructor(
    public response_message: ResponseMessage,
    public original?: Error,
  ) {
    super(response_message.message);

    this.name = response_message.title;
  }
}
