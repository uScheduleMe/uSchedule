import React from 'react';
import { PageTitle } from '@components/PageTitle/PageTitle';
import { useUserStore } from '@stores/UserStore';
import { useAsync } from '@hooks/useAsync';
import { useService } from '@hooks/useService';
import { UserService } from '@services/User/User';
import Container from 'react-bootstrap/Container';
import { useTranslation } from 'react-i18next';
import { UserCard } from './UserCard';
import { User } from '@models/User';
import IconAlert from '@components/IconAlert/IconAlert';

export const SharedWithMe = (): JSX.Element => {
  const { t } = useTranslation(['account']);
  const { user } = useUserStore();
  const userService = useService(UserService);
  const [users, , usersAreLoading] = useAsync(
    () => userService.getSharedWithMeUsers(),
    [],
    t('account:error.shared_users'),
    { enabled: !!user },
  );

  if (usersAreLoading) {
    return <></>;
  }

  return (
    <Container>
      <PageTitle headTitle={t('account:shared_with_me')}>{t('account:shared_with_me')}</PageTitle>
      {users.length ? (
        users
          .sort(User.compareByDisplayName)
          .map((sharedUser) => (
            <UserCard key={sharedUser.uuid} className="mb-3" user={sharedUser} />
          ))
      ) : (
        <IconAlert data-cy="val:no-shares">{t('account:no_shares_yet')}</IconAlert>
      )}
    </Container>
  );
};
