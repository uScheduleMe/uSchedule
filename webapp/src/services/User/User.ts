import { ApiVersion } from '@services/types';
import { axiosApi } from '@services/constants';
import { AxiosInstance } from 'axios';
import { User } from '@models/User';
import { userProfileListResponseSchema, userProfileResponseSchema } from './constants';
import { UserEndpoints, UserProfileSchema } from './types';
import { legacyExpandEndpoint } from '@services/utils';

export class UserService {
  constructor(private axios: AxiosInstance = axiosApi) {}

  public async getVisibleUsers(): Promise<User[]> {
    const response = await this.axios.get(this.expandPath(UserEndpoints.Users));
    const { data } = userProfileListResponseSchema.parse(response.data);
    return data.map((user: UserProfileSchema) => new User(user));
  }

  public async getSharedWithMeUsers(): Promise<User[]> {
    const response = await this.axios.get(this.expandPath(UserEndpoints.Users), {
      params: { shared_with_me: true },
    });
    const { data } = userProfileListResponseSchema.parse(response.data);
    return data.map((user: UserProfileSchema) => new User(user));
  }

  public async getCalendarSharedByMeUsers(): Promise<User[]> {
    const response = await this.axios.get(this.expandPath(UserEndpoints.Users), {
      params: { shared_by_me: true },
    });
    const { data } = userProfileListResponseSchema.parse(response.data);
    return data.map((user: UserProfileSchema) => new User(user));
  }

  public async updateUser(user: User): Promise<User> {
    const response = await this.axios.patch(
      this.expandPath(UserEndpoints.User, { uuid: user.uuid }),
      {
        given_name: user.given_name,
        family_name: user.family_name,
      },
      {
        headers: { 'Content-Type': 'application/json' },
      },
    );
    const { data } = userProfileResponseSchema.parse(response.data);
    return new User(data);
  }

  public async deleteUser(user: User): Promise<void> {
    await this.axios.delete(this.expandPath(UserEndpoints.User, { uuid: user.uuid }));
  }

  private expandPath(
    endpoint: UserEndpoints,
    ep_params: Record<string, string> = {},
    apiVersion: ApiVersion = ApiVersion.V1,
  ): string {
    return legacyExpandEndpoint('/da', endpoint, apiVersion, ep_params);
  }
}
