import React from 'react';
import './SignInOptions.css';
import { Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { mergeClassNames } from '@utils/mergeClassNames';
import { providerList, providerInfo, SignInOptionsProps } from './types';

export const SignInOptions: React.FC<SignInOptionsProps> = ({
  providers = [...providerList],
  className,
  ...props
}: SignInOptionsProps) => {
  const classes = mergeClassNames('sign-in-options-container', className);
  const { t } = useTranslation(['account']);

  const signInHandlerFactory =
    (provider: string) =>
    (e: React.MouseEvent<HTMLElement, MouseEvent>): void => {
      e.preventDefault();
      window.location.href = `/api/v3/auth/${provider}`;
    };

  return (
    <div {...props} className={classes}>
      {providers
        .sort((a, b) => a.localeCompare(b))
        .map((provider, index) => (
          <Button
            key={provider}
            className={`d-block px-3 py-2 ${
              index === providers.length - 1 ? 'mb-0' : 'mb-3'
            } btn-sign-in-${provider}`}
            variant="sign-in"
            onClick={signInHandlerFactory(provider)}
          >
            <img
              src={providerInfo[provider].image}
              className="brand-icon mr-3"
              alt={t('account:sign_in_with', { provider: providerInfo[provider].name })}
            />
            {t('account:sign_in_with', { provider: providerInfo[provider].name })}
          </Button>
        ))}
    </div>
  );
};
