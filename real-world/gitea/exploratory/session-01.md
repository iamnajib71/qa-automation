# Session 1 — identity and privacy

Date: 22 October 2026. Planned timebox: 5 minutes. Start 10:41:49 UTC; end 10:46:54 UTC (21:41:49–21:46:54 Sydney), wall time 5m05s. The five-second overrun includes the final state check. Operator: Codex browser interaction under Nazmul's test brief. This was tool-operated exploratory testing, not a claim that Nazmul personally executed the checks.

Environment: local Gitea 28.2.0 official Docker image; synthetic qaowner account; in-app Chromium browser, default viewport/theme. Image digest is in [environment evidence](../evidence/environment.json).

Charter: vary login and anonymous private access; look for incorrect authentication and information disclosure.

Actions and observations, in order:

1. Home rendered the expected Gitea title, Explore and Sign In navigation.
2. Entered qaowner with an invalid password. Keyboard submission displayed `Username or password is incorrect.` and stayed on login.
3. Entered nonexistent-user with an arbitrary password. The same generic error remained; no authenticated dashboard was exposed.
4. Cleared both fields and submitted. Browser validation displayed `Please fill out this field.` and focused the username field.
5. Opened `/qaowner/private-fixture` anonymously. Saw `404 Not Found` and the generic nonexistent/unauthorized explanation; repository content was hidden.
6. Submitted the fixture credentials. After verifying the fields were populated and submitting from the password field, the browser reached `qaowner - Dashboard` and displayed the two fixture repositories.

Tooling notes: native/CDP pointer input and one key dispatch timed out. A DOM validity check later showed empty fields after a navigation race, so that attempt was not counted as a product login failure. Re-entering credentials on the settled form succeeded. Some wall time went to inspecting automation output and recording these distinctions; this is not five minutes of uninterrupted typing.

Outcome: no new authentication/privacy defect confirmed. Cases supported: GT-001, GT-002, GT-003, GT-004, GT-005, GT-008. Follow-up: owner access, logout and cross-user authorization deserve more coverage; no screen-reader audit was performed.
