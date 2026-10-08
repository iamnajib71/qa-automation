import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "tests/playwright", timeout: 90000, expect: { timeout: 15000 },
  fullyParallel: false, workers: 1, retries: 0,
  reporter: [["list"], ["html", { outputFolder: "reports/playwright", open: "never" }], ["json", { outputFile: "reports/playwright-results.json" }]],
  use: { baseURL: "http://127.0.0.1:43187", browserName: "chromium", screenshot: "only-on-failure", video: "retain-on-failure", trace: "retain-on-failure" },
  webServer: { command: "npm run serve:test", url: "http://127.0.0.1:43187", timeout: 120000, reuseExistingServer: !process.env.CI },
  projects: [{ name: "api", testMatch: /api\.spec\.ts/ }, { name: "e2e", testMatch: /e2e\.spec\.ts/ }]
});
