import { SecretDef } from '@services/Secret';
import { getSecretsByPath } from '@services/AWS';
import { getLogger } from '@utils/logger';

const logger = getLogger(__filename);

export class SecretService {
  private static instance: SecretService | null = null;

  private constructor(
    private readonly env: string,
    private readonly secrets: Map<string, string | undefined>,
  ) {}

  static async init(env?: string) {
    if (!env) {
      logger.error(`SecretService initialization failed because no environment was provided.`);
      return;
    }

    if (SecretService.instance) {
      logger.warn(`SecretService initialization failed because it is already initialized.`);
      return;
    }

    try {
      const secrets = await getSecretsByPath(`/${env}/`);
      SecretService.instance = new SecretService(env, secrets);

      logger.info(
        `Initializing SecretService for environment '${env}'. ${secrets.size} secrets retrieved.`,
      );
    } catch (error: unknown) {
      logger.error(`SecretService initialization failed. ${error}`);
      logger.debug('SecretService initialization failed.', { error });
    }
  }

  static getSecret(secret: SecretDef) {
    if (!SecretService.instance) {
      logger.warn(`Attempted to access getSecret() before SecretService initialization.`);
      return;
    }

    return SecretService.instance.getSecret(secret);
  }

  private getSecret(secret: SecretDef) {
    return this.secrets.get(this.getSecretName(secret));
  }

  private getSecretName(secret_def: SecretDef) {
    return `/${this.env}/${secret_def.group}/${secret_def.key}`;
  }
}
