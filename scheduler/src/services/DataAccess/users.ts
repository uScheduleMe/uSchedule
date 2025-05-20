import fetch_json from '@services/fetch_json';
import { expandPath } from './main';
import { Endpoint, UserAccount, user_account_schema } from '.';
import { Profile } from 'passport';
import { parseData } from '@services/utils';

/**
 * Get a user by their UUID
 * @throws ZodError if the return data does not match the schema
 * @param uuid The UUID string
 * @param access_token An access token that is allowed to perform this action
 * @returns A promise containing a UserAccount object
 */
export async function getUserByUuid(uuid: string, access_token: string): Promise<UserAccount> {
  const res = await fetch_json.get(expandPath(Endpoint.USER, { uuid }), { access_token });
  return parseData(user_account_schema, res);
}

/**
 * Get a user by their identity provider ID
 * @throws ZodError if the return data does not match the schema, or if there is more than one record
 * @param provider The name of the identity provider
 * @param provider_uid The unique id of the user for the identity provider
 * @param access_token An access token that is allowed to perform this action
 * @returns A UserAccount object if there is 1 result, otherwise null
 */
export async function getAccountByProviderId(
  provider: string,
  provider_uid: string,
  access_token: string,
): Promise<UserAccount | null> {
  const res = await fetch_json.get(expandPath(Endpoint.USERS), {
    query: { provider, provider_uid },
    access_token,
  });
  const accounts = parseData(user_account_schema.array().max(1), res);
  return accounts.length ? accounts[0] : null;
}

/**
 * Get a user by their email address
 * @throws ZodError if the return data does not match the schema, or if there is more than one record
 * @param emails An email address, or list of email addresses to search by
 * @param access_token An access token that is allowed to perform this action
 * @returns A UserAccount object if there is 1 result, otherwise null
 */
export async function getAccountByEmails(
  emails: string[] | string,
  access_token: string,
): Promise<UserAccount | null> {
  const email = typeof emails === 'string' ? emails : emails.join(',');
  const res = await fetch_json.get(expandPath(Endpoint.USERS), {
    query: { email },
    access_token,
  });
  const accounts = parseData(user_account_schema.array().max(1), res);
  return accounts.length ? accounts[0] : null;
}

/**
 * Create a UserAccount using the info from a passport profile
 * @throws ZodError if the return data does not match the schema
 * @param profile The passport profile containing the user details
 * @param access_token An access token that is allowed to perform this action
 * @returns The UserAccount object that was created
 */
export async function createAccount(profile: Profile, access_token: string): Promise<UserAccount> {
  const { id, provider, displayName } = profile;
  const emails = profile.emails?.map((e) => ({ email_address: e.value })) ?? [];

  const account = {
    providers: [
      {
        provider,
        provider_uid: id,
      },
    ],
    disp_name: displayName,
    given_name: profile.name?.givenName ?? '',
    family_name: profile.name?.familyName ?? '',
    emails,
  };

  const res = await fetch_json.post(expandPath(Endpoint.USERS), {
    body: account,
    access_token,
  });
  return parseData(user_account_schema, res);
}
