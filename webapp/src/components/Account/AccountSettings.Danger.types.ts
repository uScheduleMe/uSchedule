import { User } from '@models/User';
import { CardProps } from 'react-bootstrap';

export interface DangerProps extends CardProps {
  user: User;
}
