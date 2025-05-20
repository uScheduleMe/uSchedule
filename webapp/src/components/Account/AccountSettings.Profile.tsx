import React, { useRef, useState } from 'react';
import { UserImage } from '@components/UserImage/UserImage';
import { Button, Card, Form } from 'react-bootstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faCheck, faPencilAlt, faTimes } from '@fortawesome/free-solid-svg-icons';
import { ProfileProps } from './AccountSettings.Profile.types';
import { User } from '@models/User';
import { useForceUpdate } from '@hooks/useForceUpdate';
import { PickByValue, WritableKeys } from 'utility-types';
import { useSimplePopover } from '@hooks/useSimplePopover';
import { toast } from 'react-toastify';
import { UserService } from '@services/User/User';
import { useService } from '@hooks/useService';
import { useTranslation } from 'react-i18next';
import { useServiceMessageHandler } from '@hooks/useServiceMessageHandler';
import { noopSubmit } from '@utils/helpers';

export const Profile: React.FC<ProfileProps> = (props: ProfileProps) => {
  const { user, setUser, ...cardProps } = props;
  const { t } = useTranslation(['account', 'common']);
  const forceUpdate = useForceUpdate();
  const [editMode, setEditMode] = useState<boolean>(false);
  const [editUser, setEditUser] = useState<User>(user);
  const { SPOverlay, ...popover } = useSimplePopover<HTMLElement>('account-settings-popover');
  const givenNameRef = useRef<HTMLInputElement>(null);
  const familyNameRef = useRef<HTMLInputElement>(null);
  const userService = useService(UserService);
  const errorMsgHelper = useServiceMessageHandler();

  const handleEdit = (): void => {
    setEditUser(user.clone());
    setEditMode(true);
  };

  const handleSave = async (): Promise<void> => {
    if (!editUser.given_name) {
      popover.show(t('account:error.given_name_required'), givenNameRef);
      return;
    }

    if (!editUser.family_name) {
      popover.show(t('account:error.family_name_required'), familyNameRef);
      return;
    }

    try {
      if (editUser.given_name !== user.given_name || editUser.family_name !== user.family_name) {
        const updatedUser = await userService.updateUser(editUser);
        setUser && setUser(updatedUser);
      }
      toast.success(t('account:success.profile_saved'));
      popover.hide();
      setEditMode(false);
    } catch (e: unknown) {
      errorMsgHelper(e, t('account:error.profile_save')).forEach((m) => toast[m.type](m.message));
    }
  };

  const handleCancel = (): void => {
    setEditUser(user);
    popover.hide();
    setEditMode(false);
  };

  const handleFieldChange =
    (field: WritableKeys<PickByValue<User, string>>) =>
    (event: React.ChangeEvent<HTMLInputElement>): void => {
      editUser[field] = event.currentTarget.value;
      forceUpdate();
    };

  const handleKeyUp = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    // Key Values: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values
    switch (event.key) {
      case 'Enter':
        handleSave();
        break;
      case 'Esc':
      case 'Escape':
        handleCancel();
        break;
      default:
    }
  };

  return (
    <Card ref={popover.containerRef} {...cardProps}>
      <Card.Header as="h4">
        {t('common:profile')}
        {editMode ? (
          <span className="float-right ml-2">
            <Button
              onClick={handleSave}
              className="mr-2"
              size="sm"
              variant="outline-primary"
              data-cy="clk:save-user"
            >
              <Icon icon={faCheck} className="mr-2" />
              {t('common:save')}
            </Button>
            <Button onClick={handleCancel} size="sm" variant="outline-secondary">
              <Icon icon={faTimes} className="mr-2" />
              {t('common:cancel')}
            </Button>
          </span>
        ) : (
          <Button
            onClick={handleEdit}
            className="float-right"
            size="sm"
            variant="outline-secondary"
            data-cy="clk:user-edit"
          >
            <Icon icon={faPencilAlt} className="mr-2" />
            {t('common:edit')}
          </Button>
        )}
      </Card.Header>
      <Card.Body className="text-center text-sm-left d-flex flex-column flex-sm-row align-items-center">
        <UserImage
          user={editUser}
          className="flex-shrink-0 mr-0 mr-sm-4 mb-3 mb-sm-0"
          style={{ fontSize: '5.5rem' }}
          imgSize={176}
        />
        <div className="text-wrap flex-fix">
          {editMode ? (
            <Form onSubmit={noopSubmit}>
              <Form.Control
                ref={givenNameRef}
                type="text"
                onChange={handleFieldChange('given_name')}
                onKeyUp={handleKeyUp}
                value={editUser.given_name}
                placeholder={t('account:given_name')}
                className="mb-2"
                required
                data-cy="txt:first-name"
              />
              <Form.Control
                ref={familyNameRef}
                type="text"
                onChange={handleFieldChange('family_name')}
                onKeyUp={handleKeyUp}
                value={editUser.family_name}
                placeholder={t('account:family_name')}
                required
                data-cy="txt:last-name"
              />
            </Form>
          ) : (
            <>
              <Card.Title data-cy="val:display-name">{user?.display_name}</Card.Title>
              <span className="text-secondary">{user?.email}</span>
            </>
          )}
        </div>
      </Card.Body>
      <SPOverlay />
    </Card>
  );
};
