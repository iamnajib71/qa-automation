# Test strategy

## Purpose and scope

Demonstrate the practical skills needed for junior/associate Software Tester and QA Engineer work: functional acceptance, regression, API contracts, browser automation, accessibility, performance smoke testing, defect retesting, and release evidence. The system under test is this Next.js portal, its REST routes and shared JSON persistence. Every fixture is synthetic. No external APIs or paid tools are used.

In scope: defect CRUD and lifecycle; scanner submission, real Chromium/axe evidence, saved scan restoration and project detail; HTTP 400/404 handling; pure scoring/parsing/validation; core workspace navigation; all default axe rules (including WCAG 2.1 AA) on home, defects and scanner; low-load GET API latency/error rate; reproducible installation and CI.

Out of scope: production authentication/RBAC, Supabase integration, preview dashboard statistics, multi-user distributed storage, exhaustive accessibility certification, cross-browser/mobile coverage, high-volume load/soak testing and unrestricted website crawling. Preview pages are labelled synthetic and are not represented as implemented workflows.

## Risks and controls

| Risk | Control | Residual limit |
|---|---|---|
| Scanner silently falls back to HTML | Assert no `browserFallbackReason`; fetch screenshot/raw/axe artifacts | Browsers must be installed locally |
| Lost records in concurrent writes | Shared mutation queue + atomic rename; API concurrency regression | Single Node process only |
| UI passes while API contract breaks | Newman schemas and independent Playwright request assertions | Duplicate core cases need coordinated maintenance |
| Negative requests misclassified as server errors | BUG-001/002 regression tests | Unexpected I/O failures remain 500 |
| Missing project appears as valid workspace | BUG-003 404 regression | Existing unscanned projects retain empty state |
| Browser tests depend on prior data | Unique synthetic records, API setup/cleanup, isolated CI data file | Saved scans intentionally persist |
| Accessibility regression | axe WCAG 2.1 AA checks and labelled controls | Manual keyboard/screen-reader review still needed |
| External requests and credentials affect reliability | Same-origin scans; blocked cross-origin browser requests; no env secrets | Local demonstration only |
| Slow cold development compilation distorts latency | k6 against warmed production build, low-load thresholds | Results are machine-specific smoke evidence |

## Levels and techniques

Unit: Vitest boundary-value tests for score thresholds, clamp limits, URL parsing and schema rules. API: exported Postman collection/Newman and Playwright `request`, with equivalence partitions for valid/invalid input and state transitions. E2E: Playwright real scanner/persistence and defect lifecycle, plus axe attachments. Cypress: six independent journey specs, page objects and fixture data; real HTTP traffic, no stubbing of outcomes. Performance: local-only k6, two GET endpoints, 2 VUs for 20 seconds; p95 <500 ms, failure rate <1%, all checks pass.

## Entry / exit criteria

Entry: locked dependencies, Node 22, Chromium and Cypress installed, clean build, writable data directory, port 43187 available, fictional data only. Tests run against `next start`, not a mocked API.

Exit: lint/type-check/unit/Newman/Playwright/Cypress all pass; k6 thresholds pass locally; three reproduced defects are fixed and retested with commit links; HTML reports and failure evidence uploaded; clean-clone quick start verified on Windows; latest published main CI green; README numbers cite saved reports. No suppressed or quarantined failures are accepted for release.

## Environments and reporting

Windows PowerShell with Node 22 is the local reference environment. GitHub Actions uses ubuntu-latest + Node 22 + Chromium, and Electron for Cypress. Each CI job starts from a checkout, `npm ci`, and isolated `data/ci.json`. Jobs gate in order: lint → type-check → unit → Newman API → Playwright → Cypress. Browser reports, traces, screenshots and retained failure videos are uploaded for 30 days; Cypress records videos for every spec. Performance runs are deliberately excluded from CI.

JUnit/JSON/HTML reports live in ignored `reports/`; reviewed snapshots and real local logs are kept in `docs/results/`. Screenshots of the real reports live in `docs/img/`. README distinguishes tests, requests and assertions; these counts are not interchangeable. No coverage percentage is claimed.
