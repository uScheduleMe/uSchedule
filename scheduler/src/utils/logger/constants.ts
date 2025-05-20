/**
 * A map of the available log levels to their respective numerical levels
 */
export const levels = {
  critical: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
} as const;

/**
 * A map of the available log levels to their respective colour configuration
 */
export const colors = {
  critical: 'black redBG',
  error: 'red',
  warn: 'yellow',
  info: 'green',
  debug: 'cyan',
} as const;

// Import the utils after the levels have been defined, since utils imports constants to use the levels
import { validateLogLevel } from './utils';

/**
 * The log level to use for exported logs
 */
export const LOG_EXPORT_LEVEL = validateLogLevel(process.env.LOG_EXPORT_LEVEL);

/**
 * The log level to use for console logs
 */
export const LOG_CONSOLE_LEVEL = validateLogLevel(process.env.LOG_CONSOLE_LEVEL);

/**
 * The name of the service using this module
 */
export const SERVICE_NAME = process.env.SERVICE_NAME;

/**
 * THe list of export transports that are enabled
 */
export const ENABLED_TRANSPORTS: ReadonlyArray<string> =
  process.env.LOG_ENABLE_TRANSPORTS?.split(',') ?? [];
