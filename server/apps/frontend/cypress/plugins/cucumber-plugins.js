const cucumber = require('cypress-cucumber-preprocessor').default;
const getCompareSnapshotsPlugin = require('cypress-image-diff-js/dist/plugin');

module.exports = (on, config) => {
  //on is used to hook into various events Cypress emits
  //config is the resolved Cypress config

  on('file:preprocessor', cucumber());
  getCompareSnapshotsPlugin(on, config);

  require('@applitools/eyes-cypress')(module);
  return Object.assign({}, config, {
    fixturesFolder: 'cypress/fixtures',
    integrationFolder: 'cypress/e2e',
    screenshotsFolder: 'cypress/screenshots',
    videosFolder: 'cypress/videos',
    supportFile: 'cypress/support/index.js',
  });
};
