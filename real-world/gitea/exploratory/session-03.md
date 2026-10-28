# Session 3 — keyboard, responsive layout and ARIA semantics

Date: 22 October 2026. Planned timebox: 5 minutes. Start 10:54:30 UTC; end 10:59:27 UTC (21:54:30–21:59:27 Sydney), wall time 4m57s. Operator: scripted browser session run to Nazmul's test brief.

Environment: same local Gitea 28.2.0 Docker fixture; authenticated qaowner; in-app Chromium. Viewport temporarily 390×844, then restored. Charter: keyboard-operated core tasks, narrow layout and accessible control semantics.

Actions and observations, in order:

1. Activated Close Issue using Enter on issue #3. Detail changed to Closed and showed a close event.
2. Reloaded and activated Reopen Issue using Enter. Detail changed to Open and showed a reopen event. Reloading again retained the open state and saved Unicode/Markdown body.
3. Opened the account menu with Enter. The open DOM snapshot exposed menuitem entries. Attempts to target Sign Out then timed out after the menu state changed; logout is inconclusive, not a confirmed product defect.
4. Opened Explore, entered `journeys` and submitted from the search field with Enter. The URL contained `q=journeys`; the visible result was the journeys repository.
5. Set viewport 390×844. Screenshot showed the search field, result and footer controls without obvious overlap; keyboard activation opened mobile navigation. A 200% zoom check was not performed, so GT-027 is partial.
6. Opened the owner's private-fixture repository. Owner saw the Private badge and initialized README, in contrast to the anonymous 404 observed in session 1.
7. Inspected the collapsed footer controls' DOM: both theme/language triggers had `role=menu` while their visible child was a span without a menuitem role. This corroborates the automated axe finding; severity and duplicate status require separate triage.
8. Restored the default viewport before ending.

Tooling/limits: brief source inspection and result triage occurred within the wall-clock timebox. No claim of continuous hands-on time, assistive-technology testing, full focus-order verification or WCAG conformance. The browser's early screenshot/input failures were tool failures; narrow and restored viewport screenshots later succeeded.

Outcome: GT-009, GT-021 and GT-022 supported. Search and narrow layout partially covered GT-025/GT-027; GT-006 logout remained inconclusive. The footer ARIA observation is retained for defect triage. Automated contract/accessibility failures are separate from the passing exploratory observations.
