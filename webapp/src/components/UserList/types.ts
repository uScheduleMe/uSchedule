import { User } from '@models/User';
import { ListGroupProps } from 'react-bootstrap/ListGroup';

export interface UserListProps extends ListGroupProps {
  users: User[];
  children?: (user: User) => JSX.Element;
}
