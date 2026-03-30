import Link from "next/link";

import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { getProjectScanHistory } from "@/lib/scan/local-store";

function readinessTone(readiness: "good" | "watch" | "at_risk") {
  switch (readiness) {
    case "good":
      return "success" as const;
    case "watch":
      return "warning" as const;
    default:
      return "danger" as const;
  }
}

type ProjectDetailOverviewProps = {
  projectId: string;
};

export async function ProjectDetailOverview({ projectId }: ProjectDetailOverviewProps) {
  const scans = await getProjectScanHistory(projectId);
  const latest = scans[0] ?? null;

  if (!latest) {
    return (
      <div className="space-y-8">
        <PageHeader
          eyebrow="Project Detail"
          title="Project not scanned yet"
          description="This workspace exists, but it does not have any automated scan history yet. Run the smoke test to create the first page scan, findings, and evidence set."
          breadcrumb={["Workspace", "Projects", projectId]}
        />
        <Card>
          <Link href="/smoke-test" className="inline-flex rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-95">
            Run a scan
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Project Detail"
        title={latest.project.name}
        description={latest.project.description}
        breadcrumb={["Workspace", "Projects", latest.project.projectKey]}
        action={<StatusBadge label={latest.scanRun.summary.releaseReadiness.replace("_", " ")} tone={readinessTone(latest.scanRun.summary.releaseReadiness)} />}
      />

      <div className="grid gap-4 xl:grid-cols-4">
        <Card>
          <p className="text-sm font-medium text-muted-foreground">Base URL</p>
          <p className="mt-2 break-all text-sm font-semibold text-slate-900">{latest.project.baseUrl}</p>
        </Card>
        <Card>
          <p className="text-sm font-medium text-muted-foreground">Pages scanned</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{scans.length}</p>
        </Card>
        <Card>
          <p className="text-sm font-medium text-muted-foreground">Accessibility issues</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{scans.reduce((sum, item) => sum + item.scanRun.summary.accessibilityIssueCount, 0)}</p>
        </Card>
        <Card>
          <p className="text-sm font-medium text-muted-foreground">Total findings</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{scans.reduce((sum, item) => sum + item.findings.length, 0)}</p>
        </Card>
      </div>

      <Card className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Latest scan</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">{latest.pageScan.finalUrl}</h2>
          </div>
          <Link href="/smoke-test" className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
            Run another scan
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm font-medium text-muted-foreground">Performance</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{latest.scanRun.summary.performanceScore ?? "N/A"}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm font-medium text-muted-foreground">Accessibility</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{latest.scanRun.summary.accessibilityScore ?? "N/A"}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm font-medium text-muted-foreground">SEO</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{latest.scanRun.summary.seoScore ?? "N/A"}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm font-medium text-muted-foreground">Best practices</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{latest.scanRun.summary.bestPracticesScore ?? "N/A"}</p>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="space-y-4">
          <p className="text-sm font-medium text-slate-900">Recent findings</p>
          {latest.findings.length > 0 ? (
            latest.findings.map((finding) => (
              <div key={finding.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-slate-900">{finding.title}</p>
                  <StatusBadge label={finding.severity} tone={finding.severity === "critical" || finding.severity === "high" ? "danger" : finding.severity === "medium" ? "warning" : "info"} />
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{finding.description}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-500">{finding.status.replace("_", " ")} • {finding.source}</p>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-muted-foreground">No findings stored yet.</div>
          )}
        </Card>

        <Card className="space-y-4">
          <p className="text-sm font-medium text-slate-900">Evidence</p>
          {latest.evidence.map((item) => (
            <a key={item.id} href={item.filePath} target="_blank" rel="noreferrer" className="block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 transition hover:border-slate-300 hover:bg-white">
              {item.label}
            </a>
          ))}
        </Card>
      </div>
    </div>
  );
}

