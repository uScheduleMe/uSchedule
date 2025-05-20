import { SECRET_DEF, SecretDef } from '@services/Secret';
import { AuthenticateOptions } from 'passport';
import { StrategyOptions } from 'passport-facebook';

export interface ProviderPaths {
  /** The auth path relative to the router. i.e. /auth/<provider> */
  authenticate: string;
  /** The auth redirect path relative to the router. i.e. /auth/<provider>/redirect */
  redirect: string;
}

export interface ProviderConfig {
  client_id_def: SecretDef;
  client_secret_def: SecretDef;
  paths: ProviderPaths;
  /** The options passed to passport.authenticate() when registering the main auth route */
  authenticate_options: AuthenticateOptions;
  /** The profileFields to use for the Facebook provider */
  profile_fields?: StrategyOptions['profileFields'];
  /** Use for providers that do not support redirects without https */
  use_https_helper?: boolean;
}

export type Provider = 'facebook' | 'google' | 'microsoft';

export const PROVIDER_CONFIG: Record<Provider, ProviderConfig> = {
  facebook: {
    client_id_def: SECRET_DEF.OAUTH_CLIENT_ID_FACEBOOK,
    client_secret_def: SECRET_DEF.OAUTH_CLIENT_SECRET_FACEBOOK,
    paths: { authenticate: '/auth/facebook', redirect: '/auth/facebook/redirect' },
    authenticate_options: { session: false, scope: 'email' },
    profile_fields: ['id', 'emails', 'name'],
    use_https_helper: true,
  },
  google: {
    client_id_def: SECRET_DEF.OAUTH_CLIENT_ID_GOOGLE,
    client_secret_def: SECRET_DEF.OAUTH_CLIENT_SECRET_GOOGLE,
    paths: { authenticate: '/auth/google', redirect: '/auth/google/redirect' },
    authenticate_options: { session: false, scope: ['profile', 'email'] },
  },
  microsoft: {
    client_id_def: SECRET_DEF.OAUTH_CLIENT_ID_MICROSOFT,
    client_secret_def: SECRET_DEF.OAUTH_CLIENT_SECRET_MICROSOFT,
    paths: { authenticate: '/auth/microsoft', redirect: '/auth/microsoft/redirect' },
    authenticate_options: { session: false, scope: ['https://graph.microsoft.com/user.read'] },
  },
};
