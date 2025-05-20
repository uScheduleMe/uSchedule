import React, { HTMLAttributes, useEffect } from 'react';
import { useSyncLocalStorage } from '@hooks/useSyncLocalStorage';
import { evGlobe } from '@icons/evericons/evGlobe';
import { useTranslation } from 'react-i18next';
import { LanguageConfig, supported_languages_config } from '@src/translations/supported-languages';
import { OptionsDropdown } from '@components/OptionsDropdown/OptionsDropdown';
import { LanguageChoice, language_choice_schema } from './schemas';

export const LanguageDropdown: React.FC<HTMLAttributes<HTMLElement>> = (
  props: HTMLAttributes<HTMLElement>,
) => {
  const { i18n, t } = useTranslation(['common']);
  const default_language: LanguageChoice = 'auto';
  const LOCAL_STORAGE_KEY = 'i18nextLng';
  const [language, setLanguage] = useSyncLocalStorage(
    LOCAL_STORAGE_KEY,
    language_choice_schema,
    default_language,
  );

  useEffect(() => {
    // useEffect to respond to changes from another session as well as the current one.
    // When language is undefined, i18next uses the default language
    i18n.changeLanguage(language === 'auto' ? undefined : language);
  }, [language]);

  const options: Record<LanguageChoice, Pick<LanguageConfig, 'label'>> = {
    ...supported_languages_config,
    auto: {
      label: t('common:auto'),
    },
  };

  return (
    <OptionsDropdown
      {...props}
      onValueChanged={setLanguage}
      options={options}
      state={language ?? default_language}
      default_icon={evGlobe}
    />
  );
};
