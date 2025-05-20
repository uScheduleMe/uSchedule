/**
 * Returns the query string from a URL, or an empty string if there is no query string
 * @param url the url to extract the query string from
 * @returns the query string (without the '?')
 */
export const extractQueryString = (url: string): string =>
  url.includes('?') ? url.substring(url.indexOf('?') + 1) : '';

/**
 * Make sure a value is not null or undefined
 *
 * Useful for filtering types in a map function
 * Adapted from https://stackoverflow.com/a/46700791/5850138
 * @param value value to check
 * @returns true if value is not undefined and not null, also confirms type
 */
export const notNullUndefined = <T>(value: T | null | undefined): value is T =>
  value !== null && value !== undefined;

/**
 * Make sure a value is truthy (not falsy)
 * Useful for the array .filter method
 * @param value value to check
 * @returns true if value truthy, false otherwise
 */
export const isTruthy = <T>(value: T | null | undefined): value is T => !!value;

/**
 * Make sure a value is falsy (not truthy)
 * Useful for the array .filter method
 * @param value value to check
 * @returns true if value falsy, false otherwise
 */
export const isFalsy = <T>(value: T | null | undefined): value is T => !value;

/**
 * Parses a string or undefined into a number, with fallback and minimum options.
 * @param value the string value to parse
 * @param fallback the fallback value if the string is undefined or not a number
 * @param min the minimum value to return
 * @returns the parsed value, or the min if the parsed value is lower
 */
export const parseStringToInt = (
  value: string | undefined,
  fallback: number,
  min: number = Number.NEGATIVE_INFINITY,
): number => {
  const parsed = Number.parseInt(value ?? 'NaN');
  return Math.max(min, Number.isNaN(parsed) ? fallback : parsed);
};
