import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, CheckCircle2, FileWarning, FolderKanban } from "lucide-react";

import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";

const highlights = [
  {
    title: "Real QA workflow coverage",
    description: "Projects, releases, test cases, execution, defect logging, and evidence management in one practical flow."
  },
  {
    title: "Interview-friendly structure",
    description: "Designed to explain release readiness, triage, and business reporting without sounding overengineered."
  },
  {
    title: "Built for local development",
    description: "Simple Next.js + Supabase setup that can grow into deployed portfolio software when you are ready."
  }
];

export default function HomePage() {
  return (
    <main className="min-h-screen px-4 py-8 lg:px-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="overflow-hidden rounded-[32px] border border-white/70 bg-slate-950 px-6 py-8 text-white shadow-soft lg:px-10 lg:py-12">
          <div className="grid gap-8 lg:grid-cols-[1.35fr_0.95fr] lg:items-end">
            <div className="space-y-6">
              <StatusBadge label="Portfolio-ready business app" tone="warning" className="bg-amber-200 text-amber-900" />
              <div className="space-y-4">
                <p className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-300">QA Test Management Portal</p>
                <h1 className="max-w-3xl text-balance text-4xl font-semibold tracking-tight lg:text-6xl">
                  Showcase QA delivery, release coordination, and practical product thinking in one app.
                </h1>
                <p className="max-w-2xl text-base leading-7 text-slate-300 lg:text-lg">
                  A lightweight Jira + TestRail style workflow for managing projects, releases, test cases, test runs, defects, evidence, and basic
                  smoke testing for websites.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-200"
                >
                  Open demo workspace
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/smoke-test"
                  className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Try smoke test
                </Link>
              </div>
            </div>

            <Card className="grid gap-4 bg-white/95">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <FolderKanban className="h-5 w-5 text-primary" />
                  <p className="mt-3 text-sm font-medium text-muted-foreground">Project delivery streams</p>
                  <p className="mt-1 text-3xl font-semibold text-slate-900">06</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <FileWarning className="h-5 w-5 text-danger" />
                  <p className="mt-3 text-sm font-medium text-muted-foreground">Open defects</p>
                  <p className="mt-1 text-3xl font-semibold text-slate-900">18</p>
                </div>
              </div>
              <div className="rounded-2xl bg-slate-900 p-5 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Release readiness snapshot</p>
                <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-2xl bg-white/5 p-3">
                    <p className="text-2xl font-semibold">84%</p>
                    <p className="text-xs text-slate-400">Pass rate</p>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-3">
                    <p className="text-2xl font-semibold">12</p>
                    <p className="text-xs text-slate-400">Failed tests</p>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-3">
                    <p className="text-2xl font-semibold">3</p>
                    <p className="text-xs text-slate-400">Critical bugs</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          {highlights.map((highlight) => (
            <Card key={highlight.title}>
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <h2 className="mt-4 text-lg font-semibold text-slate-900">{highlight.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{highlight.description}</p>
            </Card>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <Card>
            <div className="flex items-start gap-3">
              <BriefcaseBusiness className="mt-1 h-5 w-5 text-primary" />
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-slate-900">What this app is designed to demonstrate</h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  QA workflow understanding, defect lifecycle thinking, release coordination, practical business software design, and the ability to
                  use AI assistance productively without losing structure or realism.
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-secondary">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Milestone 1 included</p>
            <ul className="mt-4 space-y-3 text-sm text-slate-700">
              <li>Next.js + TypeScript + Tailwind scaffold</li>
              <li>Supabase client and middleware foundation</li>
              <li>Protected app layout scaffold</li>
              <li>Database schema, storage SQL, and seed script</li>
              <li>Website smoke test prototype</li>
            </ul>
          </Card>
        </section>
      </div>
    </main>
  );
}
