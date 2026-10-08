const { defineConfig } = require("cypress");
module.exports = defineConfig({
  video: true, screenshotOnRunFailure: true, viewportWidth: 1440, viewportHeight: 1000,
  reporter: "mochawesome", reporterOptions: { reportDir: "reports/cypress/raw", overwrite: false, html: false, json: true },
  e2e: { baseUrl: "http://127.0.0.1:4173", specPattern: "cypress/e2e/*.cy.js", supportFile: "cypress/support/e2e.js", defaultCommandTimeout: 15000 }
});
