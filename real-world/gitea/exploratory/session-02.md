# Session 2 — issue content integrity

Date: 22 October 2026. Planned timebox: 5 minutes. Start 10:47:20 UTC; end 10:52:35 UTC (21:47:20–21:52:35 Sydney), wall time 5m15s. The fifteen-second overrun includes checking the final saved issue. Operator: Codex browser interaction under Nazmul's test brief.

Environment: same local Gitea 28.2.0 Docker fixture; authenticated qaowner; in-app Chromium. Charter: required-title validation, Unicode, Markdown, persistence and issue identity.

Actions and observations, in order:

1. Opened the journeys issue list. Seed issue appeared as issue #1; the API lifecycle issue already existed as a closed synthetic record.
2. Opened New Issue. Submitting without a title displayed `Please fill out this field.` and focused the title input.
3. Inspected DOM semantics after an attempted locator using the AX identifier failed. The field's accessible name was `Title`; this was a tooling selector correction, not a missing-label defect.
4. Entered title `Exploratory café 日本語` and body consisting of a Markdown heading, Unicode text and bold text.
5. Submitted. The saved issue URL became `/qaowner/journeys/issues/3`; detail showed the Unicode title, `QA heading` as a heading, `café 日本語`, and `Saved exploratory content` in the rendered body.

Tooling notes: a submission snapshot arrived before navigation completed. A later URL/state inspection confirmed creation; the failed attempt to resubmit after navigation found no Create Issue button and did not create a second issue. CI failure triage interrupted this wall-clock timebox; those interruptions are not claimed as additional manual case execution.

Outcome: required-title and Unicode/Markdown creation behavior worked. Cases supported: GT-018, GT-019, GT-023. GT-017 was partially inspected (list only); its detail step was not completed in this session. Closing and reopening were carried into the keyboard/usability session. No new product defect confirmed here.
