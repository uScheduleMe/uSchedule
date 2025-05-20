import { ResponseMessage } from './types';

export const HTTP_400: ResponseMessage = {
  code: 'http.400',
  type: 'error',
  title: 'Bad Request',
  message: 'The request cannot be fulfilled due to bad syntax.',
};

export const HTTP_401: ResponseMessage = {
  code: 'http.401',
  type: 'error',
  title: 'Unauthorized',
  message: 'Authorization is required for this request. Please submit a valid access token.',
};

export const HTTP_403: ResponseMessage = {
  code: 'http.403',
  type: 'error',
  title: 'Forbidden',
  message: 'The requesting user is not authorized to perform this action.',
};

export const HTTP_404: ResponseMessage = {
  code: 'http.404',
  type: 'error',
  title: 'Not Found',
  message: 'The requested resource does not exist.',
};

export const HTTP_405: ResponseMessage = {
  code: 'http.405',
  type: 'error',
  title: 'Method Not Allowed',
  message: 'The requested method is not available at this endpoint.',
};

export const HTTP_500: ResponseMessage = {
  code: 'http.500',
  type: 'error',
  title: 'Internal Server Error',
  message: 'An unexpected error has occurred.',
};
