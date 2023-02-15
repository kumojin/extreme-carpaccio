import { defineConfig } from 'cypress';

module.exports = defineConfig({
  e2e: {
    specPattern: '**/*.feature',
    viewportHeight: 800,
    viewportWidth: 1000,
    baseUrl: 'http://localhost:3000',
    //https://docs.cypress.io/api/plugins/browser-launch-api#Set-screen-size-when-running-headless
    // prefix async
    async setupNodeEvents(on, config) {
      const createEsbuildPlugin =
        require('@badeball/cypress-cucumber-preprocessor/esbuild').createEsbuildPlugin;
      const createBundler = require('@bahmutov/cypress-esbuild-preprocessor');
      const getCompareSnapshotsPlugin = require('cypress-image-diff-js/dist/plugin');
      getCompareSnapshotsPlugin(on, config);

      // await here
      await require('@badeball/cypress-cucumber-preprocessor').addCucumberPreprocessorPlugin(
        on,
        config,
        {
          omitAfterScreenshotHandler: true,
        }
      );

      on(
        'file:preprocessor',
        createBundler({
          plugins: [createEsbuildPlugin(config)],
        })
      );

      // return any mods to Cypress
      return config;
    },
  },
});
