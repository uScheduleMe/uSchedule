import React from 'react';
import { useTranslation } from 'react-i18next';
import Container, { ContainerProps } from 'react-bootstrap/Container';
import logo from '@src/logo96x96.png';
import { PageTitle } from '@components/PageTitle/PageTitle';
import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { SignInOptions } from '@components/SignInOptions/SignInOptions';
import IconAlert from '@components/IconAlert/IconAlert';
import { faHandPaper } from '@fortawesome/free-solid-svg-icons';

export const NotAuthorized: React.FC<ContainerProps> = (props: ContainerProps) => {
  const { t } = useTranslation(['not_authorized', 'common']);
  const pageTitle = t('not_authorized:access_denied');

  return (
    <Container {...props}>
      <PageTitle headTitle={pageTitle}>{pageTitle}</PageTitle>
      <p>
        <img src={logo} alt={t('common:uschedule_logo')} />
      </p>
      <IconAlert icon={faHandPaper} variant="danger" className="mb-4">
        {t('not_authorized:oops')}
      </IconAlert>
      <p className="mb-5">
        {t('not_authorized:looking_for')}
        <br />
        <Button as={Link} variant="outline-info" className="mt-3" to="/">
          {t('common:schedule_builder')}
        </Button>
      </p>
      <SignInOptions className="mb-4" />
    </Container>
  );
};
