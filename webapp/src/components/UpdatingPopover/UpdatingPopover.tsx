/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect } from 'react';
import { Popover, PopoverProps } from 'react-bootstrap';

const RenderUpdatingPopover = (
  { popper, children, show: _, ...props }: PopoverProps,
  ref: React.Ref<unknown>,
): JSX.Element => {
  useEffect(popper.scheduleUpdate, [children, popper]);

  return (
    <Popover ref={ref} {...props}>
      {children}
    </Popover>
  );
};

export const UpdatingPopover = React.forwardRef<HTMLElement, PopoverProps>(RenderUpdatingPopover);
