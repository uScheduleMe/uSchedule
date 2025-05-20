import React from 'react';
import './UserImage.css';
import { UserImageProps } from './types';
import Gravatar from 'react-awesome-gravatar';
import { DEFAULT_IMG_SIZE_IN_PX } from './constants';
import { mergeClassNames } from '@utils/mergeClassNames';
import { useTranslation } from 'react-i18next';

export const UserImage: React.FC<UserImageProps> = ({
  user,
  className,
  imgSize,
  forwardRef,
  ...props
}: UserImageProps) => {
  const classes = mergeClassNames(`user-image-container color-${user?.getColourNum()}`, className);
  const size = imgSize ?? DEFAULT_IMG_SIZE_IN_PX;
  const { t } = useTranslation(['account']);

  return (
    <div ref={forwardRef} {...props} className={classes}>
      <span className="letter">{user?.initial}</span>
      <Gravatar email={user?.email ?? ''} options={{ size, default: 'blank', rating: 'pg' }}>
        {(url: string): JSX.Element => <img src={url} alt={t('account:user_profile')} />}
      </Gravatar>
    </div>
  );
};
