import { useConstant } from '@hooks/useConstant';
import { EventParams, EventTrackerService } from '@services/EventTracker';
import { useEffect, useRef } from 'react';
import ReactGA from 'react-ga4';

interface SavedEvent {
  name: string;
  params: EventParams;
}

export function useGoogleAnalytics(envIsLoaded: boolean, gaId?: string) {
  const preInitEvents = useConstant<SavedEvent[]>(() => []);
  const shouldIgnoreEventsRef = useRef<boolean>(false);
  shouldIgnoreEventsRef.current = envIsLoaded && !gaId;

  useEffect(() => {
    if (envIsLoaded && gaId && !ReactGA.isInitialized) {
      ReactGA.initialize(gaId);
    }
    if (ReactGA.isInitialized) {
      let event: SavedEvent | undefined;
      while ((event = preInitEvents.shift())) {
        if (!shouldIgnoreEventsRef.current) {
          ReactGA.event(event.name, event.params);
        }
      }
    }
  }, [envIsLoaded, gaId]);

  const eventTracker = useConstant(
    () =>
      new EventTrackerService((name: string, params: EventParams) => {
        if (shouldIgnoreEventsRef.current) {
          return;
        }

        if (ReactGA.isInitialized) {
          ReactGA.event(name, params);
        } else {
          preInitEvents.push({ name, params });
        }
      }),
  );

  return eventTracker;
}
