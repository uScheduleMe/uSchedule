import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import * as serviceWorker from './serviceWorker';
import i18n from './i18n';
import moment from 'moment';
import 'moment/locale/fr';
import { I18nextProvider } from 'react-i18next';
import { EnvironmentStoreProvider } from '@stores/EnvironmentStore';
import { UserStoreProvider } from '@stores/UserStore';
import { ScheduleBuilderStoreProvider } from '@stores/ScheduleBuilderStore';

// Set default moment locale to be the same as the initial i18n locale
// (would be latest import otherwise i.e. 'fr')
moment.locale(i18n.language);

// Change the moment locale when the language is changed in i18Next
i18n.on('languageChanged', (lng: string) => moment.locale(lng));

const AppWithStore = (
  <React.StrictMode>
    <EnvironmentStoreProvider>
      <I18nextProvider i18n={i18n}>
        <UserStoreProvider>
          <ScheduleBuilderStoreProvider>
            <App />
          </ScheduleBuilderStoreProvider>
        </UserStoreProvider>
      </I18nextProvider>
    </EnvironmentStoreProvider>
  </React.StrictMode>
);

ReactDOM.render(AppWithStore, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
