import { User } from '@models/User';
import { CardProps } from 'react-bootstrap';

export interface UserCardProps extends CardProps {
  user: User;
}
