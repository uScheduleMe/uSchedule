/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, Dispatch, SetStateAction, DependencyList, useCallback } from 'react';
import StatusCodes from '@utils/StatusCodes';
import { toast } from 'react-toastify';

export type StatusOptions = 'idle' | 'pending' | 'success' | 'error';

export type useAsyncReturnType<T> = [T, Dispatch<SetStateAction<T>>, boolean, StatusOptions] & {
  value: T;
  setValue: Dispatch<SetStateAction<T>>;
  isLoading: boolean;
  status: StatusOptions;
};

const defaults = {
  enabled: true,
  maxLoadAttempts: 1,
  retryIf: (e: any): boolean => e?.response?.status !== StatusCodes.Unauthorized,
  dependencies: [] as DependencyList,
};

/**
 * A hook that wraps a promise function and provides state for the result,
 * status tracking, and side effect management.
 */
export const useAsync = <T>(
  asyncFunction: () => Promise<T>,
  initialValue: T | (() => T),
  onError: ((e: Error | any) => void) | string,
  {
    enabled = defaults.enabled,
    maxLoadAttempts = defaults.maxLoadAttempts,
    retryIf = defaults.retryIf,
    dependencies = defaults.dependencies,
  }: Partial<typeof defaults> = defaults,
): typeof ret => {
  const [status, setStatus] = useState<StatusOptions>('idle');
  const [value, setValue] = useState<T>(initialValue);

  const run = useCallback(async (loadAttempts = 1): Promise<void> => {
    try {
      if (status !== 'pending' && loadAttempts <= maxLoadAttempts) {
        setStatus('pending');
        const response = await asyncFunction();
        setValue(response);
        setStatus('success');
      }
    } catch (e: unknown) {
      if (loadAttempts < maxLoadAttempts && retryIf(e)) {
        run(loadAttempts + 1);
        return;
      }
      if (typeof onError === 'string') {
        toast.error(onError);
        console.error('There was a problem with an Async request. Error:', e);
      } else {
        onError(e);
      }
      setStatus('error');
    }
  }, dependencies);

  useEffect(() => {
    if (enabled) {
      run();
    }
  }, [enabled, ...dependencies]);

  const isLoading = status === 'idle' || status === 'pending';

  const ret = [value, setValue, isLoading, status] as useAsyncReturnType<T>;

  ret.value = value;
  ret.setValue = setValue;
  ret.isLoading = isLoading;
  ret.status = status;

  return ret;
};
