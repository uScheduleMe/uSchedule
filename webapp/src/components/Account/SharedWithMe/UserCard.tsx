import React from 'react';
import { UserImage } from '@components/UserImage/UserImage';
import { useTranslation } from 'react-i18next';
import { UserCardProps } from './UserCard.types';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt } from '@fortawesome/free-regular-svg-icons';
import { Link } from 'react-router-dom';

export const UserCard: React.FC<UserCardProps> = (props: UserCardProps) => {
  const { user, ...cardProps } = props;
  const { t } = useTranslation(['account']);
  return (
    <Card {...cardProps}>
      <Card.Body className="text-center text-sm-left d-flex flex-column flex-sm-row align-items-center">
        <UserImage
          user={user}
          className="flex-shrink-0 mr-0 mr-sm-4 mb-3 mb-sm-0"
          style={{ fontSize: '4rem' }}
          imgSize={128}
        />
        <div className="text-wrap flex-fix mr-0 mr-sm-auto">
          <Card.Title data-cy="val:display-name">{user.display_name}</Card.Title>
          <span className="text-secondary">{user.email}</span>
        </div>
        <Button
          as={Link}
          to={`/users/${user.uuid}/calendar`}
          data-cy="clk:view-calendar"
          className="btn mr-2 mt-3 mt-sm-0"
        >
          <Icon icon={faCalendarAlt} className="mr-2" />
          {t('account:view_calendar')}
        </Button>
      </Card.Body>
    </Card>
  );
};
