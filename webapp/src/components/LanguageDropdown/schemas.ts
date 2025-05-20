import { supported_languages } from '@src/translations/supported-languages';
import { z } from 'zod';

export const language_choice_schema = z.enum([...supported_languages, 'auto']);

export type LanguageChoice = z.infer<typeof language_choice_schema>;
