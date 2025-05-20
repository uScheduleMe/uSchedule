import React from 'react';
import { useTranslation } from 'react-i18next';
import Container, { ContainerProps } from 'react-bootstrap/Container';
import logo from '@src/logo96x96.png';
import { PageTitle } from '@components/PageTitle/PageTitle';
import { SignInOptions } from '@components/SignInOptions/SignInOptions';
import { useLocation } from 'react-router-dom';
import { isProvider } from '@components/SignInOptions/types';
import IconAlert from '@components/IconAlert/IconAlert';

export const AccountWithEmailExists: React.FC<ContainerProps> = (props: ContainerProps) => {
  const { t } = useTranslation(['account', 'common']);
  const pageTitle = t('account:sign_in_failed');
  const providersStr = new URLSearchParams(useLocation().search).get('existing_providers');
  const providers = (providersStr ?? '').split(',').filter(isProvider);

  return (
    <Container {...props}>
      <PageTitle headTitle={pageTitle}>{pageTitle}</PageTitle>
      <p>
        <img src={logo} alt={t('common:uschedule_logo')} />
      </p>
      <IconAlert variant="danger" className="mb-4">
        {t('account:error.try_signin_with_other_provider')}
      </IconAlert>
      <SignInOptions className="mb-4" providers={providers} />
    </Container>
  );
};
