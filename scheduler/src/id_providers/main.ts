import DataAccess, { UserAccount, user_account_schema } from '@services/DataAccess';
import { getServiceToken } from '@utils/tokens';
import passport, { Profile } from 'passport';
import { VerifyCallback } from 'passport-google-oauth20';
import { NextFunction, Request, Response } from 'express';
import { AuthorizationError, ExtendedProfile } from './types';
import { getLogger } from '@utils/logger';

const logger = getLogger(__filename);

const isAuthorizationError = (err: unknown): err is AuthorizationError =>
  err instanceof Error && err.name === 'AuthorizationError';

/**
 * A reusable function to handle the the process after a successful authentication from an identity provider.
 * @param _access_token The access token from the identity provider
 * @param _refresh_token The refresh token from the identity provider
 * @param provider_profile The user profile object from the identity provider
 * @param done A callback to move to the next action
 */
export const loginOrCreateAccount = async (
  _access_token: string,
  _refresh_token: string,
  provider_profile: Profile,
  done: VerifyCallback,
): Promise<void> => {
  try {
    const profile = validateProviderProfile(provider_profile);
    let account = await DataAccess.getAccountByProviderId(
      profile.provider,
      profile.id,
      getServiceToken(),
    );
    if (!account) {
      logger.info('New user attempting to sign in');
      const matching_accounts = await DataAccess.getAccountByEmails(
        profile.emails?.map((e) => e.value) ?? [],
        getServiceToken(),
      );
      if (matching_accounts) {
        logger.warn('User has an account with another provider, refusing');
        done(null, false, {
          existing_providers: matching_accounts.providers.map((p) => p.provider),
        });
        return;
      }
      logger.info('Creating account for new user');
      account = await DataAccess.createAccount(profile, getServiceToken());
      logger.debug(`New Account: ${JSON.stringify(account)}`);
    }
    done(null, account);
  } catch (e: unknown) {
    if (e instanceof Error || typeof e === 'string' || e === null) {
      done(e);
    }
    done();
  }
};

export const passportRedirectWrapper =
  (strategy: string) =>
  (req: Request, res: Response, next: NextFunction): void => {
    passport.authenticate(
      strategy,
      { session: false },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (err?: Error | string | null, user?: UserAccount, info?: any) => {
        if (err) {
          // This handles the microsoft sign in "cancel" case
          if (isAuthorizationError(err) && err.code === 'consent_required') {
            logger.info('A user declined the Microsoft sign-in with the "cancel" button.');
            res.redirect('/');
            return;
          }
          logger.error(`passport.authenticate callback err: ${JSON.stringify(err)}`);
          res.redirect('/messages/500');
          next(err);
          return;
        }
        if (!user) {
          // This handles the facebook sign in "cancel" case
          if (info?.hasOwnProperty('message') && info?.message === 'Permissions error') {
            logger.info('A user declined the facebook sign-in with the "cancel" button.');
            res.redirect('/');
            return;
          }

          // This handles the email exists with another provider case
          if (info?.hasOwnProperty('existing_providers')) {
            logger.info(
              'A user tried to sign in with an email address that is already in use on another account.',
            );
            res.redirect(
              `/messages/auth/email_exists?existing_providers=${info.existing_providers}`,
            );
            return;
          }
          logger.error(
            'Incorrect configuration, `passportRedirectWrapper` called with `info` of wrong type.',
          );
          logger.debug(info);
          res.redirect('/messages/500');
          next(new Error('No user provided'));
          return;
        }
        try {
          req.user = user_account_schema.parse(user);
        } catch (e) {
          logger.error(
            'Incorrect configuration, `passportRedirectWrapper` called with `user` of wrong type.',
          );
          logger.debug(info);
          res.redirect('/messages/500');
          next(new Error('No user provided'));
          return;
        }
        next();
      },
    )(req, res, next);
  };

/**
 * Validates the User Profile details and fills in fallback values for some fields.
 * @throws An error if the profile is missing a unique id
 * @throws An error if the profile is missing an email address
 * @param profile the user profile data gathered by passport
 * @returns the validated profile object
 */
export const validateProviderProfile = (profile: ExtendedProfile): Profile => {
  const { id, provider, displayName, name } = profile;

  // Make sure there is an emails list and it has no falsy 'value' fields
  const emails = profile.emails?.filter((e) => e.value) ?? [];

  if (!id) {
    throw new Error('Missing ID: A user id is required to create an account');
  }

  // Make sure we have at least one email address
  if (!emails[0]?.value) {
    throw new Error('Missing Email: An Email address is required to create an account');
  }

  // Create fallback for family and given name
  const alt_names = displayName ? displayName.split(' ') : emails[0].value.split('@');

  // Create fallback for display name
  const alt_display_name =
    name?.givenName && name.familyName ? `${name.givenName} ${name.familyName}` : emails[0].value;

  return {
    id,
    provider,
    displayName: displayName || alt_display_name,
    emails,
    name: {
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      givenName: name?.givenName || alt_names[0],
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      familyName: name?.familyName || alt_names[alt_names.length - 1],
    },
  };
};
