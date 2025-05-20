import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './translations/en.json';
import fr from './translations/fr.json';

export const resources = {
  en,
  fr,
};

const defaultNS = 'common';

// See https://www.i18next.com/overview/typescript#custom-type-options for available options
export const typeableConfig = {
  defaultNS,
  fallbackNS: defaultNS,
  keySeparator: '.',
  nsSeparator: ':',
  pluralSeparator: '|',
  contextSeparator: '|',
} as const;

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    resources,
    ...typeableConfig,
    fallbackLng: 'en',
    ns: defaultNS,
    interpolation: { escapeValue: false },
    debug: process.env.REACT_APP_ENABLE_I18NEXT_DEBUG === 'true',
    detection: {
      caches: [],
    },
  });

export default i18n;
