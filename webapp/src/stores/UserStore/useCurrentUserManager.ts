import { useAsync } from '@hooks/useAsync';
import { User } from '@models/User';
import { AuthService } from '@services/Auth/Auth';
import axiosStatic, { AxiosInstance } from 'axios';
import StatusCodes from '@utils/StatusCodes';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useCallback } from 'react';

export function useCurrentUserManager(
  axios: AxiosInstance,
  defaultUser: User | null,
  enabled: boolean = true,
) {
  const { t } = useTranslation(['account']);

  const [user, setUser, userIsLoading] = useAsync<User | null>(
    async () => {
      const authService = new AuthService(axios);

      try {
        return await authService.getSignedInUser();
      } catch (e: unknown) {
        if (axiosStatic.isAxiosError(e) && e.response?.status === StatusCodes.Unauthorized) {
          const refreshWasSuccessful = await authService.refresh();
          if (!refreshWasSuccessful) {
            return null;
          }
          return await authService.getSignedInUser();
        }

        throw e;
      }
    },
    defaultUser,
    (e: unknown) => {
      if (axiosStatic.isAxiosError(e) && e.response?.status !== StatusCodes.Unauthorized) {
        toast.error(t('account:error.get_signed_in_user'));
        console.error('There was a problem with an Async request. Error:', e);
      }
    },
    {
      enabled,
      maxLoadAttempts: 3,
    },
  );

  const userIsSignedIn = user !== null;

  const signOut = useCallback(
    async (authFailure: boolean = false): Promise<boolean> => {
      if (userIsSignedIn && authFailure) {
        toast.error(t('account:error.session_expired'));
      }
      if (await new AuthService().signOut()) {
        setUser(null);
        return true;
      }
      return false;
    },
    [userIsSignedIn, setUser, t],
  );

  return { user, setUser, signOut, userIsLoading, userIsSignedIn };
}
