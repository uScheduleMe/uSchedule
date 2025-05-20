import React, { useState } from 'react';
import './UserOptionsMenu.css';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Spinner from 'react-bootstrap/Spinner';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faCog, faShareAlt } from '@fortawesome/free-solid-svg-icons';
import { faCalendarAlt, faCalendar } from '@fortawesome/free-regular-svg-icons';
import { UserOptionsMenuProps } from './types';
import { UserImage } from '@components/UserImage/UserImage';
import { Link } from 'react-router-dom';
import { useUserStore } from '@stores/UserStore';
import { toast } from 'react-toastify';
import { mergeClassNames } from '@utils/mergeClassNames';
import { useTranslation } from 'react-i18next';

export const UserOptionsMenu: React.FC<UserOptionsMenuProps> = (props: UserOptionsMenuProps) => {
  const { user, className, onOptionSelected, ...otherProps } = props;
  const { t } = useTranslation(['account', 'scheduler', 'common']);
  const classes = mergeClassNames('user-options-container shadow', className);
  const { signOut } = useUserStore();
  const [signOutIsLoading, setSignOutIsLoading] = useState<boolean>(false);

  const handleSignOut = async (): Promise<void> => {
    setSignOutIsLoading(true);
    if (await signOut()) {
      onOptionSelected && onOptionSelected();
    } else {
      toast.error(t('account:error.sign_out'));
      setSignOutIsLoading(false);
    }
  };

  return (
    <div {...otherProps} className={classes}>
      <div className="user-summary px-3 py-2 d-flex flex-row align-items-center text-wrap">
        <UserImage user={user} imgSize={88} className="flex-shrink-0 mr-2" />
        <span className="text-wrap flex-fix">{user?.display_name}</span>
      </div>
      <NavDropdown.Divider />
      <NavDropdown.Item
        className="py-2"
        as={Link}
        to={`/users/${user?.uuid}/calendar`}
        onClick={onOptionSelected}
        data-cy="clk:calendar-nav"
      >
        <Icon icon={faCalendarAlt} fixedWidth className="mr-2" />
        {t('common:calendar')}
      </NavDropdown.Item>
      <NavDropdown.Item
        as={Link}
        to={`/users/${user?.uuid}/drafts`}
        onClick={onOptionSelected}
        className="py-2"
        data-cy="clk:drafts-nav"
      >
        <Icon icon={faCalendar} fixedWidth className="mr-2" />
        {t('scheduler:draft_schedules_title')}
      </NavDropdown.Item>
      <NavDropdown.Item
        as={Link}
        to="/account/shares"
        onClick={onOptionSelected}
        className="py-2"
        data-cy="clk:shares-nav"
      >
        <Icon icon={faShareAlt} fixedWidth className="mr-2" />
        {t('account:shared_with_me')}
      </NavDropdown.Item>
      <NavDropdown.Divider />
      <NavDropdown.Item
        className="py-2"
        as={Link}
        to="/account/settings"
        onClick={onOptionSelected}
        data-cy="clk:settings-nav"
      >
        <Icon icon={faCog} fixedWidth className="mr-2" />
        {t('common:settings')}
      </NavDropdown.Item>
      <NavDropdown.Item
        className="py-2 text-danger"
        disabled={signOutIsLoading}
        onClick={handleSignOut}
      >
        {signOutIsLoading ? (
          <Spinner animation="border" size="sm" className="mr-2" role="status" />
        ) : (
          <Icon icon={faSignOutAlt} fixedWidth className="mr-2" />
        )}
        {t('account:sign_out')}
      </NavDropdown.Item>
    </div>
  );
};
