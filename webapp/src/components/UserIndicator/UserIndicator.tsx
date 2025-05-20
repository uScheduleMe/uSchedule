import React, { useRef, HTMLAttributes, useState, ReactNode, useEffect } from 'react';
import { SignInOptions } from '@components/SignInOptions/SignInOptions';
import { UserOptionsMenu } from '@components/UserOptionsMenu/UserOptionsMenu';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import { UserImage } from '@components/UserImage/UserImage';
import { useUserStore } from '@stores/UserStore';
import { mergeClassNames } from '@utils/mergeClassNames';
import { OverlayTriggerRenderProps } from 'react-bootstrap/esm/OverlayTrigger';
import { UpdatingPopover } from '@components/UpdatingPopover/UpdatingPopover';
import { useTranslation } from 'react-i18next';
import './UserIndicator.css';

export const UserIndicator = ({
  className,
  ...props
}: HTMLAttributes<HTMLElement>): JSX.Element => {
  const { t } = useTranslation(['account']);
  const classes = mergeClassNames('user-indicator', className);
  const containerRef = useRef<HTMLDivElement>(null);
  const { userIsLoading, userIsSignedIn, user } = useUserStore();
  const [show, setShow] = useState<boolean>(false);
  const [spinnerIsEnabled, setSpinnerIsEnabled] = useState<boolean>(false);

  const onOptionSelected = (): void => setShow(false);

  useEffect(() => {
    const wait_time_ms = 500;
    const timeout = setTimeout(() => setSpinnerIsEnabled(true), wait_time_ms);
    return () => clearTimeout(timeout);
  }, []);

  const popover: JSX.Element = (
    <UpdatingPopover id="user-indicator-menu" style={{ maxWidth: '22rem' }}>
      <Popover.Content className="p-0">
        {userIsSignedIn ? (
          <UserOptionsMenu user={user} onOptionSelected={onOptionSelected} className="py-2" />
        ) : (
          <SignInOptions className="p-3" />
        )}
      </Popover.Content>
    </UpdatingPopover>
  );

  return (
    <div {...props} ref={containerRef} className={classes}>
      <OverlayTrigger
        trigger="click"
        placement="bottom-end"
        overlay={popover}
        rootClose={true}
        container={containerRef}
        show={show}
        onToggle={setShow}
      >
        {(props: OverlayTriggerRenderProps): ReactNode => (
          <span {...props}>
            {userIsLoading ? (
              spinnerIsEnabled && (
                <Spinner animation="border" variant="light" className="loading-spinner">
                  <span className="sr-only">{t('account:attempt_user')}</span>
                </Spinner>
              )
            ) : userIsSignedIn ? (
              <UserImage
                user={user}
                imgSize={56}
                data-cy="clk:nav-user-icon"
                className="c-pointer"
              />
            ) : (
              <Button
                variant="outline-light"
                size="sm"
                className="mb-1 shadow-none text-nowrap"
                id="btn-sign-in"
                data-cy="clk:nav-sign-in"
              >
                {t('account:sign_in')}
              </Button>
            )}
          </span>
        )}
      </OverlayTrigger>
    </div>
  );
};
