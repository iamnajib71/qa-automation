import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("API tester runs a real public API suite and exports JUnit", async ({ page }) => {
  await page.goto("/api-testing");
  await page.getByLabel("I own this API or have permission").check();
  await page.getByRole("button", { name: "Run API checks", exact: true }).click();
  await expect(page.getByRole("region", { name: "API results" })).toContainText("Read a post", { timeout: 30000 });
  await expect(page.getByRole("region", { name: "API results" }).getByText("passed", { exact: true })).toHaveCount(3);
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "JUnit report", exact: true }).click();
  expect((await downloadPromise).suggestedFilename()).toBe("api-results.xml");
  if (process.env.QA_CAPTURE_SCREENSHOTS) await page.screenshot({ path: "docs/img/api-testing.png", fullPage: true });
});

test("API tester rejects a private destination with a visible error", async ({ page }) => {
  await page.goto("/api-testing");
  await page.getByLabel("API base URL").fill("https://127.0.0.1");
  await page.getByLabel("Test cases (JSON)", { exact: true }).fill(JSON.stringify([{ name: "Private target", path: "/", expectedStatus: 200 }]));
  await page.getByLabel("I own this API or have permission").check();
  await page.getByRole("button", { name: "Run API checks", exact: true }).click();
  await expect(page.getByText("Private, reserved and metadata network addresses are blocked.", { exact: true })).toBeVisible();
});

test("PHP diagnostics distinguish affected, patched and inconclusive evidence", async ({ page }) => {
  await page.goto("/php-security");
  await page.getByLabel("PHP version", { exact: true }).fill("8.4.26");
  await page.getByRole("button", { name: "Assess PHP patch status" }).click();
  await expect(page.getByTestId("php-assessment")).toContainText("needs-update");
  await page.getByLabel("PHP version", { exact: true }).fill("8.4.27");
  await expect(page.getByTestId("php-assessment")).toHaveCount(0);
  await page.getByRole("button", { name: "Assess PHP patch status" }).click();
  await expect(page.getByTestId("php-assessment")).toContainText("upstream-fixed");
  await page.getByLabel("Evidence source", { exact: true }).selectOption("header");
  await page.getByRole("button", { name: "Assess PHP patch status" }).click();
  await expect(page.getByTestId("php-assessment")).toContainText("inconclusive");
  const helper = await page.request.get("/tools/php-runtime-check.php.txt");
  expect(helper.status()).toBe(200);
  expect(await helper.text()).toContain("PHP_SAPI");
  await page.getByLabel("Runtime or package evidence", { exact: false }).fill(JSON.stringify({ php_version: "8.4.27", sapi: "cli", memory_limit: "128M", session_upload_progress_enabled: "1" }));
  await page.getByRole("button", { name: "Read runtime JSON", exact: true }).click();
  await expect(page.getByText(/CLI evidence does not establish/)).toBeVisible();
  await page.getByRole("button", { name: "Assess PHP patch status" }).click();
  await expect(page.getByTestId("php-assessment")).toContainText("upstream-fixed");
  if (process.env.QA_CAPTURE_SCREENSHOTS) await page.screenshot({ path: "docs/img/php-diagnostics.png", fullPage: true });
});

for (const route of ["/api-testing", "/php-security"]) {
  test(`Developer tool accessibility ${route}`, async ({ page }, info) => {
    await page.goto(route);
    const results = await new AxeBuilder({ page }).analyze();
    await info.attach("axe-results", { body: JSON.stringify(results), contentType: "application/json" });
    expect(results.violations).toEqual([]);
  });
}
