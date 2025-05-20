import { User } from '@models/User';
import { CardProps } from 'react-bootstrap';

export interface AccountsProps extends CardProps {
  user: User | null;
}

export interface ProviderMeta {
  name: string;
  imageSrc: string;
}

export type IdentityProviders = Record<string, ProviderMeta>;
