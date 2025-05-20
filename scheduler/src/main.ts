import { registerStrategies } from '@id_providers';
import { parseStringToInt } from '@utils/helpers';
import { getLogger } from '@utils/logger';
import { SecretService } from '@services/Secret';
import { configureExpressApp } from './configureExpressApp';
import { initWorkerPool } from './initWorkerPool';

const logger = getLogger(__filename);

void (async () => {
  initWorkerPool();

  await SecretService.init(process.env.ENV);

  // Setup passport strategies
  registerStrategies();

  const app = await configureExpressApp();

  const FALLBACK_PORT = 3001;
  const PORT = parseStringToInt(process.env.PORT, FALLBACK_PORT, 1);

  // start the Express server
  app.listen(PORT, () => {
    logger.info(`Server started. Listening at http://localhost:${PORT}`);
    logger.info(`ENV: ${process.env.ENV}`);
    logger.info(`NODE_ENV: ${process.env.NODE_ENV}`);
  });
})();
