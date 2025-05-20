import React from 'react';
import { NotFound } from '@components/NotFound/NotFound';
import { Routes, Route } from 'react-router-dom';
import { AccountSettings } from './AccountSettings';
import { SharedWithMe } from './SharedWithMe/SharedWithMe';

const AccountRouter = (): JSX.Element => {
  return (
    <Routes>
      <Route path="settings" element={<AccountSettings />} />
      <Route path="shares" element={<SharedWithMe />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AccountRouter;
