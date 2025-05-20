/* eslint-disable @typescript-eslint/no-magic-numbers */

/**
 * Tests whether the given status code is an 'Informational' code
 * @param code the status code to check
 * @returns true if the code represents an 'Informational' message, false otherwise
 */
export const isInformational = (code: number): boolean => code >= 100 && code < 200;

/**
 * Tests whether the given status code is a 'Success' code
 * @param code the status code to check
 * @returns true if the code represents a 'Success' message, false otherwise
 */
export const isSuccess = (code: number): boolean => code >= 200 && code < 300;

/**
 * Tests whether the given status code is a 'Redirection' code
 * @param code the status code to check
 * @returns true if the code represents a 'Redirection' message, false otherwise
 */
export const isRedirection = (code: number): boolean => code >= 300 && code < 400;

/**
 * Tests whether the given status code is a 'Client Error' code
 * @param code the status code to check
 * @returns true if the code represents a 'Client Error' message, false otherwise
 */
export const isClientError = (code: number): boolean => code >= 400 && code < 500;

/**
 * Tests whether the given status code is a 'Server Error' code
 * @param code the status code to check
 * @returns true if the code represents a 'Server Error' message, false otherwise
 */
export const isServerError = (code: number): boolean => code >= 500 && code < 600;
