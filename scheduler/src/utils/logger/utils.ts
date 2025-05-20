import { isClientError, isServerError } from '@utils/StatusCodes';
import { NextFunction, Request, Response } from 'express';
import { levels } from './constants';
import { Logger } from './types';

/**
 * Validates a log level string, and returns a fallback level if the input level is invalid.
 * @param level the level to be validated
 * @returns the input level, or a fallback level
 */
export const validateLogLevel = (level?: string): string =>
  level && Object.keys(levels).includes(level) ? level : 'info';

/**
 * Logs a response for an Express app
 * @param req the Express request object
 * @param res the Express response object
 * @param logger the Winston logger
 */
export const logResponse = (req: Request, res: Response, logger: Logger): void => {
  const time = res.getHeader('X-Response-Time');
  const show_time = typeof time === 'string' && time ? ` in ${time}` : '';

  const message = `"${req.method} ${req.originalUrl} ${req.protocol}/${req.httpVersion}" ${res.statusCode}${show_time}`;

  switch (true) {
    case isClientError(res.statusCode):
      logger.warn(message);
      break;
    case isServerError(res.statusCode):
      logger.error(message);
      break;
    default:
      logger.info(message);
  }
};

/**
 * A helper middleware that attaches an onClose event handler to the response that
 * logs the response details when it closes.
 * @param logger the Winston logger to use
 * @returns the middleware function
 */
export const logResponseMiddleware =
  (logger: Logger) =>
  (req: Request, res: Response, next: NextFunction): void => {
    res.once('close', () => {
      logResponse(req, res, logger);
    });
    next();
  };
