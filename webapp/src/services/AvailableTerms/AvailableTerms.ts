import { AxiosInstance } from 'axios';
import { ApiVersion } from '@services/types';
import { Term } from '@models/Term';
import { AvailableTermsEndpoints } from './types';
import { TermListMapping } from '@stores/ScheduleBuilderStore';
import { availableTermsSchema } from './constants';
import { axiosApi } from '@services/constants';

export class AvailableTermsService {
  constructor(private axios: AxiosInstance = axiosApi) {}

  private expandPath(endpoint: string, apiVersion: ApiVersion = ApiVersion.V1): string {
    return `/da${apiVersion}${endpoint}`;
  }

  public async getAvailableTerms(): Promise<TermListMapping> {
    const response = await this.axios.get(this.expandPath(AvailableTermsEndpoints.AvailableTerms));
    const { data } = availableTermsSchema.parse(response.data);
    const terms: Record<Term['id'], Term> = {};
    for (const t of data) {
      terms[`${t.year}-${t.term}`] = new Term(t.year, t.term);
    }
    return terms;
  }
}
