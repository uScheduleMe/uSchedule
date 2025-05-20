import { useRef } from 'react';

const uninitialized = Symbol();

export function useConstant<T>(value: T | (() => T)): T {
  const valueRef = useRef<T | typeof uninitialized>(uninitialized);
  if (valueRef.current === uninitialized) {
    valueRef.current = value instanceof Function ? value() : value;
  }
  return valueRef.current;
}
