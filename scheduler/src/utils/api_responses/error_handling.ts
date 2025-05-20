import { NextFunction, Request, RequestHandler, Response } from 'express';
import StatusCodes, { isServerError } from '../StatusCodes';
import ApiError from '../errors/ApiError';
import { ZodError } from 'zod';
import { HTTP_404, HTTP_500 } from './http_messages';
import { createErrorResponse, sendResponse, zodToResponseMessages } from './utils';
import { ResponseData, ResponseMessage } from './types';
import ModuleError from '../errors/ModuleError';
import { COMMON_1003 } from './common_messages';
import { getLogger } from '@utils/logger';
import {
  InputValidationError,
  OutputValidationError,
  getMessageFromError,
  getStatusCodeFromError,
} from 'express-zod-api';

const logger = getLogger(__filename);

/**
 * Wrap an async request handlers and catch promise rejections
 *
 * Adapted from https://stackoverflow.com/a/51391081/5850138
 * @param handler the request handler that is being wrapped
 * @returns The result of the request handler
 */
export const asyncHandler =
  <Params, ResBody, ReqBody, ReqQuery, Locals extends Record<string, unknown>>(
    handler: RequestHandler<Params, ResBody, ReqBody, ReqQuery, Locals>,
  ) =>
  async (...args: Parameters<typeof handler>): Promise<unknown> => {
    const next_pos = 2;
    // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression -- Express does not have a typing for an async handler
    return Promise.resolve(handler(...args)).catch(args[next_pos]);
  };

/**
 * Middleware used to create and return a standardized JSON error result to the client
 * This should be setup as the last middleware in the Express app
 * @param e the error object
 * @param req the express Request object
 * @param res the express Response object
 * @param _next the express Next Function (required but unused)
 */
export const errorHandlerMiddleware = (
  e: Error,
  req: Request,
  res: Response,

  _next: NextFunction, // This unused argument must be defined so that Express knows this is an error handler
): void => {
  sendResponse(res, getErrorResponseData(e, req));
};

/**
 * Generate a ResponseData object from an error
 * @param e the error
 * @param req the express Request object
 * @returns a ResponseData object
 */
export const getErrorResponseData = (e: unknown, req?: Request): ResponseData<null> => {
  const base_message: ResponseMessage = {
    ...HTTP_500,
    vars: req
      ? {
          method: req.method,
          original_url: req.originalUrl,
        }
      : undefined,
  };

  if (e instanceof Error) {
    if (e instanceof InputValidationError) {
      logger.debug(e.message, { error: e });
      if (e.originalError instanceof ZodError) {
        return createErrorResponse(zodToResponseMessages(e.originalError), StatusCodes.BAD_REQUEST);
      }
      return createErrorResponse(
        {
          code: `valid.invalid_input`,
          type: 'error',
          title: 'Data Format Error',
          message: getMessageFromError(e),
        },
        getStatusCodeFromError(e),
      );
    }

    if (e instanceof OutputValidationError) {
      logger.error(e.message, { error: e });
      return createErrorResponse(COMMON_1003);
    }

    if (e instanceof ZodError) {
      logger.error(e.message, { error: e });
      return createErrorResponse(zodToResponseMessages(e));
    }

    if (e instanceof ApiError) {
      if (isServerError(e.status_code) && !e.is_logged) {
        logger.error(e.message, { error: e });
      }
      return createErrorResponse(e.response_messages, e.status_code);
    }

    if (e instanceof ModuleError) {
      const is_error = e.response_message.type === 'error';
      if (is_error) {
        logger.error(e.message, { error: e });
      }
      const status = is_error ? StatusCodes.INTERNAL_SERVER_ERROR : StatusCodes.OK;
      return createErrorResponse(e.response_message, status);
    }

    logger.error(e.message, { error: e });
    const message = {
      ...base_message,
      title: e.name,
      message: e.message,
    };
    return createErrorResponse(message);
  }

  if (typeof e === 'string') {
    logger.error(e);
    const message = {
      ...base_message,
      message: e,
    };
    return createErrorResponse(message);
  }

  // No one should be throwing things that are not an `Error` or derivative of `Error`, but, just in-case...
  logger.error('An unexpected error occurred. A non-`Error`-or-`string` was thrown.');
  return createErrorResponse(base_message);
};

/**
 * A 404 error handler middleware to return a JSON error message
 * @param req the express Request object
 * @param res the express Response object
 */
export const notFoundHandlerMiddleware = (req: Request, res: Response): void => {
  const message: ResponseMessage = {
    ...HTTP_404,
    message: `Cannot ${req.method} ${req.originalUrl}`,
    vars: {
      method: req.method,
      original_url: req.originalUrl,
    },
  };
  sendResponse(res, createErrorResponse(message, StatusCodes.NOT_FOUND));
};
