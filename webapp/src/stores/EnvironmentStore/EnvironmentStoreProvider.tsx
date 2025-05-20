import React, { createContext, useContext } from 'react';
import {
  EnvironmentStoreProviderProps,
  SiteThemes,
  SiteThemeOptions,
  NewThemeOption,
} from './types';
import { EnvironmentSchema } from '@services/Environment/types';
import useEnvironmentFile from './useEnvironmentFile';
import useThemeManager from './useThemeManager';
import { EventTrackerService } from '@services/EventTracker';
import { useGoogleAnalytics } from './useGoogleAnalytics';

/* eslint-disable @typescript-eslint/no-unused-vars */
const defaults = {
  vars: {} as EnvironmentSchema,
  theme: 'light' as SiteThemes,
  theme_option: 'auto' as SiteThemeOptions,
  setThemeOption: (new_theme_option: NewThemeOption): void => undefined,
  system_dark_mode_is_active: false,
  env_is_loaded: false,
  eventTracker: new EventTrackerService(() => undefined),
};
/* eslint-enable @typescript-eslint/no-unused-vars */

const EnvironmentContext = createContext<typeof defaults>(defaults);

export const useEnvironmentStore = () => useContext(EnvironmentContext);

export function EnvironmentStoreProvider(props: EnvironmentStoreProviderProps): JSX.Element {
  const env_file = useEnvironmentFile();
  const theme_manager = useThemeManager(defaults.theme_option);

  const eventTracker = useGoogleAnalytics(
    env_file.env_is_loaded,
    env_file.vars.GOOGLE_ANALYTICS_V4_ID,
  );

  return (
    <EnvironmentContext.Provider
      value={{
        ...env_file,
        ...theme_manager,
        eventTracker,
      }}
    >
      {props.children}
    </EnvironmentContext.Provider>
  );
}
