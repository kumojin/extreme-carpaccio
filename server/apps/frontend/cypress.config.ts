import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      const cucumber = require('cypress-cucumber-preprocessor').default;
      const browserify = require('@cypress/browserify-preprocessor');
      const getCompareSnapshotsPlugin = require('cypress-image-diff-js/dist/plugin');
      getCompareSnapshotsPlugin(on, config);

      const options = {
        ...browserify.defaultOptions,
        typescript: require.resolve('typescript'),
      };

      on('file:preprocessor', cucumber(options));
    },
    baseUrl: 'http://localhost:3000',
    specPattern: 'cypress/e2e/**/*.feature',
    viewportHeight: 800,
    viewportWidth: 1000,
  },

  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
  },
});
