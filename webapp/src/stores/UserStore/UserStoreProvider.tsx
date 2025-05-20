import React, { createContext, useContext, useMemo, useState } from 'react';
import { axiosApiConfig } from '@services/constants';
import { User } from '@models/User';
import { UserStoreProps } from './types';
import axiosStatic, { AxiosInstance } from 'axios';
import { useCurrentUserManager } from './useCurrentUserManager';
import { useEnvironmentStore } from '@stores/EnvironmentStore';
import { useAuthAutoRefresh } from './useAuthAutoRefresh';

/* eslint-disable @typescript-eslint/no-unused-vars */
const defaults = {
  userIsLoading: true,
  userIsSignedIn: false,
  user: null as User | null,
  signOut: async (): Promise<boolean> => false,
  setUser: (user: User): void => undefined,
  axios: {} as AxiosInstance,
};
/* eslint-enable @typescript-eslint/no-unused-vars */

const UserContext = createContext<typeof defaults>(defaults);

export const useUserStore = () => useContext(UserContext);

export function UserStoreProvider(props: UserStoreProps): JSX.Element {
  const {
    vars: { ENABLE_USER_ACCOUNTS },
  } = useEnvironmentStore();
  const axios = useMemo(() => axiosStatic.create(axiosApiConfig), []);
  const [refreshIsAttached, setRefreshIsAttached] = useState<boolean>(false);
  const currentUserIsEnabled = ENABLE_USER_ACCOUNTS === 'true' && refreshIsAttached;

  const current_user_manager = useCurrentUserManager(axios, defaults.user, currentUserIsEnabled);

  useAuthAutoRefresh(axios, {
    onAuthFail: () => current_user_manager.signOut(true),
    onRefreshAttached: () => setRefreshIsAttached(true),
  });

  return (
    <UserContext.Provider value={{ ...current_user_manager, axios }}>
      {props.children}
    </UserContext.Provider>
  );
}
