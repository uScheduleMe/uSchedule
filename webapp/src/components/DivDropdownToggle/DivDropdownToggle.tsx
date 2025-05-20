import React, { MutableRefObject } from 'react';

interface DivDropdownToggleProps {
  children: React.ReactNode;
  onClick: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  className?: string;
}

const RenderDivDropdownToggle = (
  props: DivDropdownToggleProps,
  ref: MutableRefObject<HTMLDivElement | null> | ((instance: HTMLDivElement | null) => void) | null,
): JSX.Element => (
  <div
    className={props.className}
    aria-haspopup="true"
    aria-expanded="false"
    ref={ref}
    onClick={props.onClick}
  >
    {props.children}
  </div>
);

export const DivDropdownToggle = React.forwardRef<HTMLDivElement, DivDropdownToggleProps>(
  RenderDivDropdownToggle,
);
