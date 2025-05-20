/* eslint-disable @typescript-eslint/no-explicit-any */

import { TOptions } from 'i18next';

const reactI18Next: any = jest.createMockFromModule('react-i18next');

reactI18Next.useTranslation = (namespace: string[] | string) => {
  return {
    t: (
      key: string,
      options?: TOptions<Record<string, any>>,
    ): string | Record<string, string> | string[] => {
      let tx_key = `${key}-translated`;
      if (options?.returnObjects) {
        tx_key += '-object';
      }

      if (!key.indexOf(':') && namespace.length) {
        if (Array.isArray(namespace)) {
          tx_key = `${namespace[0]}:${tx_key}`;
        } else {
          tx_key = `${namespace}:${tx_key}`;
        }
      }

      // Return an array in the return objects case, since an array is also an object.
      // This does not work in ALL cases but it does work for our current needs.
      // See ticket https://uschedule.atlassian.net/browse/CS-215 regarding checking which type to return
      return options?.returnObjects ? [tx_key] : tx_key;
    },
    i18n: {
      language: 'cimode',
      changeLanguage: () => new Promise(() => undefined),
    },
  };
};

module.exports = reactI18Next;
