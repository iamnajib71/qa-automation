import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("E2E-01 real scanner, saved history, project and downloadable evidence", async ({ page, request, baseURL }) => {
  await page.goto("/smoke-test"); await page.getByLabel("Website URL").fill(baseURL!);
  const responsePromise = page.waitForResponse(response => response.url().endsWith("/api/smoke-test") && response.request().method()==="POST");
  await page.getByRole("button", {name:"Run smoke test",exact:true}).click();
  const response = await responsePromise; expect(response.status()).toBe(200); const result = await response.json();
  expect(result.pageScan.metrics.browserFallbackReason).toBeUndefined();
  await expect(page.getByText("HTTP status",{exact:true})).toBeVisible(); await expect(page.getByText("Full-page screenshot",{exact:true})).toBeVisible();
  await page.reload(); await page.getByRole("button").filter({hasText:result.project.name}).first().click();
  await expect(page.getByText("HTTP status",{exact:true})).toBeVisible();
  await page.goto(`/projects/${result.project.id}`); await expect(page.getByRole("heading",{name:result.project.name,exact:true})).toBeVisible();
  const raw = await request.get(result.evidence.find((item:{kind:string}) => item.kind==="raw_scan").filePath); expect(raw.status()).toBe(200); expect((await raw.json()).statusCode).toBe(200);
});
test("E2E-02 defect create, reload, retest, close and delete", async ({ page, request }) => {
  const title = `Synthetic E2E defect ${Date.now()}`; let id = "";
  try {
    await page.goto("/defects"); await page.getByLabel("Title",{exact:true}).fill(title); await page.getByLabel("Description",{exact:true}).fill("Fictional test data for the defect lifecycle.");
    await page.getByLabel("Severity",{exact:true}).selectOption("high");
    const responsePromise = page.waitForResponse(response=>response.url().endsWith("/api/defects") && response.request().method()==="POST");
    await page.getByRole("button",{name:"Create defect"}).click(); id=(await (await responsePromise).json()).defect.id;
    const card = page.getByTestId("defect-card").filter({hasText:title}); await expect(card).toBeVisible(); await page.reload(); await expect(card).toBeVisible();
    for (const status of ["retest","closed"]) { await card.getByRole("button",{name:/Edit/}).click(); await page.getByLabel("Status",{exact:true}).selectOption(status); await page.getByRole("button",{name:"Save changes"}).click(); await expect(card.getByTestId("defect-status")).toHaveText(status); }
    await card.getByRole("button",{name:/Delete/}).click(); await expect(card).toHaveCount(0);
  } finally { if(id) await request.delete(`/api/defects/${id}`); }
});
test("E2E-03 validation prevents a blank defect", async ({ page }) => { await page.goto("/defects"); await page.getByRole("button",{name:"Create defect"}).click(); await expect(page.getByRole("main").getByRole("alert")).toContainText("Enter a title"); });
test("E2E-04 scanner rejects invalid URL", async ({ page }) => { await page.goto("/smoke-test"); await page.getByLabel("Website URL").fill("http://["); await page.getByRole("button",{name:"Run smoke test",exact:true}).click(); await expect(page.getByText(/valid HTTP/)).toBeVisible(); });
for (const [index,route] of ["/","/defects","/smoke-test"].entries()) {
  test(`A11Y-0${index+1} WCAG 2.1 AA ${route}`, async ({ page }, info) => {
    await page.goto(route); if(route==="/defects") await expect(page.getByRole("heading",{name:"Saved defects"})).toBeVisible();
    const results = await new AxeBuilder({page}).withTags(["wcag2a","wcag2aa","wcag21a","wcag21aa"]).analyze();
    await info.attach("axe-results",{body:JSON.stringify(results,null,2),contentType:"application/json"}); expect(results.violations).toEqual([]);
  });
}

