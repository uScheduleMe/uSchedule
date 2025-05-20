import { z } from 'zod';

export interface LanguageConfig {
  label: string;
  default24h: boolean;
}

export const supported_languages = ['en', 'fr'] as const;

export const supported_language_schema = z.enum(supported_languages);

export type SupportedLanguages = (typeof supported_languages)[number];

export const supported_languages_config: Record<SupportedLanguages, LanguageConfig> = {
  en: {
    label: 'English',
    default24h: false,
  },
  fr: {
    label: 'Français',
    default24h: true,
  },
};

export const getLanguageConfig = (language: unknown): LanguageConfig | undefined => {
  const result = supported_language_schema.safeParse(language);
  return result.success ? supported_languages_config[result.data] : undefined;
};
