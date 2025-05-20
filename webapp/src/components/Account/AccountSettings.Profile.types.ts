import { User } from '@models/User';
import { CardProps } from 'react-bootstrap';

export interface ProfileProps extends CardProps {
  user: User;
  setUser?: (newUser: User) => void;
}
