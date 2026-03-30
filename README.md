# QA Test Management Portal

A portfolio-ready QA operations web app built with Next.js, TypeScript, Tailwind CSS, and Supabase.

This project is evolving into a hybrid website QA platform where manual QA workflow and automated website analysis live side by side.

## What it does now

- tracks QA-oriented workspace pages for projects, defects, test cases, runs, and reports
- provides a public smoke-test scanner page
- runs a real browser-backed single-page scan with Playwright
- runs axe-core accessibility checks
- captures screenshot and raw evidence artifacts
- stores scan runs, findings, evidence, and project summaries in local JSON persistence
- surfaces saved scans under `/smoke-test`, `/projects`, and `/projects/[projectId]`

## Why this project works well in interviews

It gives you a concrete way to talk about:

- regression testing and acceptance testing
- defect triage and retest flow
- release readiness and go-live support
- structured QA documentation
- business-style software design
- using AI as a delivery accelerator while keeping the product practical
- local-first automation using free tooling instead of paid APIs

## Tech stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Auth, Postgres, and Storage foundation
- Playwright
- axe-core
- rule-based QA heuristics
- optional Ollama integration later

## Milestone A status

Milestone A introduces the first real automated scan slice:

- public smoke-test scanner page
- Playwright page load and screenshot capture
- page title, final URL, response timing, and element counts
- axe-core accessibility findings
- simplified local audit scores for performance, SEO, accessibility, and best practices
- source-labeled automated findings with confidence scores
- local persistence for projects, scans, findings, evidence, and activity logs
- project list/detail views that surface saved automated scan data

## Local setup

### 1. Install dependencies

```bash
npm install
npx playwright install chromium
```

If PowerShell blocks `npm`, use:

```powershell
npm.cmd install
npx.cmd playwright install chromium
```

### 2. Create your environment file

Copy `.env.example` to `.env.local` and fill in values you want to use:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5-coder:7b
```

Supabase is optional for the current Milestone A slice. The app can still run with local persistence only.

### 3. Start the app

```bash
npm run dev
```

Then open `http://localhost:3000`.

## Current routes

- `/` - landing page
- `/login` - sign-in scaffold
- `/signup` - registration scaffold
- `/dashboard` - dashboard shell
- `/projects`
- `/projects/[projectId]`
- `/releases`
- `/test-cases`
- `/test-runs`
- `/defects`
- `/reports`
- `/smoke-test` - run a real local browser-backed website scan

## Smoke test feature in this milestone

The smoke test page now performs a real automated analysis slice.

What it currently does:

- accepts loose URLs like `example.com` or `localhost:3000`
- opens the page in Playwright Chromium
- captures final URL and page title
- captures a full-page screenshot
- counts links, forms, buttons, inputs, and images
- runs axe-core accessibility checks
- generates practical rule-based findings
- saves evidence and scan history locally
- shows saved results in the UI

## Free-host deployment before the next milestone

This app is not suitable for GitHub Pages because it needs a Node server and Playwright. A free Docker-capable host is the right fit.

### Recommended host: Render

This repo now includes:

- `Dockerfile`
- `render.yaml`

### Deploy steps on Render

1. Push this repo to GitHub
2. Log in to Render
3. Create a new Web Service from your GitHub repo
4. Render should detect `render.yaml`, or you can point it at the included `Dockerfile`
5. Set these env vars in Render:

```env
NEXT_PUBLIC_APP_URL=https://your-render-url.onrender.com
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

6. Deploy

### Important note about persistence on a free host

The current Milestone A slice stores scan data in:

- `data/qa-platform.json`
- `public/generated/scans/...`

On a free cloud host this storage is usually ephemeral, which means scans may reset after restarts or redeploys.

That is acceptable for trying the product before the next milestone, but the next persistence upgrade should move scan artifacts into Supabase tables and storage.

## Suggested next milestone

Milestone B should implement:

- project-level scan orchestration
- scan mode selection: single page, multi-page, full site
- internal link crawling with safety caps
- discovered pages storage
- per-project scan coverage metrics
