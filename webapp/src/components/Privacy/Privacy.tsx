import React from 'react';
import { PageTitle } from '@components/PageTitle/PageTitle';
import moment from 'moment';
import Container from 'react-bootstrap/Container';
import IconAlert from '@components/IconAlert/IconAlert';
import { Trans, useTranslation } from 'react-i18next';
import { LAST_UPDATED_DATE, LAST_UPDATED_FORMAT } from './Constants';
import { Link } from 'react-router-dom';

export const Privacy = (): JSX.Element => {
  const { t } = useTranslation(['privacy']);

  const pageTitle = t('privacy:page_title');
  const date = moment(LAST_UPDATED_DATE, LAST_UPDATED_FORMAT).format('LL');

  const retObj = { returnObjects: true } as const;
  const definitions = t('privacy:definitions', retObj);
  const personal_data = t('privacy:personal_data_items', retObj);
  const third_party_social_media = t('privacy:third_party_social_media_items', retObj);
  const cookies_types = t('privacy:cookies_types', retObj);
  const cookies_items = t('privacy:cookies_items', retObj);
  const data_use_items = t('privacy:data_use_items', retObj);
  const share_data_items = t('privacy:share_data_items', retObj);
  const legal_requirements = t('privacy:legal_requirements', retObj);

  return (
    <Container>
      <PageTitle headTitle={pageTitle}>{pageTitle}</PageTitle>
      <IconAlert>{t('privacy:translation_disclaimer')}</IconAlert>
      <p>{t('privacy:last_updated', { date })}</p>
      <p>
        <Trans
          t={t}
          i18nKey="privacy:intro_description"
          components={{
            link_generator: (
              <a
                href="https://www.privacypolicies.com/privacy-policy-generator/"
                target="_blank"
                rel="noreferrer"
              />
            ),
          }}
        />
      </p>
      <h2 className="mb-4">{t('privacy:interpretation_and_definitions_title')}</h2>
      <h3 className="mb-2">{t('privacy:interpretation_title')}</h3>
      <p>{t('privacy:interpretation')}</p>
      <h3>{t('privacy:definitions_title')}</h3>
      <p>{t('privacy:definitions_intro')}</p>
      <ul>
        {Object.entries(definitions).map(([key, definition]) => (
          <li key={key}>{definition}</li>
        ))}
      </ul>
      <h2 className="mb-4">{t('privacy:data_collection_title')}</h2>
      <h3 className="mb-3">{t('privacy:data_types_title')}</h3>
      <h4>{t('privacy:personal_data_title')}</h4>
      <p>{t('privacy:personal_data_intro')}</p>
      <ul>
        {Object.entries(personal_data).map(([key, item]) => (
          <li key={key}>{item}</li>
        ))}
      </ul>
      <h4>{t('privacy:usage_data_title')}</h4>
      <p>{t('privacy:usage_data')}</p>
      <h4>{t('privacy:third_party_social_media_title')}</h4>
      <p>{t('privacy:third_party_social_media_intro')}</p>
      <ul>
        {Object.entries(third_party_social_media).map(([key, item]) => (
          <li key={key}>{item}</li>
        ))}
      </ul>
      <p>{t('privacy:third_party_social_media_outro')}</p>
      <h4>{t('privacy:cookies_title')}</h4>
      <p>{t('privacy:cookies_types_intro')}</p>
      <ul>
        {Object.entries(cookies_types).map(([key, item]) => (
          <li key={key}>{item}</li>
        ))}
      </ul>
      <p>
        <Trans
          t={t}
          i18nKey="privacy:cookies_items_intro"
          components={{
            link_cookies: (
              <a
                href="https://www.privacypolicies.com/blog/cookies/"
                target="_blank"
                rel="noreferrer"
              />
            ),
          }}
        />
      </p>
      <p>{t('privacy:cookies_items_title')}</p>
      <ul>
        {Object.keys(cookies_items).map((key) => (
          <Trans
            t={t}
            i18nKey={`privacy:cookies_items.${key as keyof typeof cookies_items}` as const}
            parent="li"
            key={key}
          />
        ))}
      </ul>
      <p>{t('privacy:cookies_outro')}</p>
      <h3>{t('privacy:data_use_title')}</h3>
      <p>{t('privacy:data_use_intro')}</p>
      <ul>
        {data_use_items.map((item, key) => (
          <li key={key}>{item}</li>
        ))}
      </ul>
      <p>{t('privacy:share_data_intro')}</p>
      <ul>
        {share_data_items.map((item, key) => (
          <li key={key}>{item}</li>
        ))}
      </ul>
      <h3>{t('privacy:data_retention_title')}</h3>
      <p>{t('privacy:data_retention')}</p>
      <h3>{t('privacy:data_deletion_title')}</h3>
      <p>{t('privacy:data_deletion')}</p>
      <h3>{t('privacy:data_transfer_title')}</h3>
      <p>{t('privacy:data_transfer')}</p>
      <h3 className="mb-4">{t('privacy:data_disclosure_title')}</h3>
      <h4>{t('privacy:business_disclosure_title')}</h4>
      <p>{t('privacy:business_disclosure')}</p>
      <h4>{t('privacy:law_enforcement_title')}</h4>
      <p>{t('privacy:law_enforcement')}</p>
      <h4>{t('privacy:legal_requirements_title')}</h4>
      <p>{t('privacy:legal_requirements_intro')}</p>
      <ul>
        {Object.entries(legal_requirements).map(([key, item]) => (
          <li key={key}>{item}</li>
        ))}
      </ul>
      <h2>{t('privacy:child_privacy_title')}</h2>
      <p>{t('privacy:child_privacy')}</p>
      <h2>{t('privacy:outside_links_title')}</h2>
      <p>{t('privacy:outside_links')}</p>
      <h2>{t('privacy:changes_title')}</h2>
      <p>{t('privacy:changes')}</p>
      <h2>{t('privacy:contact_title')}</h2>
      <p>
        <Trans
          t={t}
          i18nKey="privacy:contact"
          components={{ link_feedback: <Link to="/feedback" /> }}
        />
      </p>
    </Container>
  );
};
