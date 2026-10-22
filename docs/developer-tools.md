# Reusable API testing

Open `/api-testing` in the portal. The included JSONPlaceholder example uses fictional public API data. For your API, supply a base URL and one to three cases; set expected HTTP status, optional response-time threshold, JSON paths and an inline JSON Schema. A bearer token is optional and can be omitted per case for authentication-negative checks. Enable writes deliberately before POST/PUT/PATCH/DELETE; use disposable test data.

[Try the hosted tester](https://qa-automation-one.vercel.app/api-testing). [Production verification](results/hosted-tools.json) records three actual public sample requests, PHP screen behavior and the downloadable helper. The PHP form's test inputs are synthetic; they do not claim that a remote PHP application was assessed.

The contract importer accepts OpenAPI 3.0 or Swagger 2.0 JSON. It imports up to three concrete GET operations and inlines bounded nonrecursive local schema references. Parameterized paths, recursive/external schema references and unsupported response definitions require explicit manual cases. This is a configurable HTTP/JSON tester, not a guarantee that every API protocol or schema dialect is supported.

The hosted endpoint permits public HTTPS/443 targets, pins the validated DNS address, blocks local/reserved/metadata destinations, does not follow redirects, limits each request to eight seconds and responses to 512 KiB, and caps suites at three requests/64 KiB. Hosted schemas reject expensive regex/recursive features. The UI reports failed assertions and request errors separately. JSON and JUnit downloads exclude bearer tokens, request payloads, query strings and raw response bodies. Case labels and assertion paths remain user-provided; never put secrets in those labels.

For an explicitly local QA installation, start the server with `API_TEST_LOCAL_ORIGIN=http://127.0.0.1:43210` to allow only that loopback origin. Vercel always ignores this override. Do not enable a broad private-network proxy in a public deployment.

The API tester and PHP assessor require no database or browser binary, making them suitable for short Node serverless runs. The original Chromium website scanner and local persistent-workspace features have separate runtime/storage limits; a Vercel deployment does not turn the filesystem into durable shared storage.

Verification: unit tests exercise real local HTTP requests, schema failures, auth-negative behavior, redirect non-following and network address classification. Playwright tests cover the tool screens, a real public GET example, report download, private-target rejection and axe. Results are recorded separately from Gitea product results.
