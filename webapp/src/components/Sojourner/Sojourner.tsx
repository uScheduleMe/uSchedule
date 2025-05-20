import React from 'react';
import { PageTitle } from '@components/PageTitle/PageTitle';
import Container from 'react-bootstrap/Container';
import { useTranslation } from 'react-i18next';
import UnifiedSearch from './UnifiedSearch';
import { UniversalSearchResult } from '@services/Sojourner';

const Sojourner = (): JSX.Element => {
  const { t } = useTranslation(['sojourner']);

  const pageTitle = t('sojourner:page_title');

  const handleSearchItemsSelected = async (items: UniversalSearchResult[]) => {
    const item = items[0];
    // TODO: Do the thing with the item (See CS-343 & CS-344) instead of a console log
    console.log(`Search Item Selected: ${item.name}`);
  };

  return (
    <Container>
      <PageTitle headTitle={pageTitle}>{pageTitle}</PageTitle>
      <UnifiedSearch onItemsSelected={handleSearchItemsSelected} />
    </Container>
  );
};

export default Sojourner;
