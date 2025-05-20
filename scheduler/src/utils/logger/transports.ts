import { transports as winston_transports } from 'winston';
import * as Transport from 'winston-transport';
import DailyRotateFile from 'winston-daily-rotate-file';
import { ENABLED_TRANSPORTS, LOG_CONSOLE_LEVEL, SERVICE_NAME } from './constants';
import { getConsoleFormat } from './formats';

/**
 * The directory to save the log file into
 */
const LOG_DIR = process.env.LOG_DIR ?? '/var/log/uschedule';

/**
 * A list of transports that have been enabled.
 * The console logging transport is always added to the list.
 */
export const transports: Transport[] = [
  new winston_transports.Console({
    level: LOG_CONSOLE_LEVEL,
    format: getConsoleFormat(LOG_CONSOLE_LEVEL),
    handleExceptions: true,
    silent: process.env.DISABLE_LOGGING === 'true',
  }),
];

if (ENABLED_TRANSPORTS.includes('file')) {
  /**
   * A transport that saves the logs to a file based on the UTC date
   */
  transports.push(
    new DailyRotateFile({
      dirname: LOG_DIR,
      filename: `${SERVICE_NAME}.log.%DATE%`,
      datePattern: 'YYYY-MM-DD',
      utc: true,
      maxFiles: process.env.LOG_MAX_FILES,
      createSymlink: true,
      symlinkName: `${SERVICE_NAME}.log`,
      silent: process.env.DISABLE_LOGGING === 'true',
    }),
  );
}
