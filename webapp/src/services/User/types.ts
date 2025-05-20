import { userProfileSchema } from './constants';

/**
 * Schema of a single User object
 */
export type UserProfileSchema = typeof userProfileSchema._type;

export type UserProfileEmails = typeof userProfileSchema._type.emails;
export type UserProfileProviders = typeof userProfileSchema._type.providers;

export enum UserEndpoints {
  Users = '/users',
  User = '/users/{uuid}',
}
