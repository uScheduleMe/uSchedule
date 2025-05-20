import { useEffect, useRef, DependencyList, MutableRefObject } from 'react';

export const useFocus = <T extends HTMLElement>(
  guard: boolean = true,
  dependencies: DependencyList = [],
): MutableRefObject<T | null> => {
  const elementRef = useRef<T | null>(null);

  useEffect(() => {
    if (guard) {
      elementRef.current?.focus();
    }
  }, [guard, ...dependencies]);

  return elementRef;
};
