import { LeveledLogMethod, Logger as WinstonLogger } from 'winston';
import { levels } from './constants';

/**
 * List of extra logger functions to remove because we don't support these levels
 */
type OmitList =
  | 'alert'
  | 'crit'
  | 'data'
  | 'emerg'
  | 'help'
  | 'http'
  | 'input'
  | 'notice'
  | 'prompt'
  | 'silly'
  | 'verbose'
  | 'warning';

/**
 * An interface that sets the available log level methods to match our supported levels
 */
export interface Logger extends Omit<WinstonLogger, OmitList> {
  critical: LeveledLogMethod;
}

/**
 * A union of the available log levels
 */
export type Levels = keyof typeof levels;
