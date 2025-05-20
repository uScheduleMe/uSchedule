/* eslint-disable @typescript-eslint/naming-convention */

import { Profile } from 'passport';

export interface AuthorizationError extends Error {
  code: string;
  uri: string;
  status: number;
}

export interface ExtendedProfileJson {
  id?: string | null;
  userPrincipalName?: string | null;
  displayName?: string;
  givenName?: string;
  surname?: string;
  jobTitle?: string | null;
  officeLocation?: string | null;
  mail?: string | null;
  preferredLanguage?: string | null;
  mobilePhone?: string | null;
  businessPhones?: string[];
}

export interface ExtendedProfile extends Profile {
  _json?: ExtendedProfileJson;
  _raw?: string;
}
