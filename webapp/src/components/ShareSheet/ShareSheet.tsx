import React, { ChangeEvent, KeyboardEvent, useState } from 'react';
import InputGroup from 'react-bootstrap/InputGroup';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import { useTranslation } from 'react-i18next';
import { ShareSheetProps } from './types';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faShareAlt } from '@fortawesome/free-solid-svg-icons';
import { useService } from '@hooks/useService';
import { SharingService } from '@services/Sharing/SharingService';
import { useServiceMessageHandler } from '@hooks/useServiceMessageHandler';
import { toast } from 'react-toastify';
import { emailAddressIsValid } from './constants';
import { UserService } from '@services/User/User';
import { useAsync } from '@hooks/useAsync';
import { useUserStore } from '@stores/UserStore';
import { faTrashAlt } from '@fortawesome/free-regular-svg-icons';
import { User } from '@models/User';
import UserList from '@components/UserList/UserList';
import { noopSubmit } from '@utils/helpers';

const ShareSheet = (props: ShareSheetProps): JSX.Element => {
  const { t } = useTranslation(['scheduler', 'common']);
  const { title, onHide, closeButton = true, ...rest } = props;
  const modalProps = {
    centered: true,
    scrollable: true,
    ...rest,
  };

  const userService = useService(UserService);
  const [users, setUsers] = useAsync(
    () => userService.getCalendarSharedByMeUsers(),
    [],
    t('scheduler:error.share_sheet_user_list'),
  );

  const { user } = useUserStore();

  const sharingService = useService(SharingService);
  const messageHandler = useServiceMessageHandler();

  const [shareIsLoading, setShareIsLoading] = useState<boolean>(false);
  const [removeIsLoading, setRemoveIsLoading] = useState<boolean>(false);
  const [shareWithEmail, setShareWithEmail] = useState<string>('');
  const [shareWithEmailError, setShareWithEmailError] = useState<string>('');
  const handleShareWithFieldChange = (event: ChangeEvent<HTMLInputElement>): void => {
    if (!event.currentTarget.value) {
      setShareWithEmailError('');
    }
    setShareWithEmail(event.currentTarget.value);
  };

  const handleShare = async () => {
    if (!shareWithEmail) {
      return;
    }
    if (!emailAddressIsValid.test(shareWithEmail)) {
      setShareWithEmailError(t('scheduler:error.invalid_email'));
      return;
    }
    if (
      user?.emails.find((e) => e.email_address === shareWithEmail) ||
      users.find((u) => u.emails.find((e) => e.email_address === shareWithEmail))
    ) {
      toast.info(t('scheduler:already_has_calendar_access', { email: shareWithEmail }));
      return;
    }

    setShareWithEmailError('');

    setShareIsLoading(true);
    try {
      const sharedWithUser = await sharingService.shareCalendarUsingEmail(shareWithEmail);
      setUsers([...users, sharedWithUser]);
      setShareWithEmail('');
    } catch (e: unknown) {
      toast.info(t('scheduler:error.no_account_to_share_with', { email: shareWithEmail }));
    }
    setShareIsLoading(false);
  };

  const handleShareRemove = (user: User) => async () => {
    setRemoveIsLoading(true);
    try {
      await sharingService.deleteCalendarShare(user.uuid);
      setUsers((users) => users.filter((u) => u.uuid !== user.uuid));
    } catch (e: unknown) {
      messageHandler(e, t('scheduler:error.remove_share'), true);
    }
    setRemoveIsLoading(false);
  };

  const onHideInternal = (): void => {
    onHide && onHide();
    setShareWithEmail('');
    setShareWithEmailError('');
  };

  const handleKeyUp = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (shareIsLoading) {
      return;
    }
    // Key Values: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values
    switch (event.key) {
      case 'Enter':
        handleShare();
        break;
      default:
    }
  };

  return (
    <Modal {...modalProps} onHide={onHideInternal}>
      <Modal.Header closeButton={closeButton}>
        <Modal.Title as="h5" id="share-sheet-modal">
          {title ?? t('common:share')}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="flex-shrink-0 pb-2">
        <Form onSubmit={noopSubmit}>
          <Form.Group className="mb-0">
            <InputGroup className={shareWithEmailError ? 'is-invalid' : ''}>
              <Form.Control
                type="input"
                onKeyUp={handleKeyUp}
                data-cy="txt:share-with-email"
                placeholder={t('scheduler:add_by_email_placeholder')}
                value={shareWithEmail}
                onChange={handleShareWithFieldChange}
                isInvalid={!!shareWithEmailError}
                disabled={shareIsLoading}
              />
              <InputGroup.Append>
                <Button
                  onClick={handleShare}
                  disabled={!shareWithEmail}
                  data-cy="clk:submit-share-form"
                >
                  {shareIsLoading ? (
                    <Spinner animation="border" size="sm" role="status" />
                  ) : (
                    <Icon icon={faShareAlt} />
                  )}
                </Button>
              </InputGroup.Append>
            </InputGroup>
            <Form.Control.Feedback type="invalid">{shareWithEmailError}</Form.Control.Feedback>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Body className="pt-0">
        <UserList users={users}>
          {(user) => (
            <Button
              size="sm"
              variant="outline-danger"
              data-cy="clk:remove-share"
              className="ml-2"
              onClick={handleShareRemove(user)}
              disabled={removeIsLoading}
            >
              <Icon icon={faTrashAlt} className="mr-sm-2" />
              <span className="d-none d-sm-inline">{t('common:remove')}</span>
            </Button>
          )}
        </UserList>
      </Modal.Body>
    </Modal>
  );
};

export default ShareSheet;
