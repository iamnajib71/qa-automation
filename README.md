# QA Test Management Portal

A portfolio-ready QA operations web app built with Next.js, TypeScript, Tailwind CSS, and Supabase.

This project is designed to feel like a lightweight internal QA tool rather than a student demo. It focuses on realistic testing workflow concepts you can speak about in interviews:

- project and release tracking
- test case management
- test execution and result capture
- defect lifecycle management
- evidence handling
- release-readiness reporting
- lightweight website smoke testing

## Why this project works well in interviews

It gives you a concrete way to talk about:

- regression testing and acceptance testing
- defect triage and retest flow
- release readiness and go-live support
- structured QA documentation
- business-style software design
- using AI as a delivery accelerator while keeping the product practical

## Tech stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Auth, Postgres, and Storage

## Milestone 1 status

Milestone 1 sets up the production-style foundation:

- app router scaffold
- public home page
- auth page scaffold
- protected workspace layout scaffold
- realistic dashboard and module placeholder pages
- Supabase client and middleware helpers
- SQL schema
- storage setup SQL
- seed data script
- website smoke test prototype
- local setup guidance

Auth wiring, CRUD, uploads, and live reporting are intentionally phased into later milestones.

## Local setup

### 1. Install dependencies

```bash
npm install
```

If PowerShell blocks `npm`, use:

```powershell
npm.cmd install
```

### 2. Create your environment file

Copy `.env.example` to `.env.local` and fill in your Supabase values:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Create a Supabase project

1. Create a new project
2. Open the SQL editor
3. Run `supabase/schema.sql`
4. Run `supabase/storage.sql`
5. Create at least one `admin` and one `qa_analyst` user profile
6. Run `supabase/seed.sql`

Note: `seed.sql` expects at least one `admin` profile and one `qa_analyst` profile to exist first.

### 4. Start the app

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
- `/smoke-test` - enter a website and run a basic smoke test

## Smoke test feature in this milestone

The smoke test page gives you a practical demo-friendly feature right away.

What it checks:

- URL is valid
- website responds
- response status code
- HTML title is present
- HTTPS usage
- visibility of a key security header

This is intentionally lightweight. It is not full browser automation yet, but it is a useful QA-style health check you can expand later.

## Suggested next milestone

Milestone 2 should implement:

- real Supabase sign up and sign in
- session-aware protected routes
- sign out
- profile creation on signup
- role-based page access and header state
- optional storage of smoke test history in the database
