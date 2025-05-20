/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

export interface AsProps {
  forwardRef: React.Ref<any>;
  [k: string]: any;
}

export interface ForwardRefWrapperProps {
  as: React.FC<AsProps>;
  children: React.ReactNode;
  [k: string]: any;
}

const RenderForwardRef = (
  { as: Component, children, ...props }: ForwardRefWrapperProps,
  ref: React.Ref<any>,
): JSX.Element => {
  return (
    <Component forwardRef={ref} {...props}>
      {children}
    </Component>
  );
};

export const ForwardRef = React.forwardRef<React.FC, ForwardRefWrapperProps>(RenderForwardRef);
