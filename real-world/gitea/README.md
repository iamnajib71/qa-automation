# Real-world QA: Gitea

A risk-based QA framework for an independent open-source Git hosting product, focused on repository privacy and issue integrity.

**Status: executed; unresolved product findings remain.** [31 automated checks: 25 passed, 6 failed](evidence/summary.json). [30 manual cases](manual-cases.csv): [12 completed, 5 partial/inconclusive, 13 not run](manual-results.csv). [Three exploratory sessions](exploratory/README.md) and [four confirmed defect classes](defects/README.md). Nothing was posted upstream. Read [execution details](evidence/execution-status.md) before interpreting the counts.

## Why Gitea

Gitea is used to host source code and track issues, so unauthorized access and lost issue changes have concrete consequences for development teams. It is independent of this portfolio portal. Its public [issue tracker](https://github.com/go-gitea/gitea/issues), [contributor guide at the tested tag](https://github.com/go-gitea/gitea/blob/v28.2.0/CONTRIBUTING.md), [REST API documentation](https://docs.gitea.com/development/api-usage/) and [Docker installation guide](https://docs.gitea.com/installation/install-with-docker/) make failures reproducible and reviewable.

The selected target is **28.2.0**, released 18 October 2026 according to the [upstream release](https://github.com/go-gitea/gitea/releases/tag/v28.2.0), checked on 22 October 2026. Recent releases establish active maintenance. The image tag is pinned in Compose; bootstrap records its resolved image digest when it actually runs. The application serves its own Swagger 2.0 contract at `/swagger.v1.json`; response validation uses that contract rather than a hand-written substitute.

## Test assets and evidence

| Asset | Location | Execution status |
|---|---|---|
| Risk plan and three exploratory charters | [test-plan.md](test-plan.md) | Authored; exit criteria not met |
| 30 TestRail/Xray-style manual cases | [manual-cases.csv](manual-cases.csv) | 12 complete; 5 partial/inconclusive; 13 not run |
| Exploratory session notes | [exploratory](exploratory/README.md) | 3 recorded timeboxes |
| Selenium Python/pytest page objects | [tests](tests/) | 8 passed across Chrome and Firefox |
| REST, negative/auth and Schemathesis contract checks | [test_api.py](tests/test_api.py) | 13 passed; 1 contract failure |
| Playwright journeys and five axe routes | [journeys.spec.cjs](ui/journeys.spec.cjs) | 4 UI passed; 5 axe scans failed |
| Generated traceability | [traceability.csv](evidence/traceability.csv) | Unexecuted mappings marked not run |
| Execution counts | [summary.json](evidence/summary.json) | Derived from actual JUnit |
| Defects | [register](defects/README.md) | 4 distinct confirmed classes; not filed |

Manual mappings indicate related automated coverage, not proof that every manual step is automated. Browser/parameter variants count as separate executions. Manual outcomes are recorded independently. [Upstream fix preparation](fixes/README.md) is separate from the unmodified product's results.

## Reproduce locally

Requirements: running Docker engine with Linux containers, Python 3.12, Node 22, installed Chrome and Firefox. Selenium Manager obtains compatible drivers. This is a disposable localhost fixture; do not expose it publicly or reuse its public test password.

From this directory:

```powershell
py -3.12 -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
npm.cmd ci
npx.cmd playwright install chromium
python scripts/bootstrap.py
python scripts/run.py
```

On Linux use `python3.12 -m venv .venv`, `source .venv/bin/activate`, `npm`/`npx`, and `npx playwright install --with-deps chromium`. Bootstrap is idempotent for the fixture account, repositories and seed issue. Tests add disposable closed issues; reset the volume for a pristine run. Each suite runs sequentially in one process to avoid fixture races. Use a fresh report directory per execution; archived reports must not be mixed with a new run.

Open http://127.0.0.1:43210 and sign in with `qaowner` / `Local-QA-Only-482!` for manual cases and timed exploratory work. Record actual outcomes and evidence; do not change catalog case definitions into results.

Run individual suites:

```powershell
python -m pytest tests/test_api.py --junitxml=reports/api.xml --html=reports/api.html --self-contained-html --alluredir=reports/allure-results
python -m pytest tests/test_selenium.py --junitxml=reports/selenium.xml --html=reports/selenium.html --self-contained-html --alluredir=reports/allure-results
npm.cmd test
python scripts/results.py
```

The pytest suites create JUnit, self-contained HTML and separate Allure result directories. Playwright creates JUnit/HTML, failure screenshots/traces and axe JSON. The full runner clears the three named JUnit outputs before starting, uses clean suite-specific Allure directories, attempts every suite and fails if any suite fails. HTML reports require no Allure installation. Install the Allure CLI to view the raw Allure directories.

Stop without deleting data: `docker compose -f compose.yml down`. To intentionally reset disposable data: `docker compose -f compose.yml down -v`.

## CI

[GitHub Actions workflow](../../.github/workflows/real-world.yml) and [Azure pipeline](../../azure-pipelines.yml) start the same Docker target and invoke the same bootstrap/runner scripts on Ubuntu. They retain JUnit, HTML, Allure results, screenshots/traces, axe output, environment/digest, contract and traceability. GitHub retains artifacts for 30 days; Azure publishes test results and artifacts using its configured retention policy. Azure requires an Azure DevOps pipeline connected to this repository; that service has not been configured or run here.

[First actual CI execution](https://github.com/iamnajib71/qa-automation/actions/runs/39763949058) included framework failures that were subsequently corrected. The saved local JUnit evidence reflects the corrected 25-pass/6-failure result; follow the execution record for subsequent CI runs. Azure is configured but has not been run in an Azure DevOps project.
