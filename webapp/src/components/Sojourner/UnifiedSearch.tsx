import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AsyncTypeahead, Highlighter } from 'react-bootstrap-typeahead';
import { useService } from '@hooks/useService';
import { SojournerService, UniversalSearchResult } from '@services/Sojourner';
import { UnifiedSearchProps } from './UnifiedSearch.types';
import { useServiceMessageHandler } from '@hooks/useServiceMessageHandler';
import { toast } from 'react-toastify';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import './UnifiedSearch.css';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';

const UnifiedSearch = (props: UnifiedSearchProps): JSX.Element => {
  const { t } = useTranslation(['sojourner', 'common']);
  const { is_parent_loading = false, onItemsSelected, ...otherProps } = props;
  const errorMsgHelper = useServiceMessageHandler();

  const SEARCH_MIN_LENGTH = 3;
  const [is_loading, setIsLoading] = useState(false);
  const sojournerService = useService(SojournerService);
  const typeaheadRef = useRef<AsyncTypeahead<UniversalSearchResult>>(null);
  const [searchResults, setSearchResults] = useState<UniversalSearchResult[]>([]);

  const handleSearch = async (search: string) => {
    setIsLoading(true);
    try {
      const results = await sojournerService.search(search);
      setSearchResults(results);
    } catch (e: unknown) {
      errorMsgHelper(e, t('sojourner:error.search_failure')).forEach((m) =>
        toast[m.type](m.message),
      );
    }
    setIsLoading(false);
  };

  const onSearchItemsSelected = async (selected: UniversalSearchResult[]) => {
    // Clear the search bar
    typeaheadRef?.current?.clear();
    // Focus on the search bar
    typeaheadRef?.current?.focus();
    // Execute the action passed in from the props
    if (onItemsSelected) {
      await onItemsSelected(selected);
    }
  };

  const renderMenuItemChildren = (
    item: UniversalSearchResult,
    { text = '' }: { text?: string },
  ): JSX.Element => (
    <>
      <Highlighter search={text}>{item.name}</Highlighter>
      <div className="small pl-1 text-secondary item-subtitle">
        {t(`common:${item.type}`)}
        {item.type === 'activity' && (
          <>
            <Icon icon={faChevronRight} size="sm" className="mx-2" />
            {t(`common:${item.subtype}`)}
          </>
        )}
      </div>
    </>
  );

  const merged_props = {
    filterBy: () => true,
    autoFocus: true,
    id: 'unified-search-typeahead',
    minLength: SEARCH_MIN_LENGTH,
    placeholder: t('sojourner:search_for_items'),
    emptyLabel: t('sojourner:no_items_found'),
    searchText: `${t('common:searching')}&hellip;`,
    useCache: false,
    highlightOnlyResult: true,
    renderMenuItemChildren,
    ...otherProps,
    labelKey: 'name' as const,
    options: searchResults,
    isLoading: is_loading || is_parent_loading,
    onSearch: handleSearch,
    onChange: onSearchItemsSelected,
    ref: typeaheadRef,
  };

  return <AsyncTypeahead {...merged_props} />;
};

export default UnifiedSearch;
