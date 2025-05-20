import { useState } from 'react';

/**
 * A hook that returns a function which will trigger a re-render
 * of the calling component.
 */
export const useForceUpdate = (): (() => void) => {
  const [tracker, setTracker] = useState<boolean>(false);
  return (): void => setTracker(!tracker);
};
