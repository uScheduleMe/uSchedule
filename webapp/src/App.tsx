import React from 'react';
import { Scheduler } from '@components/Scheduler/Scheduler';
import { Routes, Route, BrowserRouter as Router } from 'react-router-dom';
import { Header } from '@components/Header/Header';
import { Footer } from '@components/Footer/Footer';
import { Info } from '@components/Info/Info';
import { Feedback } from '@components/Feedback/Feedback';
import { ToastContainer } from 'react-toastify';
import { NotFound } from '@components/NotFound/NotFound';
import './app.colors.css';
import 'react-toastify/dist/ReactToastify.css';
import { Helmet } from 'react-helmet';
import { ProtectedRoute } from '@components/ProtectedRoute/ProtectedRoute';
import AccountRouter from '@components/Account/AccountRouter';
import { Privacy } from '@components/Privacy/Privacy';
import UsersRouter from '@components/Users/UsersRouter';
import { AccountWithEmailExists } from '@components/SignInError/SignInError';
import { ServerError } from '@components/ServerError/ServerError';
import Sojourner from '@components/Sojourner/Sojourner';
import { useEnvironmentStore } from '@stores/EnvironmentStore';

const App = (): JSX.Element => {
  const {
    vars: { ENABLE_SOJOURNER },
    env_is_loaded,
  } = useEnvironmentStore();

  return (
    <Router>
      <Header />
      <Helmet titleTemplate="%s | uSchedule" defaultTitle="uSchedule" />
      <ToastContainer
        position="top-right"
        autoClose={6500}
        hideProgressBar={false}
        newestOnTop={false}
        draggable={false}
        closeOnClick={false}
        pauseOnFocusLoss
        pauseOnHover
      />
      <Routes>
        <Route path="/" element={<Scheduler />} />
        <Route path="info" element={<Info />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="feedback" element={<Feedback />} />
        <Route
          path="sojourner"
          element={
            !env_is_loaded ? <></> : ENABLE_SOJOURNER === 'true' ? <Sojourner /> : <NotFound />
          }
        />
        <Route
          path="account/*"
          element={
            <ProtectedRoute>
              <AccountRouter />
            </ProtectedRoute>
          }
        />
        <Route
          path="users/*"
          element={
            <ProtectedRoute>
              <UsersRouter />
            </ProtectedRoute>
          }
        />
        <Route path="messages/auth/email_exists" element={<AccountWithEmailExists />} />
        <Route path="messages/500" element={<ServerError />} />
        {/* The route to load if none of the above matches.  i.e. 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </Router>
  );
};

export default App;
