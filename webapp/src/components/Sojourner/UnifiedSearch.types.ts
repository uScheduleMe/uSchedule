import { UniversalSearchResult } from '@services/Sojourner';
import { AsyncTypeaheadProps } from 'react-bootstrap-typeahead';

type OmitList = 'ref' | 'isLoading' | 'onSearch' | 'options';

export interface UnifiedSearchProps
  extends Omit<AsyncTypeaheadProps<UniversalSearchResult>, OmitList> {
  is_parent_loading?: boolean;
  onItemsSelected?: (items: UniversalSearchResult[]) => Promise<void>;
}
