import React from 'react';
import { Container, Button } from 'react-bootstrap';
import { PageTitle } from '@components/PageTitle/PageTitle';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import IconAlert from '@components/IconAlert/IconAlert';

export const SchedulerOutage: React.FC = () => {
  const { t, i18n } = useTranslation(['scheduler', 'common']);
  const pageTitle = t('common:schedule_builder');

  return (
    <Container>
      <PageTitle headTitle={pageTitle}>
        {pageTitle}
        <Button
          variant="warning"
          className="btn-sm float-right ml-2 mt-1"
          onClick={() =>
            window.open(
              `https://www.paypal.com/donate/?hosted_button_id=L3GURR8W25VNQ&locale.x=${i18n.language}`,
              '_blank',
              'location=no,height=700,width=550,scrollbars=yes,status=yes',
            )
          }
        >
          {t('common:donate')}
        </Button>
        <Button
          as={Link}
          to="/feedback"
          variant="outline-info"
          className="btn-sm float-right ml-2 mt-1"
        >
          {t('common:feedback')}
        </Button>
      </PageTitle>
      <IconAlert variant="danger">{t('scheduler:outage_timetable_format')}</IconAlert>
    </Container>
  );
};
