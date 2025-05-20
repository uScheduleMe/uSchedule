import { AxiosAuthRefreshRequestConfig } from 'axios-auth-refresh';
import { AuthEndpoints } from './types';
import { userProfileResponseSchema } from '@services/User/constants';
import { User } from '@models/User';
import { AxiosInstance } from 'axios';
import { axiosApi } from '@services/constants';
import { expandEndpoint } from '@services/utils';

export class AuthService {
  constructor(private axios: AxiosInstance = axiosApi) {}

  public async getSignedInUser(): Promise<User> {
    const response = await this.axios.get(expandEndpoint(AuthEndpoints.Identify));
    const { data } = userProfileResponseSchema.parse(response.data);
    return new User(data);
  }

  public async signOut(): Promise<boolean> {
    try {
      await this.axios.get(expandEndpoint(AuthEndpoints.SignOut));
      return true;
    } catch (e: unknown) {
      return false;
    }
  }

  public async refresh(): Promise<boolean> {
    const config: AxiosAuthRefreshRequestConfig = {
      skipAuthRefresh: true,
    };
    try {
      await this.axios.get(expandEndpoint(AuthEndpoints.Refresh), config);
      return true;
    } catch (e: unknown) {
      return false;
    }
  }
}
