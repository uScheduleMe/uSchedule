import React from 'react';
import { useTranslation } from 'react-i18next';
import Container, { ContainerProps } from 'react-bootstrap/Container';
import logo from '@src/logo96x96.png';
import { PageTitle } from '@components/PageTitle/PageTitle';
import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import IconAlert from '@components/IconAlert/IconAlert';

export const ServerError: React.FC<ContainerProps> = (props: ContainerProps) => {
  const { t } = useTranslation(['server_error', 'common']);
  const pageTitle = t('server_error:server_error');

  return (
    <Container {...props}>
      <PageTitle headTitle={pageTitle}>{pageTitle}</PageTitle>
      <p>
        <img src={logo} alt={t('common:uschedule_logo')} />
      </p>
      <IconAlert variant="danger">{t('server_error:oops')}</IconAlert>
      <Button as={Link} variant="outline-info" className="mt-3" to="/feedback">
        {t('common:feedback')}
      </Button>
    </Container>
  );
};
