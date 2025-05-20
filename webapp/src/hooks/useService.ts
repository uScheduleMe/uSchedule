import { useUserStore } from '@stores/UserStore';
import { Service } from '@services/types';
import { axiosApi } from '@services/constants';

/**
 * A hook that wraps a Service class and manages whether or not to use authentication
 */
export const useService = <T>(ServiceClass: Service<T>): T => {
  const { axios, userIsSignedIn } = useUserStore();
  return new ServiceClass(userIsSignedIn ? axios : axiosApi);
};
