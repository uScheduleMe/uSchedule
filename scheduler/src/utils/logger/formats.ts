import { isTruthy } from '@utils/helpers';
import { format } from 'winston';
import { Format } from 'logform';
import path from 'path';

/**
 * Whether or not to log messages that are marked as private
 */
const SHOULD_LOG_PRIVATE = process.env.LOG_PRIVATE === 'true';

/**
 * A formatter that renames the timestamp meta to time and puts it first in the info object
 */
const renameTimestamp = format(({ timestamp: time, ...rest }) => ({ time, ...rest }));

/**
 * A formatter that capitalizes the log level in the log output
 */
const capitalLevel = format(({ level, ...rest }) => ({
  level: level.toUpperCase(),
  ...rest,
}));

/**
 * A formatter that creates the label meta from some other specific fields
 */
const createLabel = format((info) => ({
  ...info,
  label: [info.logger, info.module, info.function].filter(isTruthy).join(':'),
}));

/**
 * A formatter that keeps or filters out the private log entries based on the LOG_PRIVATE constant
 */
const ignorePrivate = format((info) => (info.private && !SHOULD_LOG_PRIVATE ? false : info));

/**
 * Extract stack trace and other details from an Error object
 * @param error the Error object
 * @param level the log level, used to determine whether or not to return the traceback
 * @returns an object containing the extracted details
 */
const getStackDetails = (error: Error, level: string = 'info') => {
  const traceback = error.stack;
  if (traceback) {
    const line = traceback.split('\n')[1];
    const match = line.match('\\((?<pathname>.+):(?<lineno>[^:]+):(?<charno>[^:]+)\\)');
    if (match) {
      const pathname = match.groups?.pathname ?? '';
      const basename = path.basename(pathname);
      return {
        module: basename.substring(0, basename.lastIndexOf('.')),
        pathname,
        lineno: match.groups?.lineno,
        exception: error.constructor.name,
        traceback: level === 'debug' ? traceback : '',
      };
    }
  }
  return { exception: error.constructor.name };
};

/**
 * A formatter that extracts details from an Error object and adds the details to the info
 * @param log_level the log level being used
 * @returns the formatter
 */
const expandError = format(({ error, ...rest }, { log_level }) =>
  error instanceof Error ? { ...rest, ...getStackDetails(error, log_level) } : rest,
);

/**
 * Creates a formatter for the console output
 * @param log_level the log level being used
 */
export const getConsoleFormat = (log_level: string = 'info'): Format =>
  format.combine(
    ignorePrivate(),
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    createLabel(),
    expandError({ log_level }),
    capitalLevel(),
    format.colorize(),
    format.printf(
      ({ level, message, timestamp, label, traceback }) =>
        `${timestamp} :: ${level} :: ${label ? `[${label}] ` : ''}${message}${
          traceback ? `\n${traceback}` : ''
        }`,
    ),
  );

/**
 * Creates a formatter for outputting log entries as json lines
 * @param log_level the log level being used
 */
export const getJsonFormat = (log_level: string = 'info'): Format =>
  format.combine(
    ignorePrivate(),
    format.timestamp({ format: 'isoDateTime' }),
    renameTimestamp(),
    expandError({ log_level }),
    capitalLevel(),
    format.json(),
  );
