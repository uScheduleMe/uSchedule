import { AuthService } from '@services/Auth/Auth';
import axiosStatic, { AxiosInstance } from 'axios';
import { useEffect, useRef } from 'react';
import StatusCodes from '@utils/StatusCodes';
import createAuthRefreshInterceptor, { AxiosAuthRefreshOptions } from 'axios-auth-refresh';
import { useAxiosCancelManager } from './useAxiosCancelManager';

const authRefreshOptions: AxiosAuthRefreshOptions = {
  statusCodes: [StatusCodes.Unauthorized],
  pauseInstanceWhileRefreshing: false,
};

function failureReasonIsAuth(e: unknown): boolean {
  return !!(
    axiosStatic.isAxiosError(e) &&
    authRefreshOptions.statusCodes?.includes(e.response?.status ?? NaN)
  );
}

export function useAuthAutoRefresh(
  axios: AxiosInstance,
  callbacks: {
    onRefreshAttached?: () => unknown;
    onAuthFail?: () => unknown;
  } = {},
) {
  const cancelManager = useAxiosCancelManager();
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  const refreshAuth = async (e: unknown): Promise<void> => {
    const refreshWasSuccessful = await new AuthService(axios).refresh();
    if (!refreshWasSuccessful) {
      cancelManager.cancel('The user is not authorized!');
      cancelManager.reset();

      if (failureReasonIsAuth(e) && callbacksRef.current.onAuthFail) {
        callbacksRef.current.onAuthFail();
      }

      throw e;
    }
  };

  useEffect(() => {
    axios.interceptors.request.use((config) => ({
      ...config,
      cancelToken: cancelManager.token,
    }));
    createAuthRefreshInterceptor(axios, refreshAuth, authRefreshOptions);
    callbacksRef.current.onRefreshAttached?.();
  }, [axios]);
}
