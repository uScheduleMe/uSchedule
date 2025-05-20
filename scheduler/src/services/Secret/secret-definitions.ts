export const SECRET_GROUP = {
  AUTH: 'auth',
  APP_ROUTER: 'app-router',
  DATA_ACCESS: 'data-access',
  NOTIFIER: 'notifier',
  SCHEDULER: 'scheduler',
} as const;

export interface SecretDef {
  group: (typeof SECRET_GROUP)[keyof typeof SECRET_GROUP];
  key: string;
}

export const SECRET_DEF = {
  TOKEN_PRIVATE_KEY: { group: SECRET_GROUP.AUTH, key: 'token_private_key' },
  TOKEN_PUBLIC_KEYS: { group: SECRET_GROUP.AUTH, key: 'token_public_keys' },
  OAUTH_CLIENT_ID_GOOGLE: { group: SECRET_GROUP.AUTH, key: 'oauth_client_id_google' },
  OAUTH_CLIENT_SECRET_GOOGLE: { group: SECRET_GROUP.AUTH, key: 'oauth_client_secret_google' },
  OAUTH_CLIENT_ID_FACEBOOK: { group: SECRET_GROUP.AUTH, key: 'oauth_client_id_facebook' },
  OAUTH_CLIENT_SECRET_FACEBOOK: { group: SECRET_GROUP.AUTH, key: 'oauth_client_secret_facebook' },
  OAUTH_CLIENT_ID_MICROSOFT: { group: SECRET_GROUP.AUTH, key: 'oauth_client_id_microsoft' },
  OAUTH_CLIENT_SECRET_MICROSOFT: { group: SECRET_GROUP.AUTH, key: 'oauth_client_secret_microsoft' },
  DB_CREDENTIALS: { group: SECRET_GROUP.DATA_ACCESS, key: 'db_credentials' },
} satisfies Record<string, SecretDef>;
