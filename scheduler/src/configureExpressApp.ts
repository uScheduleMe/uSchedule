import express, { Express } from 'express';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import main_router from '@routers/main';
import { v3_id_providers_router } from '@routers/v3';
import { errorHandlerMiddleware, notFoundHandlerMiddleware } from '@utils/api_responses';
import { attachRouting, createConfig } from 'express-zod-api';
import { getLogger, logResponseMiddleware } from '@utils/logger';
import responseTime from 'response-time';

const logger = getLogger(__filename);

export async function configureExpressApp(app: Express = express()) {
  app.use(passport.initialize());
  app.use(cookieParser());
  app.use(express.json()); // Request body format
  app.use(responseTime());
  app.use(logResponseMiddleware(logger));

  // Attach the Express-Zod-Api routes to the app
  const e_z_api_config = createConfig({
    app,
    cors: false,
    startupLogo: false,
    logger,
    inputSources: {
      get: ['query'],
      post: ['body', 'files'],
      put: ['body'],
      patch: ['body'],
      delete: ['query'],
    },
  });

  await attachRouting(e_z_api_config, main_router);

  // Setup routing for the identity provider (passport) routes
  app.use('/v3', v3_id_providers_router);

  // Define a 404 handler to return a JSON error message
  app.use(notFoundHandlerMiddleware);

  // Define global error handling, this must be last
  app.use(errorHandlerMiddleware);

  return app;
}
