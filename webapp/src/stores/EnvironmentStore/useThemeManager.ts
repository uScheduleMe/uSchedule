import { useEffect } from 'react';
import { useMediaQuery } from '@material-ui/core';
import { themes } from './constants';
import { SiteThemeOptions, SiteThemes, ThemeManager } from './types';
import { useSyncLocalStorage } from '@hooks/useSyncLocalStorage';
import { theme_option_schema } from './schemas';

export default function useThemeManager(defaultTheme: SiteThemeOptions): ThemeManager {
  const system_dark_mode_is_active = useMediaQuery('(prefers-color-scheme: dark)');
  const LOCAL_STORAGE_KEY = 'theme';
  const [stored_theme, setThemePersistent] = useSyncLocalStorage(
    LOCAL_STORAGE_KEY,
    theme_option_schema,
    defaultTheme,
  );

  const theme_option: SiteThemeOptions = stored_theme ?? defaultTheme;
  const theme: SiteThemes =
    (theme_option === 'auto' && system_dark_mode_is_active) || theme_option === 'dark'
      ? 'dark'
      : 'light';

  const setThemeOption: ThemeManager['setThemeOption'] = (newValue) => {
    setThemePersistent((prevValue) =>
      typeof newValue === 'function' ? newValue(prevValue ?? defaultTheme) : newValue,
    );
  };

  // Activate the appropriate theme depending on the state of the theme variable
  useEffect(() => {
    document.querySelector('link[title=main]')?.setAttribute('href', themes[theme]);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return { theme, theme_option, setThemeOption, system_dark_mode_is_active };
}
