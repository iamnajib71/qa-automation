# Release test plan — v1.0.0

Owner: Nazmul Hassan. Planned release date: 9 October 2026 (Australia/Sydney). Actual execution timestamps and revisions are recorded in `docs/results/` and linked CI runs.

Objective: release a recruiter-readable local automation framework with functional defects CRUD, real self-scanning, reproducible suites and honest evidence. Requirements and exact automated spec mappings are in `traceability.md`; manual steps and expected results are in `test-cases.csv`.

## Execution sequence

1. Reproduce and record original scanner malformed JSON, URL validation and missing-project defects.
2. Apply separate fixes and retain commit references. Retest HTTP responses and add permanent regression cases.
3. Install from lockfile; lint, type-check and unit tests.
4. Build and start the production app. Run Newman API contracts, Playwright request/E2E/axe, and six Cypress journey specs.
5. Warm both GET routes. Run local k6 and save raw output plus summary JSON.
6. Inspect actual HTML reports; capture report and app screenshots. Record the terminal demonstration from real requests and commands.
7. Clone into a new Windows temp directory and execute the README quick start and suites exactly. Confirm scanner evidence and defect persistence on clean data.
8. Publish a candidate branch and verify its gated GitHub jobs. Fast-forward main after green candidate CI; verify main CI, set repository metadata and create v1.0.0.

## Data / environment

No production or customer data. Fixtures say synthetic; tests clean up their own defects. Scans of the portal produce real metrics. Node 22; Chromium installed with Playwright; Cypress Electron. Local JSON is ignored by Git. No environment values are required for quick start. Port 43187 avoids reserved Windows port ranges on the reference machine.

## Acceptance and triage

Every blocking stage must pass, including accessibility checks and real browser evidence. Any failure is investigated; expected results are not weakened just to obtain green CI. A severity high/critical defect blocks release; medium defects in an implemented acceptance journey also block release. Reproduce, attach evidence, fix, retest, then run the affected suite. Record environment limitations candidly.

## Deliverables

Strategy, plan, CSV cases, traceability, API contract, three real bug reports with before/after evidence and fixing commits; raw execution results; browser/API HTML artifacts; GIF demo; report screenshots; MIT licence; CI workflow; clean-clone verification; a green main run and GitHub release. Performance is local-only and is never described as CI load evidence.
