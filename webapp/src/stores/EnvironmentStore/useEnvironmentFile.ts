import { useEffect } from 'react';
import { useAsync } from '@hooks/useAsync';
import { EnvironmentService } from '@services/Environment/Environment';
import { EnvironmentSchema } from '@services/Environment/types';
import { useTranslation } from 'react-i18next';

export default function useEnvironmentFile() {
  const { t } = useTranslation(['common']);

  const { value: vars, status: env_status } = useAsync<EnvironmentSchema>(
    () => new EnvironmentService().getEnvironment(),
    {},
    t('common:error.get_environment'),
    { maxLoadAttempts: 5 },
  );

  const env_is_loaded = env_status === 'success';

  // Set 'data-env' on the document so Cypress can test that it loaded properly
  useEffect(
    () => document.documentElement.setAttribute('data-env', env_is_loaded ? 'env' : ''),
    [env_is_loaded],
  );

  return { env_is_loaded, vars };
}
