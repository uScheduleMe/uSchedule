import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as MicrosoftStrategy } from 'passport-microsoft';
import { loginOrCreateAccount } from './main';
import { PROVIDER_CONFIG, Provider } from './provider-config';
import { getLogger } from '@utils/logger';
import { SecretService } from '@services/Secret';

const logger = getLogger(__filename);

const AUTH_HOST_COMPONENTS = process.env.AUTH_BASE_HOST?.split('://');
const AUTH_HOST_IS_HTTP = AUTH_HOST_COMPONENTS?.[0] === 'http';
const AUTH_HOST_WITHOUT_PROTOCOL = AUTH_HOST_COMPONENTS?.[1];

function assertIsProvider(value: string): asserts value is keyof typeof PROVIDER_CONFIG {
  if (!(value in PROVIDER_CONFIG)) {
    throw new Error('invalid provider name');
  }
}

function getStrategy(provider: Provider, client_id: string, client_secret: string) {
  const common_options = {
    clientID: client_id,
    clientSecret: client_secret,
    callbackURL: buildCallbackUrl(provider, PROVIDER_CONFIG[provider].use_https_helper),
  };

  switch (provider) {
    case 'facebook':
      return new FacebookStrategy(
        {
          ...common_options,
          profileFields: PROVIDER_CONFIG[provider].profile_fields,
        },
        loginOrCreateAccount,
      );

    case 'google':
      return new GoogleStrategy(common_options, loginOrCreateAccount);

    case 'microsoft':
      return new MicrosoftStrategy(common_options, loginOrCreateAccount);
  }
}

function buildCallbackUrl(provider: Provider, use_https_helper?: boolean) {
  const host =
    use_https_helper && AUTH_HOST_IS_HTTP
      ? `https://redirect.dearden.dev/${AUTH_HOST_WITHOUT_PROTOCOL}`
      : process.env.AUTH_BASE_HOST;

  return `${host}${process.env.AUTH_BASE_PATH}${PROVIDER_CONFIG[provider].paths.redirect}`;
}

export function registerStrategies() {
  for (const [provider, config] of Object.entries(PROVIDER_CONFIG)) {
    // Just to tell TypeScript to shut up
    assertIsProvider(provider);

    const client_id = SecretService.getSecret(config.client_id_def);
    const client_secret = SecretService.getSecret(config.client_secret_def);

    if (!client_id) {
      logger.error(`Passport strategy for '${provider}' failed to initialize. No client id.`);
    } else if (!client_secret) {
      logger.error(`Passport strategy for '${provider}' failed to initialize. No client secret.`);
    } else {
      logger.info(`Registering auth strategy for '${provider}'.`);
      passport.use(getStrategy(provider, client_id, client_secret));
    }
  }
}
