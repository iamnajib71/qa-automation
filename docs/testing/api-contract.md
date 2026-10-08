# Local REST contract

Base URL: `http://127.0.0.1:43187`. No external service or credential is needed. Records are synthetic portfolio data. These routes deliberately have no authentication and should not hold private data.

| Method | Path | Success | Behaviour |
|---|---|---|---|
| GET | /api/defects | 200 | `{ defects: Defect[] }` |
| POST | /api/defects | 201 | Validated create; `{ defect }`, Location header |
| GET | /api/defects/:id | 200 | `{ defect }`; missing record 404 |
| PATCH | /api/defects/:id | 200 | Partial update preserves other fields; missing record 404 |
| DELETE | /api/defects/:id | 204 | Empty body; missing record 404 |
| GET | /api/smoke-test?limit=2 | 200 | `{ scans: ScanResponse[] }`; limit bounded to 1–20 |
| POST | /api/smoke-test | 200 | `{ websiteUrl }` runs the real browser scanner |
| GET | /api/evidence/:scanId/:filename | 200 | Generated PNG/JSON evidence; validated path, missing evidence 404 |

Defect input: title trimmed, 3–120 characters; description trimmed, 1–2000 characters; severity `low/medium/high/critical`; priority `low/medium/high`; status `open/in_progress/retest/closed` (defaults to `open`). Unknown fields and empty patches return 400. Server assigns UUID, `createdAt` and `updatedAt`. Errors use `{ error: string }`. Malformed JSON and invalid input return 400.

All records share `data/qa-platform.json` with scan history (override with `QA_DATA_FILE`). Writes run through one process-wide queue and atomic file rename. Existing scan stores acquire an empty defects array without losing old data. This is single-process persistence, not a distributed database.

Scanner input must be HTTP(S), without embedded credentials, on the portal's own origin. Browser requests to other origins are blocked. Use `http://127.0.0.1:43187` when running locally; `localhost` is a different origin. Set `NEXT_PUBLIC_APP_URL` to override the allowed origin. Browser launch failures have a legacy HTML fallback; the automated happy-path tests explicitly reject fallback results and require real screenshot/axe evidence.

Import [the collection](../../tests/api/qa-portal.postman_collection.json) into Postman or run `npm run test:api` after `npm run build`. The exported collection and Playwright request suite mirror API-01 through API-21. Each successful lifecycle creates then deletes its own fictional record. Failed Postman runs may leave a clearly labelled synthetic record for inspection.
