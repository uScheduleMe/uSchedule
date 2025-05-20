import React, { forwardRef } from 'react';
import Alert from 'react-bootstrap/Alert';
import { IconAlertProps } from './types';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import {
  faCheck,
  faExclamationCircle,
  faExclamationTriangle,
  faInfo,
} from '@fortawesome/free-solid-svg-icons';

const renderIconAlert = (
  props: IconAlertProps,
  ref: React.LegacyRef<HTMLDivElement> | undefined,
): JSX.Element => {
  const { children, icon, iconSize = '1x', variant = 'info', ...alertProps } = props;

  let defaultIcon: Required<IconAlertProps['icon']>;
  switch (variant) {
    case 'danger':
      defaultIcon = faExclamationTriangle;
      break;
    case 'warning':
      defaultIcon = faExclamationCircle;
      break;
    case 'success':
      defaultIcon = faCheck;
      break;
    default:
      defaultIcon = faInfo;
  }

  return (
    <Alert ref={ref} variant={variant} {...alertProps}>
      <div className="d-flex flex-row">
        <div className="flex-shrink-0 mr-3">
          <Icon icon={icon ?? defaultIcon} size={iconSize} fixedWidth />
        </div>
        <div className="flex-fill">{children}</div>
      </div>
    </Alert>
  );
};

type IconAlertType = React.ForwardRefExoticComponent<IconAlertProps> & {
  Link: typeof Alert.Link;
  Heading: typeof Alert.Heading;
};

const IconAlert = forwardRef<HTMLDivElement, IconAlertProps>(renderIconAlert) as IconAlertType;

IconAlert.Link = Alert.Link;
IconAlert.Heading = Alert.Heading;

export default IconAlert;
