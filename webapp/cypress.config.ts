import { defineConfig } from 'cypress';

export default defineConfig({
  defaultCommandTimeout: 10000,
  pageLoadTimeout: 20000,
  env: {
    private_api: 'http://localhost:5001',
  },
  e2e: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setupNodeEvents(_on, _config) {
      // implement node event listeners here
    },
    baseUrl: 'http://localhost',
  },
});
