# Execution findings

During production browser verification, API-20 and E2E-01 exposed a further scanner defect: a completed scan returned paths under `/generated/scans/...`, but GET requests to those newly created files returned 404. Next.js inventories the public directory at server startup. Screenshots were written successfully, yet clients could not download new evidence without restarting the server.

The fix serves scan files through `/api/evidence/:scanId/:filename`, validates UUID and known filename patterns, and preserves their PNG/JSON content types. API-20 retrieves all three generated artifacts; E2E-01 downloads and parses the raw scan. The checks remain in the permanent suite and run against `next start` so this behaviour cannot be hidden by the development server.

Two implementation/test issues were also resolved during setup: Next.js's reconstructed request hostname differed from the configured portal origin, and an unscoped alert locator matched Next.js's route announcer. The origin now comes from the configured app URL (default `http://127.0.0.1:43187`); the validation test scopes its alert to the main content.

Windows reserved-port ranges changed during verification, so the shared test/default app port moved from 4173 to 43187. The original before-fix evidence and bug-report environment descriptions retain the real original port. Newman explicitly uses the same final base URL as the server.

The real scanner also reported the axe region rule on the floating workspace link outside a landmark. The link now sits inside a named navigation landmark, and the scanner has a main landmark. The three Playwright axe tests now run all default rules, including landmark best practices, instead of restricting execution to WCAG tags. The original rule finding is retained in landmark-before.json.
