import { useConstant } from '@hooks/useConstant';
import { useEffect } from 'react';
import { LocalSchedulerService } from './LocalScheduler';
import { releaseProxy } from 'comlink';

export function useLocalScheduler() {
  const localScheduler = useConstant(LocalSchedulerService.generatorWorkerFactory);

  useEffect(() => {
    return () => {
      localScheduler[releaseProxy]();
    };
  }, []);

  return localScheduler;
}
