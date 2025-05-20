process.env.SERVICE_NAME = 'scheduler';
import { Documentation, Routing, createConfig } from 'express-zod-api';
import { heartbeat } from '@utils/express_zod_api';
import main_router from '@routers/main';

export const test_router: Routing = {
  heartbeat,
};

const open_api = new Documentation({
  routing: main_router,
  config: createConfig({
    server: { listen: 80 },
    cors: false,
    logger: { level: 'debug', color: true },
  }),
  version: '1.0.0',
  title: 'uSchedule Scheduler service API',
  serverUrl: 'https://uschedule.me/api/scheduler',
});

const SPEC = open_api.getSpec();
const YAML = open_api.getSpecAsYaml();
const JSON = open_api.getSpecAsJson();

console.log('---------- spec ---------- ', SPEC);
console.log('---------- yaml ---------- ', YAML);
console.log('---------- json ---------- ', JSON);
