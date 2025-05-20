/* eslint-disable @typescript-eslint/no-magic-numbers */
/**
 * Constants for common HTTP status codes and some helper functions
 *
 * @author David Dearden (david@uschedule.me)
 */

export default class StatusCodes {
  // 100 Level - Informational
  static Continue = 100;
  static SwitchingProtocols = 101;
  static Processing = 102;

  // 200 Level - Success
  static Ok: number = 200;
  static Created: number = 201;
  static NoContent: number = 204;

  // 300 Level - Redirection
  static MultipleChoices: number = 300;
  static MovedPermanently: number = 301;
  static Found: number = 302;
  static NotModified: number = 304;

  // 400 Level - Client Error
  static BadRequest: number = 400;
  static Unauthorized: number = 401;
  static Forbidden: number = 403;
  static NotFound: number = 404;
  static Conflict: number = 409;
  static PreconditionFailed: number = 412;

  // 500 Level - Server Error
  static InternalServerError: number = 500;
  static NotImplemented: number = 501;
  static BadGateway: number = 502;
  static ServiceUnavailable: number = 503;
  static GatewayTimeout: number = 504;

  /**
   * Tests whether the given status code is an 'Informational' code
   * @param code the status code to check
   * @return true if the code represents an 'Informational' message, false otherwise
   */
  static isInformational = (code: number): boolean => code >= 100 && code < 200;

  /**
   * Tests whether the given status code is a 'Success' code
   * @param code the status code to check
   * @return true if the code represents a 'Success' message, false otherwise
   */
  static isSuccess = (code: number): boolean => code >= 200 && code < 300;

  /**
   * Tests whether the given status code is a 'Redirection' code
   * @param code the status code to check
   * @return true if the code represents a 'Redirection' message, false otherwise
   */
  static isRedirection = (code: number): boolean => code >= 300 && code < 400;

  /**
   * Tests whether the given status code is a 'Client Error' code
   * @param code the status code to check
   * @return true if the code represents a 'Client Error' message, false otherwise
   */
  static isClientError = (code: number): boolean => code >= 400 && code < 500;

  /**
   * Tests whether the given status code is a 'Server Error' code
   * @param code the status code to check
   * @return true if the code represents a 'Server Error' message, false otherwise
   */
  static isServerError = (code: number): boolean => code >= 500 && code < 600;
}
