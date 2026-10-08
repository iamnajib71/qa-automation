const fs=require('node:fs');
const read=file=>JSON.parse(fs.readFileSync(file,'utf8').replace(/^\uFEFF/,''));
const local=read('docs/results/local-summary.json');
const ci=fs.existsSync('docs/results/ci-summary.json')?read('docs/results/ci-summary.json'):null;
const source=ci||local;
const t=source.totals;
const perf=read('docs/results/k6-summary.json').metrics;
const performanceResult=`${perf.http_reqs.count} requests / ${perf.checks.passes} checks; p95 ${perf.http_req_duration['p(95)'].toFixed(2)} ms`;
const evidence=ci?`[GitHub CI run](${ci.url}) · [saved counts](docs/results/ci-summary.json)`:'[Executed Windows run](docs/results/local-summary.json) (CI publication pending)';
fs.writeFileSync('README.md',`A real Next.js QA portal tested with Playwright, Cypress, Newman, Vitest and k6 — with evidence you can inspect.

![Real API lifecycle, browser scan and unit-test demo](docs/demo.gif)

[![CI](https://github.com/iamnajib71/qa-automation/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/iamnajib71/qa-automation/actions/workflows/ci.yml)
[![MIT licence](https://img.shields.io/badge/licence-MIT-blue)](LICENSE)
![TypeScript](https://img.shields.io/badge/main_language-TypeScript-3178c6)

**Runs locally.** The complete scanner needs Node, Chromium and writable local storage. The legacy Vercel preview is not advertised as the working framework demo. [Demo recording details](docs/results/demo.md).

## What it shows recruiters

- **Functional, regression and API testing:** real defect CRUD and lifecycle, negative cases, schemas, boundary values and permanent retests for three real fixed defects.
- **Cypress and Playwright:** six Cypress journeys using page objects and fixtures, Playwright request/E2E automation, real browser scan artifacts and axe WCAG 2.1 AA checks.
- **Release delivery:** gated GitHub Actions with HTML reports and failure artifacts; a local k6 performance smoke run; [test strategy, plan, cases and traceability](docs/testing/test-strategy.md).

## Architecture

\`\`\`mermaid
flowchart LR
  U[Portal UI] --> N[Next.js routes]
  N --> D[(Local JSON store)]
  N --> S[Playwright Chromium + axe scanner]
  S --> E[Screenshot / raw scan / axe evidence]
  A[Postman + Newman] --> N
  P[Playwright request + E2E + axe] --> U
  P --> N
  C[Cypress page objects + fixtures] --> U
  V[Vitest] --> F[Scoring / parsing / validation]
  K[k6 local smoke] --> N
  G[GitHub Actions] --> A
  G --> P
  G --> C
  G --> V
\`\`\`

## Screenshots

![Working portal](docs/img/portal.png)
![Real saved browser scan](docs/img/scanner.png)
![Playwright HTML report](docs/img/playwright-report.png)
![Cypress HTML report](docs/img/cypress-report.png)

## Quick start — Windows PowerShell

Tested with Node 22 and Windows. No secrets, external services or environment file are required. The shared port is 43187; lower development ports became reserved by Windows during verification.

\`\`\`powershell
git clone https://github.com/iamnajib71/qa-automation.git
cd qa-automation
npm.cmd ci
npx.cmd playwright install chromium
npm.cmd test
npm.cmd run build
npm.cmd run serve:test
\`\`\`

Open **http://127.0.0.1:43187**. Create a fictional defect at /defects; at /smoke-test scan **http://127.0.0.1:43187**. Reload to inspect saved data. Use Ctrl+C to stop the server before suites that start their own server. On Ubuntu, use npm/npx and install Chromium with \`npx playwright install --with-deps chromium\`.

### One command per suite

Run after installation and build. The API and Cypress commands start and stop the production server; Playwright manages its server too. Only k6 expects an already running production server.

| Suite | Command | Report |
|---|---|---|
| Lint | \`npm run lint\` | Terminal |
| Type-check | \`npm run typecheck\` | Terminal |
| Unit (Vitest) | \`npm test\` | reports/unit JSON + JUnit |
| API (Postman/Newman) | \`npm run test:api\` | reports/newman/index.html + JSON + JUnit |
| API (Playwright request) | \`npm run test:request\` | reports/playwright/index.html |
| Playwright request + E2E + axe | \`npm run test:e2e\` | reports/playwright/index.html + trace/axe attachments |
| Cypress six journey specs | \`npm run test:cypress\` | reports/cypress/index.html + JSON; videos |
| Performance smoke (local only) | \`npm run test:perf\` | docs/results/k6-summary.json |
| All correctness gates | \`npm run test:all\` | All reports above; excludes k6 |

On PowerShell, use \`npm.cmd\` if script execution policy blocks \`npm\`. Install the free [k6 CLI](https://grafana.com/docs/k6/latest/set-up/install-k6/) separately and place it on PATH for the performance command. Cypress installation is included in npm ci; \`npx cypress install\` repairs a missing binary. [API contract and Postman import](docs/testing/api-contract.md).

## Results and evidence

${evidence}. Counts below are read from that run's reports; requests and assertions are explicitly distinguished. Fixtures are synthetic; scan metrics are measured from this real portal. No coverage percentage is claimed.

| Suite | Passed | Failed | Evidence |
|---|---:|---:|---|
| Vitest unit | ${t.unit} tests | 0 | ${ci?'[CI counts](docs/results/ci-summary.json)':'[Unit JSON](docs/results/unit-results.json)'} |
| Newman API | ${t.newmanRequests} requests / ${t.newmanAssertions} assertions | 0 | ${ci?'[CI counts](docs/results/ci-summary.json)':'[API execution summary](docs/results/newman-summary.json)'} |
| Playwright request | ${t.playwrightAPI} tests | 0 | ${ci?'[CI counts](docs/results/ci-summary.json)':'[Playwright summary](docs/results/playwright-summary.json)'} |
| Playwright E2E + accessibility | ${t.playwrightE2E} tests | 0 | ${ci?'[CI counts](docs/results/ci-summary.json)':'[Playwright summary](docs/results/playwright-summary.json)'} |
| Cypress | ${t.cypress} tests across six specs | 0 | ${ci?'[CI counts](docs/results/ci-summary.json)':'[Cypress summary](docs/results/cypress-summary.json)'} |
| k6 (local only) | ${performanceResult} | ${perf.http_req_failed.value * 100}% HTTP errors; ${perf.checks.fails} failed checks | [Local summary](docs/results/k6-summary.json), [raw output](docs/results/k6-output.txt) |

[Windows execution snapshot](docs/results/local-summary.json) · [clean-clone verification](docs/results/clean-clone.json) · [BUG-001](docs/testing/bug-reports/BUG-001.md) · [BUG-002](docs/testing/bug-reports/BUG-002.md) · [BUG-003](docs/testing/bug-reports/BUG-003.md).

CI gates: lint → type-check → unit → Newman API → Playwright → Cypress. Every job must pass. HTML reports, JSON/JUnit, failure screenshots, retained Playwright videos/traces and Cypress videos are uploaded as Actions artifacts for 30 days. Performance runs locally only. Screenshots show the inspected Windows reports; the linked CI artifacts contain the exact CI reports.

## Project structure

\`\`\`text
src/app/api/          defects REST routes and real scanner route
src/lib/             shared JSON store, validation and scoring
tests/unit/          pure-function boundary and validation tests
tests/api/           exported Postman collection
tests/playwright/    request, E2E and axe tests
cypress/             six specs, page objects and synthetic fixtures
tests/performance/   local-only k6 smoke script
docs/testing/        strategy, plan, 40 cases, traceability, bug reports
docs/results/        actual execution snapshots and recording provenance
docs/img/            app and report screenshots
.github/workflows/   ordered CI gates and artifact uploads
scripts/             cross-platform runners and evidence utilities
\`\`\`

## Honest limits

This is a junior QA portfolio framework, not a production multi-tenant service. Defects and scans work; dashboard/release/test-case/run/report pages contain labelled synthetic previews. Authentication/Supabase scaffolds are excluded from testing. The JSON writer supports one Node process. Saved local records and generated scan artifacts are ignored by Git.

The scanner accepts its own origin only and blocks browser requests to other origins. Browser launch failure can trigger a legacy HTML fallback; the automated happy paths reject fallback and require real Chromium evidence. axe checks do not replace manual accessibility testing. Playwright runs Chromium only; Cypress runs Electron. k6 is a short warmed local GET smoke test, not capacity or production benchmarking. Some transitive development/build dependencies remain flagged by npm audit; no claim of security certification is made.

## Built by Nazmul Hassan

[LinkedIn](https://linkedin.com/in/iamnajib71) · [GitHub](https://github.com/iamnajib71)
`);
console.log('README counts sourced from',ci?'CI':'local reports');
