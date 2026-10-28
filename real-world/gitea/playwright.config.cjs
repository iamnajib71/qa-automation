const { defineConfig } = require('@playwright/test');
module.exports = defineConfig({
  testDir: './ui', workers: 1, retries: 0,
  reporter: [['list'], ['junit', { outputFile: 'reports/playwright.xml' }],
    ['html', { outputFolder: 'reports/playwright', open: 'never' }]],
  outputDir: 'reports/traces',
  use: { baseURL: process.env.GITEA_URL || 'http://127.0.0.1:43210',
    headless: true, screenshot: 'only-on-failure', trace: 'retain-on-failure' }
});
