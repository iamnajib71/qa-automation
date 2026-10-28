# Upstream duplicate review

Repository: `go-gitea/gitea`. Reviewed 22–23 October 2026, covering open and closed results. No issue, comment or PR was posted.

| Finding | Queries | Result |
|---|---|---|
| GIT-001 | `swagger null`, `pull_request schema`, `null API`, `null` in titles; PRs `nullable`, `nullable-pointers` | No matching report. 33685 concerns replacing the generator; other null issues describe unrelated data/DB behavior. |
| GIT-002 | `aria-required-children`, `accessibility menu`, `aria`, `dropdown role`; PRs `aria menu`, `dropdown accessibility` | No exact current markup report. 7057 and 29849 are related history and component work. |
| GIT-003 | `contrast` | No issue results. |
| GIT-002 additional symptom | `accessible name`, `button name`, `repository switch` | No matching action-menu report. Source review consolidated the button-name symptom with the shared dropdown-role defect. 38187 proposes a different feature. |
| GIT-004 | `accessible name`, `avatar accessibility`, broader ARIA review | No matching current report. 20606 concerns missing image alt attributes. |

Run `gh search issues '<terms>' --repo go-gitea/gitea --json number,title,url,state` without a state filter; use `gh search prs` for PRs. [Saved returned metadata](../evidence/search-results.json). Search cannot prove no discussion exists; recheck immediately before filing.
