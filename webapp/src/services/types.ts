import { responseMessagesSchema } from '@services/constants';
import { AxiosInstance } from 'axios';
import { NonUndefined, ValuesType } from 'utility-types';
import { z } from 'zod';

export enum ApiVersion {
  V1 = '/v1',
  V2 = '/v2',
  V3 = '/v3',
}

export type ResponseMessages = z.infer<typeof responseMessagesSchema>;
export type ResponseMessage = ValuesType<NonUndefined<ResponseMessages>>;

export type Service<T> = new (axiosInstance: AxiosInstance) => T;
