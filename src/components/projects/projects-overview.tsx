import Link from "next/link";
import { FolderKanban, ScanSearch } from "lucide-react";

import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { listProjectsWithSummary } from "@/lib/scan/local-store";

export async function ProjectsOverview() {
  const projects = await listProjectsWithSummary();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Project Portfolio"
        title="Projects"
        description="Projects now begin to reflect real automated website QA work. Each saved smoke test can create or update a project-backed workspace with recent scan evidence and findings."
        breadcrumb={["Workspace", "Projects"]}
        action={<StatusBadge label={`${projects.length} tracked`} tone="info" />}
      />

      {projects.length > 0 ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {projects.map(({ project, latestScan, latestPage, findingCount }) => (
            <Card key={project.id} className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">{project.projectKey}</p>
                  <h2 className="mt-2 text-xl font-semibold text-slate-900">{project.name}</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{project.description}</p>
                </div>
                <StatusBadge label={project.status.replace("_", " ")} tone="success" />
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm font-medium text-muted-foreground">Base URL</p>
                  <p className="mt-2 break-all text-sm font-semibold text-slate-900">{project.baseUrl}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm font-medium text-muted-foreground">Latest readiness</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{latestScan?.summary.releaseReadiness.replace("_", " ") ?? "No scans yet"}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm font-medium text-muted-foreground">Total findings</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">{findingCount}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span>Latest page: {latestPage?.normalizedUrl ?? "No page saved yet"}</span>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link href={`/projects/${project.id}`} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-95">
                  <FolderKanban className="h-4 w-4" />
                  Open project
                </Link>
                <Link href="/smoke-test" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
                  <ScanSearch className="h-4 w-4" />
                  Run new scan
                </Link>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed bg-slate-50/80 text-center">
          <div className="mx-auto flex max-w-xl flex-col items-center gap-4 py-8">
            <div className="rounded-3xl bg-primary/10 p-4 text-primary">
              <FolderKanban className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-slate-900">No projects saved yet</h3>
              <p className="text-sm leading-6 text-muted-foreground">Run the public smoke test once and the portal will save a project-backed workspace for that website automatically.</p>
            </div>
            <Link href="/smoke-test" className="rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-95">
              Start first scan
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}

