import React, { useRef, useState } from 'react';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { Popover, OverlayTrigger, NavDropdown } from 'react-bootstrap';
import { OverlayTriggerRenderProps } from 'react-bootstrap/esm/OverlayTrigger';
import { faCaretRight } from '@fortawesome/free-solid-svg-icons';
import { OptionsDropdownProps, DropdownItem } from './types';

export const OptionsDropdown = <T extends Record<string, DropdownItem>>({
  options,
  state,
  className,
  default_icon,
  onValueChanged,
  ...props
}: OptionsDropdownProps<T>): JSX.Element => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [menuIsOpen, setMenuIsOpen] = useState<boolean>(false);

  const changeValue = (new_value: keyof T) => (): void => {
    onValueChanged(new_value);
    setMenuIsOpen(false);
  };

  const popover: JSX.Element = (
    <Popover id="selection-menu">
      <Popover.Content className="px-0 py-2 shadow">
        {Object.keys(options).map((v: string) => (
          <NavDropdown.Item className="menu-option" onClick={changeValue(v)} value={v} key={v}>
            {state === v ? (
              <>
                <Icon icon={faCaretRight} size="lg" className="mr-2 text-secondary" />
                {options[v]?.label}
              </>
            ) : (
              <span style={{ paddingLeft: '0.9375rem' }}>{options[v]?.label}</span>
            )}
          </NavDropdown.Item>
        ))}
      </Popover.Content>
    </Popover>
  );

  return (
    <div {...props} ref={containerRef} className={className}>
      <OverlayTrigger
        trigger="click"
        placement="bottom-end"
        overlay={popover}
        rootClose={true}
        show={menuIsOpen}
        onToggle={setMenuIsOpen}
        container={containerRef}
      >
        {(props: OverlayTriggerRenderProps): React.ReactNode => (
          <span {...props} className="c-pointer">
            <Icon icon={options[state ?? '']?.icon ?? default_icon} />
          </span>
        )}
      </OverlayTrigger>
    </div>
  );
};
