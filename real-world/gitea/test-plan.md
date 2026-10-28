# Risk-based test plan and exploratory charters

## Objective and scope

Assess whether Gitea 28.2.0 supports a small development team's local repository and issue workflow without exposing private information or losing saved changes. Target is the unmodified official Docker image, SQLite, synthetic fixtures, English UI, localhost HTTP. The source product is independent of this QA portal.

In scope: public browsing, password authentication, repository creation/read/update/deletion, issue creation/edit/close/reopen, persistence across reload, anonymous access boundaries, malformed REST input, documented response contracts, keyboard navigation, and automated WCAG A/AA checks.

Out of scope: Git wire protocol, pull requests, email, OAuth/MFA, SSH, migrations, distributed databases, backups, production TLS, package registry, CI execution inside Gitea, load/capacity, penetration testing and certification. A passing smoke suite does not establish coverage of those features.

## Risks and priorities

| Risk | Impact / likelihood | Priority | Approach |
|---|---|---|---|
| Anonymous users see private repositories | High / medium | P1 | Independent anonymous HTTP and browser checks |
| Wrong credentials grant access | High / medium | P1 | Negative credentials and missing/invalid tokens |
| Changes are lost after save/reload | High / medium | P1 | Repository and issue lifecycle, read after write |
| Invalid names or payloads create corrupt records | High / medium | P1 | Empty, path-like, malformed JSON, duplicate names |
| REST clients break after API changes | High / medium | P1 | Schemathesis validates responses against served Swagger |
| Main tasks unusable by keyboard or assistive technology | High / medium | P1 | axe on five routes plus exploratory keyboard checks |
| Browser-dependent UI behavior | Medium / medium | P2 | Same Selenium page objects in headless Chrome and Firefox |
| Search, pagination or error text misleads users | Medium / medium | P2 | Manual cases and exploratory variations |

## Environments and data

Docker Compose exposes only 127.0.0.1:43210. Two initialized repositories: public `qaowner/journeys`, private `qaowner/private-fixture`, plus a seed issue. Public fixture credentials appear in source solely for this disposable installation. No production credentials or real customer information. Use Python 3.12 in CI; Node 22; Chrome and Firefox headless for Selenium and Chromium for Playwright/axe. Bootstrap saves actual version, image digest and served contract into the report bundle. Delete the Compose volume only when intentionally resetting all disposable fixture data.

## Entry criteria

- Docker engine running; image pulled successfully; version endpoint returns expected version.
- Fixture owner can authenticate; public and private fixture repositories exist.
- Served Swagger is available; browser binaries and test dependencies installed.
- Fresh or documented fixture state and writable evidence directory.

## Test types and execution

Execute P1 manual cases before P2/P3. Record each manual execution separately with timestamp, environment, actual outcome and evidence; the case catalog is not evidence of execution. Run pytest REST and contract checks, Selenium across both browsers, Playwright UI lifecycle and axe scans. UI failures retain screenshots/trace; pytest retains JUnit, HTML and Allure results. Keep failures visible; do not mark defects until reproduced and triaged against upstream.

## Exit criteria

All 30 manual cases have recorded outcomes; three actual timeboxed exploratory sessions have timestamps and evidence; every planned automated test has a result; P1 failures are triaged; genuine new defects have upstream duplicate searches and reproducible evidence. CI passes or an explicit release recommendation explains unresolved failures. An environment blockage means these exit criteria have not been met.

## Exploratory sessions (three focused 5-minute timeboxes)

1. **Identity and privacy:** as owner and anonymous visitor, vary login/logout, bad passwords, direct private URLs, back/refresh, error messages and account navigation. Oracle: authorization boundaries remain enforced and navigation reflects session state. Capture redirect/status, screenshot and session transitions.
2. **Issue integrity:** create, edit, close and reopen issues; vary Unicode, Markdown and empty titles; refresh and revisit lists. Oracle: saved content/state match user intent, no unsaved draft appears as persisted. Capture issue URLs, before/after content and timestamps.
3. **Usability and accessibility:** keyboard-only login and issue browsing, focus visibility/order, zoom 200%, narrow viewport, validation focus, public search/pagination. Oracle: key journeys remain understandable and operable. Combine human observations with axe output without treating axe as complete accessibility coverage.

Session notes belong in `exploratory/`; planned charters must never be reported as completed sessions.
