# Gitea execution record — 22–23 October 2026

The unmodified official Gitea 28.2.0 image ran locally in Docker. The resolved image digest is in environment.json. Synthetic fixture data only.

## Corrected local results

| Suite | Passed | Failed | Evidence |
|---|---:|---:|---|
| pytest REST, negative/auth and served Swagger contract | 13 | 1 | api-junit.xml |
| Selenium Chrome + Firefox headless | 8 | 0 | selenium-junit.xml |
| Playwright UI journeys | 4 | 0 | playwright-junit.xml |
| axe scans on five routes | 0 | 5 | playwright-junit.xml and axe-findings.json |
| Total automated executions | 25 | 6 | summary.json |

Four distinct defect classes are recorded in ../defects/README.md. Shared dropdown role/name symptoms are consolidated. A failing page or axe node is not automatically counted as a separate defect. Nothing was posted upstream.

Thirty manual cases were authored. Twelve complete cases passed; five are partial/inconclusive; thirteen were not manually run. See ../manual-results.csv and the three actual exploratory notes in ../exploratory/. Sessions used focused five-minute wall-clock timeboxes; tool delays and triage interruptions are disclosed, with no claim of uninterrupted human execution.

The matrix is generated from actual JUnit plus separately recorded manual outcomes. No report is interpreted as not run, never passed. Counts describe the corrected local report set, not a sum of repeated attempts.

## CI provenance

First actual GitHub run: https://github.com/iamnajib71/qa-automation/actions/runs/39763949058 . That run included initial framework mistakes and had 15 passes/16 failures. The repository selector, main-container wait, case-sensitive 404 assertion, malformed-JSON expected status and Schemathesis auth inference were corrected. Those framework failures are not product defects. Corrected [CI run](https://github.com/iamnajib71/qa-automation/actions/runs/39808735895) reproduced 25 passes and 6 failures; metadata and artifact-derived counts are in [ci-run.json](ci-run.json).

GitHub and Azure configurations start the same disposable Docker target, run all suites, and retain JUnit/HTML/Allure data and browser evidence. Azure has not been executed in an Azure DevOps project. The upstream contract fix is separately tested; its results must not overwrite unmodified-product failures.

## Real setup problems and recovery

The sandbox could not access WSL, Docker's engine pipe, Python downloads or Git credentials. Approved host access resolved dependency installation, Git commit/push and the real GitHub CLI login.

Docker Desktop itself failed on stale AF_UNIX runtime objects in its run directory and the separate Secrets Engine socket directory. Their exact runtime parent directories were preserved under backup names; restarting with both stale socket locations absent restored Docker. No images, volumes or stored application data were deleted, and no factory reset was used. These host-runtime problems are not Gitea defects. The two earlier elevated-start review attempts timed out; subsequent approved executable launch and diagnostics succeeded.

After the four-hour interruption, Windows forwarded-port evidence requests timed out. A container-local wget request returned HTTP 200; its actual headers/body and the previously served contract from the same image were used for issue-contract.json. This transport is stated in that file. No new performance defect is inferred from the resumed host's slowness.

## Framework verification and limits

Compose configuration, Python compilation, Playwright JavaScript syntax and test collection were checked. All eight corrected Selenium checks passed; the first run's selector failures remain historical only. The result generator was checked with separate synthetic JUnit fixtures for passed/failed/skipped and absent-report behavior. Synthetic fixtures were never counted as product executions.

The full test-plan exit criteria are not met: manual coverage is incomplete and contract/accessibility defects remain open. Release recommendation: retain the findings and triage before claiming accessibility/contract conformance. No security, capacity or screen-reader certification is claimed. PHP2Shell diagnostics belong to the portal's separate known-vulnerability feature; Gitea is Go-based and was not tested as a PHP target.
