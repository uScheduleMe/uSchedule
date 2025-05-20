import React from 'react';
import { useTranslation } from 'react-i18next';
import Container, { ContainerProps } from 'react-bootstrap/Container';
import logo from '@src/logo96x96.png';
import { PageTitle } from '@components/PageTitle/PageTitle';
import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import IconAlert from '@components/IconAlert/IconAlert';

export const NotFound: React.FC<ContainerProps> = (props: ContainerProps) => {
  const { t } = useTranslation(['not_found', 'common']);
  const pageTitle = t('not_found:page_not_found');

  return (
    <Container {...props}>
      <PageTitle headTitle={pageTitle}>{pageTitle}</PageTitle>
      <p>
        <img src={logo} alt={t('common:uschedule_logo')} />
      </p>
      <IconAlert variant="warning">{t('not_found:oops')}</IconAlert>
      <p>
        {t('not_found:looking_for')}
        <br />
        <Button as={Link} variant="outline-info" className="mt-3" to="/">
          {t('common:schedule_builder')}
        </Button>
      </p>
    </Container>
  );
};
