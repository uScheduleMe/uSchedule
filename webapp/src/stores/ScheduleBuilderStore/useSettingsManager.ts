import { SettingsData } from '@models/SettingsData';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getLanguageConfig } from '@src/translations/supported-languages';

export function useSettingsManager(defaultSettings: SettingsData) {
  const { i18n } = useTranslation(['scheduler']);

  const [settings, setSettings] = useState<SettingsData>(defaultSettings);

  const updateSettings = (newSettings: Partial<SettingsData>): void => {
    setSettings((settings) => ({ ...settings, ...newSettings }));
  };

  // Change the time format when the language changes
  useEffect(() => {
    updateSettings({
      format_time_as_military:
        getLanguageConfig(i18n.language)?.default24h ?? settings.format_time_as_military,
    });
  }, [i18n.language]);

  return { settings, updateSettings };
}
