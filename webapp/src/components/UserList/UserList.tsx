import React, { FC } from 'react';
import { UserImage } from '@components/UserImage/UserImage';
import { User } from '@models/User';
import ListGroup from 'react-bootstrap/ListGroup';
import { UserListProps } from './types';

const UserList: FC<UserListProps> = (props: UserListProps) => {
  const { users, children, variant = 'flush', ...listGroupProps } = props;
  return (
    <ListGroup variant={variant} {...listGroupProps}>
      {users.sort(User.compareByDisplayName).map((user) => (
        <ListGroup.Item key={user.uuid} className="d-flex flex-row align-items-center p-2">
          <UserImage
            user={user}
            className="flex-shrink-0 mr-3"
            style={{ fontSize: '2.25rem' }}
            imgSize={72}
          />
          <div className="break-word flex-fill">
            <h6 className="mb-0" data-cy="val:user-display-name">
              {user.display_name}
            </h6>
            <span className="text-muted small" data-cy="val:user-email">
              {user.email}
            </span>
          </div>
          {children && children(user)}
        </ListGroup.Item>
      ))}
    </ListGroup>
  );
};

export default UserList;
