import { AxiosInstance } from 'axios';
import { SharingEndpoints } from './types';
import { ApiVersion } from '@services/types';
import { axiosApi } from '@services/constants';
import { legacyExpandEndpoint } from '@services/utils';
import { User } from '@models/User';
import { calendarShareResponseSchema } from './constants';

export class SharingService {
  constructor(private axios: AxiosInstance = axiosApi) {}

  private expandPath(
    endpoint: SharingEndpoints,
    ep_params: Record<string, string | number> = {},
    apiVersion: ApiVersion = ApiVersion.V1,
  ): string {
    return legacyExpandEndpoint('/da', endpoint, apiVersion, ep_params);
  }

  public async shareCalendarUsingEmail(email: string): Promise<User> {
    const response = await this.axios.post(
      this.expandPath(SharingEndpoints.Calendar),
      { email },
      { headers: { 'Content-Type': 'application/json' } },
    );
    const { data } = calendarShareResponseSchema.parse(response.data);
    return new User(data.user);
  }

  public async deleteCalendarShare(uuid: string): Promise<void> {
    await this.axios.delete(this.expandPath(SharingEndpoints.CalendarUser, { uuid }));
  }
}
