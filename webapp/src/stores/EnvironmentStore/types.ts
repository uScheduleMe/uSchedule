import { themes } from './constants';
import { z } from 'zod';
import { theme_option_schema } from './schemas';
import { Dispatch, SetStateAction } from 'react';

export interface EnvironmentStoreProviderProps {
  children: React.ReactNode;
}

/**
 * The concrete themes available within the app
 */
export type SiteThemes = keyof typeof themes;

/**
 * All the theme options that the user is able to select
 */
export type SiteThemeOptions = z.infer<typeof theme_option_schema>;

export type NewThemeOption = SetStateAction<SiteThemeOptions>;

export interface ThemeManager {
  theme: SiteThemes;
  theme_option: SiteThemeOptions;
  setThemeOption: Dispatch<NewThemeOption>;
  system_dark_mode_is_active: boolean;
}
