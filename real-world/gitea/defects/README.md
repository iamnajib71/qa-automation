# Defect register

Four reproducible defect classes in unmodified Gitea 28.2.0: one response-contract mismatch and three accessibility classes. The unnamed action-menu button is grouped with the shared dropdown-role defect. Repeated pages/nodes/rules do not count as separate defects. Business severity is distinct from axe's rule impact.

| Defect | Severity | Status | Upstream link |
|---|---|---|---|
| [GIT-001: issue response schema rejects null associations](GIT-001.md) | Medium | Confirmed; not filed; regression-tested patch prepared | |
| [GIT-002: collapsed dropdowns expose invalid menu structure](GIT-002.md) | Medium | Confirmed; not filed | |
| [GIT-003: default light-theme text contrast](GIT-003.md) | Medium | Confirmed; not filed | |
| [GIT-004: unnamed repository avatar/heading links](GIT-004.md) | Medium | Confirmed; not filed | |

[Duplicate-search record](upstream-search.md). No matching current report was found; related historical issues are distinguished in each report. Nothing was posted upstream. CI intentionally retains the failing assertions.

Before adding a report: reproduce on the pinned unmodified image, rule out fixture/framework errors, search both open and closed issues at https://github.com/go-gitea/gitea/issues and related pull requests, save exact search URLs/time and candidate dispositions. Existing upstream reports are known issues, not newly discovered defects. Do not publish upstream from this project.

Each genuine new report must include product version and image digest, OS/browser, severity and rationale, preconditions, numbered steps, expected/actual behavior, reproducibility, evidence paths, duplicate-search evidence and user impact. Leave upstream filing link blank until Nazmul files it. A small fix requires an isolated upstream source branch and a regression that fails before and passes after; no fix branch is warranted without a reproduced defect.
