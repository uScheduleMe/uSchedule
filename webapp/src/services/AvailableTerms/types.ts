import { availableTermsSchema } from './constants';

/**
 * Enum listing relevant api endpoints consumed by this module
 *
 * @export
 * @enum {string}
 */
export enum AvailableTermsEndpoints {
  // TODO: remove trailing slash once the App-Router can handle this [CS-70]
  AvailableTerms = '/available-terms/',
}

/**
 * Schema of a single schedule object, usually nested in a list of ScheduleSets.
 */
export type AvailableTermsSchema = typeof availableTermsSchema._type;
