import { User } from '@models/User';
import { HTMLAttributes } from 'react';

export interface UserImageProps extends HTMLAttributes<HTMLElement> {
  user: User | null;
  imgSize?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  forwardRef?: React.Ref<any>;
}
