import { User } from '@models/User';
import { HTMLAttributes } from 'react';

export interface UserOptionsMenuProps extends HTMLAttributes<HTMLElement> {
  user: User | null;
  onOptionSelected?: () => void;
}
