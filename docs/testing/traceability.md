# Requirement → cases → automated specs

| Requirement | Test cases | Automation |
|---|---|---|
| R-01 Defect CRUD, lifecycle, persistence | API-01–04, API-14–15, API-22, E2E-02, CY-02–04 | tests/playwright/api.spec.ts; tests/playwright/e2e.spec.ts; cypress/e2e/02-create.cy.js through 04-delete.cy.js |
| R-02 Validation, 400, 404 and schemas | API-05–13, API-17–19, API-21, E2E-03–04, CY-05, UNIT-02–03 | tests/api/qa-portal.postman_collection.json; tests/playwright/api.spec.ts; tests/unit/validation.test.ts; cypress/e2e/05-validation.cy.js |
| R-03 Real browser scanner and evidence | API-16, API-20, E2E-01, CY-06 | Newman collection; tests/playwright/api.spec.ts; tests/playwright/e2e.spec.ts; cypress/e2e/06-scanner.cy.js |
| R-04 Main journey navigation | CY-01, E2E-01 | cypress/e2e/01-navigation.cy.js; tests/playwright/e2e.spec.ts |
| R-05 WCAG 2.1 AA automatic checks | A11Y-01–03 | tests/playwright/e2e.spec.ts (@axe-core/playwright) |
| R-06 Pure scoring and parsing | UNIT-01–03 | tests/unit/scoring.test.ts; tests/unit/validation.test.ts |
| R-07 Local performance thresholds | PERF-01 | tests/performance/smoke.js; docs/results/k6-summary.json |
| R-08 Gated CI and reports | All automated cases | .github/workflows/ci.yml; reports uploaded for every suite |
| R-09 Reproducible release and evidence | MAN-01 | README quick start; docs/results/clean-clone.json; docs/demo.gif |

API-01 through API-21 are deliberately mirrored in the exported Postman collection and Playwright request suite. API-22 adds Playwright-only concurrent writer coverage. UNIT cases group the individual boundary/partition tests: consult the JSON unit report for the exact executed test names and count. The CSV steps are independently usable for manual execution; no automated mock substitutes for the app.

## Fixed defects and regression links

| Defect | Requirement | Permanent regression | Fix |
|---|---|---|---|
| [BUG-001](bug-reports/BUG-001.md) | R-02 | API-17 in both API suites | [c8a949f](https://github.com/iamnajib71/qa-automation/commit/c8a949f) |
| [BUG-002](bug-reports/BUG-002.md) | R-02 | API-18 in both API suites; E2E-04; CY-05 | [b728802](https://github.com/iamnajib71/qa-automation/commit/b728802) |
| [BUG-003](bug-reports/BUG-003.md) | R-02 | API-21 in both API suites | [6d924d9](https://github.com/iamnajib71/qa-automation/commit/6d924d9) |
