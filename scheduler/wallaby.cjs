/**
 * This is a configuration file for Wallaby.js (https://wallabyjs.com) which is a test runner tool.
 * This is for anyone who has a license to be able to use wallaby with this codebase.
 */

module.exports = (wallaby) => ({
  debug: true,

  files: [
    { pattern: 'node_modules/chai/chai.js', instrument: false, load: true },
    { pattern: 'node_modules/sinon/pkg/sinon.js', instrument: false, load: true },
    'mocha-pre-test-setup.cjs',
    'tsconfig.json',
    'src/**/*.ts',
    '!src/**/*.spec.ts',
  ],

  tests: ['src/**/*.spec.ts', '!src/**/WorkerPool.spec.ts'],

  env: {
    type: 'node',
    runner: 'node',
  },

  testFramework: 'mocha',

  compilers: {
    '**/*.ts': wallaby.compilers.typeScript({
      module: 'commonjs',
    }),
  },

  setup: function (_wallaby) {
    if (global._wallabySetupComplete) {
      return;
    }

    const tsConfigPaths = require('tsconfig-paths');
    const tsconfig = require('./tsconfig.json');
    require('./mocha-pre-test-setup.cjs');

    tsConfigPaths.register({
      baseUrl: tsconfig.compilerOptions.baseUrl,
      paths: tsconfig.compilerOptions.paths,
    });

    global._wallabySetupComplete = true;
  },
});
