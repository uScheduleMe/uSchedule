import { ReactNode } from 'react';
import { FontAwesomeIconProps } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-common-types';
import { AlertProps } from 'react-bootstrap/Alert';

export interface IconAlertProps extends AlertProps {
  children?: ReactNode;
  icon?: IconDefinition;
  iconSize?: FontAwesomeIconProps['size'];
  test?: string;
}
