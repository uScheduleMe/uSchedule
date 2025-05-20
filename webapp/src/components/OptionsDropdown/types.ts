import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { HTMLAttributes } from 'react';

export interface DropdownItem {
  icon?: IconProp;
  label: string;
}

export interface OptionsDropdownProps<T extends Record<string, DropdownItem>>
  extends HTMLAttributes<HTMLElement> {
  options: T;
  state?: string;
  default_icon: IconProp;
  onValueChanged(new_value: keyof T): void;
}
