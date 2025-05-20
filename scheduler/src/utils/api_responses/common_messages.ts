import { ResponseMessage } from './types';

export const COMMON_1000: ResponseMessage = {
  code: 'common.1000',
  type: 'error',
  title: 'Fetch Connection Error',
  message: 'There was a problem connecting to a resource.',
};

export const COMMON_1001: ResponseMessage = {
  code: 'common.1001',
  type: 'error',
  title: 'Invalid Response Format',
  message: 'A resource request returned an invalid data response format.',
};

export const COMMON_1002: ResponseMessage = {
  code: 'common.1002',
  type: 'error',
  title: 'Data Format Error',
  message: 'The requested data is malformed.',
};

export const COMMON_1003: ResponseMessage = {
  code: 'common.1003',
  type: 'error',
  title: 'Output Data Format Error',
  message: 'There was a problem converting the data to the proper output format.',
};

export const COMMON_1100: ResponseMessage = {
  code: 'common.1100',
  type: 'error',
  title: 'JWT Error',
  message: 'There was a problem with the JSON Web Token.',
};

export const COMMON_1101: ResponseMessage = {
  code: 'common.1101',
  type: 'error',
  title: 'CSRF Error',
  message: 'There was a problem with the Cross-Site Request Forgery Token.',
};

export const COMMON_1102: ResponseMessage = {
  code: 'common.1102',
  type: 'error',
  title: 'Key Error',
  message: 'There was a problem with a public or private key.',
};

export const COMMON_1103: ResponseMessage = {
  code: 'common.1103',
  type: 'error',
  title: 'Forbidden',
  message: "The user doesn't have permission to perform this action",
};
