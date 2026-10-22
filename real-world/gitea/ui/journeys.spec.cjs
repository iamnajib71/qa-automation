const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

async function login(page) {
  await page.goto('/user/login');
  await page.locator('#user_name').fill('qaowner');
  await page.locator('#password').fill('Local-QA-Only-482!');
  await page.locator('button.ui.primary.button').click();
  await expect(page).not.toHaveURL(/\/user\/login/);
}

test('authenticated dashboard', async ({ page }) => {
  await login(page);
  await expect(page.locator('body')).toContainText('journeys');
});

test('public repository and issue navigation', async ({ page }) => {
  await page.goto('/qaowner/journeys');
  await expect(page.locator('.repo-title')).toContainText('journeys');
  await page.goto('/qaowner/journeys/issues');
  await page.getByRole('link', { name: 'Seed issue', exact: true }).click();
  await expect(page.locator('body')).toContainText('Seed issue');
  await expect(page).toHaveURL(/\/issues\/\d+/);
});

test('create and close issue through UI', async ({ page }) => {
  await login(page);
  await page.goto('/qaowner/journeys/issues/new');
  const title = `UI lifecycle ${Date.now()}`;
  await page.locator('#issue_title').fill(title);
  await page.getByRole('button', { name: 'Create Issue', exact: true }).click();
  await expect(page.locator('body')).toContainText(title);
  await page.getByRole('button', { name: /Close Issue/i }).click();
  await expect(page.locator('.issue-state-label')).toContainText('Closed');
});

test('private repository hidden from anonymous visitor', async ({ page }) => {
  await page.goto('/qaowner/private-fixture');
  await expect(page.locator('body')).toContainText('not found');
});

for (const route of ['/', '/user/login', '/explore/repos', '/qaowner/journeys', '/qaowner/journeys/issues']) {
  test(`axe ${route}`, async ({ page }, info) => {
    await page.goto(route);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    await info.attach('axe-results', { body: JSON.stringify(results, null, 2), contentType: 'application/json' });
    expect(results.violations).toEqual([]);
  });
}
