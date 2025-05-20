import React, { useState } from 'react';
import './AccountSettings.Accounts.css';
import { Button, Card } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { DangerProps } from './AccountSettings.Danger.types';
import { useService } from '@hooks/useService';
import { UserService } from '@services/User/User';
import { useUserStore } from '@stores/UserStore';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router';
import { ConfirmationModal } from '@components/ConfirmationModal/ConfirmationModal';
import { curry } from '@utils/helpers';
import { useServiceMessageHandler } from '@hooks/useServiceMessageHandler';

export const Danger: React.FC<DangerProps> = (props: DangerProps) => {
  const { user, ...cardProps } = props;
  const { t } = useTranslation(['account', 'common']);
  const userService = useService(UserService);
  const { signOut } = useUserStore();
  const navigate = useNavigate();
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const errorMsgHelper = useServiceMessageHandler();

  const deleteAccount = async () => {
    try {
      await userService.deleteUser(user);
      signOut();
      navigate('/');
      toast.success(t('account:success.delete_account'));
    } catch (e: unknown) {
      errorMsgHelper(e, t('account:error.delete_account_failed')).forEach((m) =>
        toast[m.type](m.message),
      );
    }
  };
  return (
    <>
      <ConfirmationModal
        onHide={curry(setModalVisible, false)}
        onConfirm={deleteAccount}
        confirmationMessage={t('account:delete_account_confirmation_prompt')}
        title={t('account:delete_account')}
        confirmButtonLabel={t('common:delete')}
        show={modalVisible}
      />
      <Card {...cardProps}>
        <Card.Header as="h4">{t('common:danger')}</Card.Header>
        <Card.Body>
          <p>{t('account:delete_account_explanation')}</p>
          <Button
            variant={'outline-danger'}
            onClick={curry(setModalVisible, true)}
            data-cy="clk:delete-account"
          >
            {t('account:delete_account')}
          </Button>
        </Card.Body>
      </Card>
    </>
  );
};
