import React, { HTMLAttributes } from 'react';
import { faSun, faMoon, faAdjust } from '@fortawesome/free-solid-svg-icons';
import { OptionsDropdown } from '@components/OptionsDropdown/OptionsDropdown';
import { useTranslation } from 'react-i18next';
import { SiteThemeOptions, useEnvironmentStore } from '@stores/EnvironmentStore';
import { DropdownItem } from '@components/OptionsDropdown/types';

export const ThemeDropdown: React.FC<HTMLAttributes<HTMLElement>> = (
  props: HTMLAttributes<HTMLElement>,
) => {
  const { theme_option, setThemeOption } = useEnvironmentStore();
  const { t } = useTranslation(['theme', 'common']);

  const options: Record<SiteThemeOptions, DropdownItem> = {
    light: {
      icon: faSun,
      label: t('theme:light'),
    },
    dark: {
      icon: faMoon,
      label: t('theme:dark'),
    },
    auto: {
      icon: faAdjust,
      label: t('common:auto'),
    },
  };

  return (
    <OptionsDropdown
      {...props}
      onValueChanged={setThemeOption}
      options={options}
      state={theme_option}
      default_icon={faAdjust}
    />
  );
};
