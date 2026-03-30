# QA Platform Architecture Update

## Direction

The portal is shifting from a manual QA tracker into a hybrid website QA platform where manual and automated artifacts coexist.

## Core principles

- Free local tooling first: Playwright, axe-core, rule-based heuristics, optional Ollama later.
- Portfolio realism: automated output is stored as suggested test cases, automated findings, draft defects, and evidence rather than overclaiming everything as a confirmed bug.
- Local-first development: Milestone A runs fully on a local machine and persists scan data without requiring a paid API.
- Supabase-ready schema: the relational model is expanded now so later milestones can move from local storage fallback to full database-backed orchestration.

## Proposed entities

- `projects`: top-level QA workspace with name, description, base URL, environment, and status.
- `project_urls`: environments or entry points for a project.
- `pages`: discovered pages tied to a project/environment.
- `scan_runs`: each automated analysis execution with mode, status, source, and summary scores.
- `page_scans`: page-level output for a scan run including counts, timing, and heuristic scores.
- `test_cases`: manual or generated test cases with source and confidence.
- `test_runs`: execution sessions for manual or automated runs.
- `test_results`: row-level results for a test case in a run.
- `findings`: automated findings, draft defects, or confirmed defects with source and confidence.
- `defects`: confirmed defect workflow records.
- `evidence`: screenshots, raw scan outputs, logs, exported JSON.
- `report_snapshots`: aggregated reporting snapshots per scan run or release checkpoint.
- `ai_suggestions`: optional AI-produced summaries and generated manual test case candidates.
- `activity_log`: audit trail of generated or manual actions.

## Milestone A slice

Implemented in code now:

- Public smoke-test scanner page.
- Single-page scan route using Playwright.
- axe-core accessibility checks.
- Simplified audit metrics for performance, SEO, accessibility, and best practices.
- Rule-based findings with severity, confidence, and source.
- Screenshot and raw JSON evidence capture.
- Project-backed local persistence for scans, pages, findings, evidence, and activity logs.
- Project list and detail views now surface saved automated scan data.

## Persistence strategy

- Current runtime persistence uses `data/qa-platform.json` so local development works immediately.
- Public evidence files are saved under `public/generated/scans/...`.
- `supabase/schema.sql` is expanded so the same model can move into Supabase tables later.
- Optional future upgrade path: use a service-role client for server-side persistence when local Supabase is configured.

## Milestone B preview

- Project-level scan orchestration.
- Scan mode selection: single page, multi-page crawl, site crawl.
- Internal link discovery with safety caps.
- Page inventory and crawl coverage metrics.

## Milestone C preview

- Deterministic test-case suggestion engine.
- Suggested manual test cases created from forms, buttons, navigation, auth screens, and flow detection.

## Milestone D preview

- Optional Ollama provider adapter.
- Local-model summaries, clustering, and richer suggested test cases.
- Graceful fallback to deterministic rules when Ollama is unavailable.

