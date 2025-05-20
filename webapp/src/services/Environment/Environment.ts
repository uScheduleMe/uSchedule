import { AxiosInstance } from 'axios';
import { axiosBase } from '@services/constants';
import { EnvironmentSchema } from './types';
import { environmentSchema } from './constants';

export class EnvironmentService {
  constructor(private axios: AxiosInstance = axiosBase) {}

  public async getEnvironment(): Promise<EnvironmentSchema> {
    const response = await this.axios.get(`/env.json`);
    try {
      return environmentSchema.parse(response.data);
    } catch (e: unknown) {
      return {};
    }
  }
}
