import { defineConfig } from 'cypress';

module.exports = defineConfig({
  viewportHeight: 800,
  viewportWidth: 1000,

  env: {
    screenshotsFolder: './cypress/snapshots/actual',
    trashAssetsBeforeRuns: true,
    type: 'actual',
  },
  e2e: {
    video: false,
    specPattern: '**/*.feature',

    baseUrl: 'http://localhost:3000',
    //https://docs.cypress.io/api/plugins/browser-launch-api#Set-screen-size-when-running-headless
    // prefix async
    async setupNodeEvents(on, config) {
      const createEsbuildPlugin =
        require('@badeball/cypress-cucumber-preprocessor/esbuild').createEsbuildPlugin;
      const createBundler = require('@bahmutov/cypress-esbuild-preprocessor');
      const getCompareSnapshotsPlugin = require('cypress-visual-regression/dist/plugin');
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
      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.name === 'chrome' && browser.isHeadless) {
          // fullPage screenshot size is 1400x1200 on non-retina screens
          // and 2800x2400 on retina screens
          launchOptions.args.push('--window-size=1400,1200');

          // force screen to be non-retina (1400x1200 size)
          launchOptions.args.push('--force-device-scale-factor=1');

          // force screen to be retina (2800x2400 size)
          // launchOptions.args.push('--force-device-scale-factor=2')
        }

        if (browser.name === 'electron' && browser.isHeadless) {
          // fullPage screenshot size is 1400x1200
          launchOptions.preferences.width = 1400;
          launchOptions.preferences.height = 1200;
        }

        if (browser.name === 'firefox' && browser.isHeadless) {
          // menubars take up height on the screen
          // so fullPage screenshot size is 1400x1126
          launchOptions.args.push('--width=1400');
          launchOptions.args.push('--height=1200');
        }

        return launchOptions;
      });
      // return any mods to Cypress
      return config;
    },
  },
});
