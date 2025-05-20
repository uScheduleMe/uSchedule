import { useAsync } from '@hooks/useAsync';
import { useService } from '@hooks/useService';
import { AvailableTermsService } from '@services/AvailableTerms/AvailableTerms';
import { useTranslation } from 'react-i18next';
import { TermListMapping } from './types';
import { useEffect } from 'react';
import { releaseProxy } from 'comlink';

export function useAvailableTerms() {
  const { t } = useTranslation(['scheduler']);
  const availableTermsService = useService(AvailableTermsService);

  const [termList] = useAsync<TermListMapping>(
    () => availableTermsService.getAvailableTerms(),
    {},
    t('scheduler:error.get_available_terms'),
    { maxLoadAttempts: 5 },
  );

  // When the component is unmounted, or the termList changes, cleanup the local scheduler workers
  useEffect(() => {
    return () => {
      Object.values(termList).forEach((t) => t.localScheduler[releaseProxy]());
    };
  }, [termList]);

  return termList;
}
