import { FormEvent } from 'react';

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

export const curry =
  <T, U>(fn: (arg: U) => T, val: U) =>
  (): T =>
    fn(val);

export const noopSubmit = (e: FormEvent<HTMLFormElement>): void => e.preventDefault();
