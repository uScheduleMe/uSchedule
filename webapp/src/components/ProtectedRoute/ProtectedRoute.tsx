import React from 'react';
import { useUserStore } from '@stores/UserStore';
import { NotAuthorized } from '@components/NotAuthorized/NotAuthorized';

export const ProtectedRoute: React.FC = ({ children }) => {
  const { userIsSignedIn, userIsLoading } = useUserStore();
  return userIsLoading ? <></> : userIsSignedIn ? <>{children}</> : <NotAuthorized />;
};
