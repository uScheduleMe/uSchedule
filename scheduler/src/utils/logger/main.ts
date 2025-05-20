import { addColors, createLogger } from 'winston';
import { getJsonFormat } from './formats';
import { Logger } from './types';
import path from 'path';
import { transports } from './transports';
import { LOG_EXPORT_LEVEL, SERVICE_NAME, colors, levels } from './constants';

/**
 * Adds the colours for our log levels to winston
 */
addColors(colors);

/**
 * The base logger with the default config. It is not meant to be used directly,
 * rather, it is meant to be extended with child loggers that add specific details.
 */
// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
export const base_logger = createLogger({
  levels,
  level: LOG_EXPORT_LEVEL,
  format: getJsonFormat(LOG_EXPORT_LEVEL),
  defaultMeta: { logger: `uschedule.${SERVICE_NAME}`, exception: '', traceback: '' },
  transports,
  exitOnError: false,
}) as unknown as Logger;

/**
 * Gets a child logger with the config from the base logger merged with the contextual details.
 * @param filename the fully qualified file name where the logger is being used
 * @param meta additional meta to be added to the logger
 * @returns a logger with the config adjusted for the current context
 */
export const getLogger = (filename: string, meta?: Record<string, string>): Logger => {
  const basename = path.basename(filename);
  const module = basename.substring(0, basename.lastIndexOf('.'));
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return base_logger.child({ module, pathname: filename, ...meta }) as unknown as Logger;
};
