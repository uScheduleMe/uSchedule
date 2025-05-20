import { useRef } from 'react';
import axiosStatic, { CancelTokenSource } from 'axios';

export function useAxiosCancelManager() {
  const cancelTokenSourceRef = useRef<CancelTokenSource>(axiosStatic.CancelToken.source());

  return {
    cancel(message?: string) {
      cancelTokenSourceRef.current.cancel(message);
    },
    reset() {
      cancelTokenSourceRef.current = axiosStatic.CancelToken.source();
    },
    get token() {
      return cancelTokenSourceRef.current.token;
    },
  };
}
