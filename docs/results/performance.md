# Local k6 performance smoke result

Source revision at execution: ee5705d. Windows, production Next.js 15.5.27, Node 22.22.0, official k6 v2.3.0. Base URL: http://127.0.0.1:43187. Both endpoints were warmed and returned HTTP 200 before the run. The data store contained synthetic test records and actual local portal scans.

Script: [tests/performance/smoke.js](../../tests/performance/smoke.js). Two VUs for 20 seconds, requesting `/api/defects` and `/api/smoke-test?limit=2`, followed by a one-second think time. Executed locally only; no k6 job runs in CI.

| Metric | Measured | Threshold | Result |
|---|---:|---:|---|
| HTTP requests | 74 | — | Executed |
| Checks | 148 passed / 0 failed | All checks pass | Pass |
| p95 HTTP latency | 11.80722 ms | <500 ms | Pass |
| HTTP request failure rate | 0% | <1% | Pass |

[Raw command output](k6-output.txt) and [original exported summary](k6-summary.json) are retained. The exported threshold booleans use k6's failure flag: `false` means the threshold did not fail. Results measure a short warmed local GET workload, not cold-start behaviour, sustained capacity or production performance.
