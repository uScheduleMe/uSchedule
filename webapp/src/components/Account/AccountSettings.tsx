import { PageTitle } from '@components/PageTitle/PageTitle';
import { useUserStore } from '@stores/UserStore';
import React from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Accounts } from './AccountSettings.Accounts';
import { Danger } from './AccountSettings.Danger';

import { Profile } from './AccountSettings.Profile';

export const AccountSettings = (): JSX.Element => {
  const { t } = useTranslation(['account', 'common']);
  const { user, setUser } = useUserStore();
  return (
    <Container>
      <PageTitle headTitle={t('account:account_settings')}>
        {t('account:account_settings')}
      </PageTitle>
      {!user || (
        <Row>
          <Col className="mb-4" md="9" lg="7" xl="6">
            <Profile user={user} setUser={setUser} />
          </Col>
          <Col className="mb-4" md="9" lg="5" xl="4">
            <Accounts className="mb-4" user={user} />
          </Col>
          <Col className="mb-4" md="9" lg="7" xl="6">
            <Danger user={user} />
          </Col>
        </Row>
      )}
    </Container>
  );
};
