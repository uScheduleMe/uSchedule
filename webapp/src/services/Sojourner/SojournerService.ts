import { ApiVersion } from '@services/types';
import { AxiosInstance } from 'axios';
import { Endpoint } from './Endpoint';
import { axiosApi, responseSchema } from '@services/constants';
import { legacyExpandEndpoint } from '@services/utils';
import { UniversalSearchResult, universal_search_result_schema } from '.';

export class SojournerService {
  constructor(private axios: AxiosInstance = axiosApi) {}

  private expandPath(
    endpoint: Endpoint,
    ep_params: Record<string, string | number> = {},
    apiVersion: ApiVersion = ApiVersion.V1,
  ): string {
    return legacyExpandEndpoint('/sojourner', endpoint, apiVersion, ep_params);
  }

  async search(search: string): Promise<UniversalSearchResult[]> {
    const response = await this.axios.get(this.expandPath(Endpoint.SEARCH), { params: { search } });
    const { data } = responseSchema
      .extend({ data: universal_search_result_schema.array() })
      .parse(response.data);
    return data;
  }
}
