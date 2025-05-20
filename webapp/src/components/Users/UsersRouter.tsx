import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { NotFound } from '@components/NotFound/NotFound';
import { Calendar } from './Calendar/Calendar';
import { DraftSchedules } from './DraftSchedules/DraftSchedules';

const UsersRouter = (): JSX.Element => {
  return (
    <Routes>
      <Route path=":user_uuid/calendar" element={<Calendar />} />
      <Route path=":user_uuid/drafts" element={<DraftSchedules />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default UsersRouter;
