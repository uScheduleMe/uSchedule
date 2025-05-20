import { isTruthy } from './helpers';

/**
 * Merge a list of className strings, which can each have a space separated list of class names.
 * @param classNames A list of className properties on a react components
 * @returns a string with the merged class names and duplicates removed
 */
export const mergeClassNames = (...classNames: (string | undefined)[]): string =>
  Array.from(
    classNames
      .filter(isTruthy)
      .flatMap((cn) => cn.split(' '))
      .reduce((set, c) => set.add(c), new Set<string>())
      .values(),
  ).join(' ');
