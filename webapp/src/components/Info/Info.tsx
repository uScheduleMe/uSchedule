import React from 'react';
import Container from 'react-bootstrap/Container';
import logo from '@src/logo96x96.png';
import { contributors, libraries } from './constants';
import { LinkMeta } from './types';
import { PageTitle } from '@components/PageTitle/PageTitle';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export const Info = (): JSX.Element => {
  const { t } = useTranslation(['info', 'common', 'schools']);
  const pageTitle = t('common:info');
  return (
    <Container>
      <PageTitle headTitle={pageTitle}>{pageTitle}</PageTitle>
      <p>
        <img src={logo} alt={t('common:uschedule_logo')} />
      </p>
      <p>
        <Trans
          t={t}
          i18nKey="info:purpose_description"
          components={{
            link_uottawa: <a target="_blank" rel="noopener noreferrer" href="https://uottawa.ca" />,
          }}
        />
      </p>

      <p>{t('info:functionality_description')}</p>

      <p>
        <Trans
          t={t}
          i18nKey="info:contact_info"
          components={{ link_feedback: <Link to="/feedback" /> }}
        />
      </p>

      <p>
        {t('info:github_org')}:&nbsp;
        <a href="https://github.com/uScheduleMe" target="_blank" rel="noreferrer">
          https://github.com/uScheduleMe
        </a>
      </p>

      <p>
        {t('info:contributors')}:
        <ul>
          {contributors.map((item: string) => (
            <li key={`contributor-${item}`}>{item}</li>
          ))}
        </ul>
      </p>

      <p>
        {t('info:libraries_used')}:
        <ul>
          {libraries.map((item: LinkMeta) => (
            <li key={`library-${item.name}`}>
              <a href={item.url} target="_blank" rel="noopener noreferrer">
                {item.name}
              </a>
            </li>
          ))}
        </ul>
      </p>
    </Container>
  );
};
