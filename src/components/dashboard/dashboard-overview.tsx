import { AlertTriangle, ClipboardCheck, FolderKanban, Rocket } from "lucide-react";

import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";

const releaseItems = [
  { release: "Payments Platform 2026.03", status: "In testing", passRate: "84%", defects: "7 open" },
  { release: "Customer Portal 2026.04", status: "UAT prep", passRate: "N/A", defects: "2 open" },
  { release: "Claims API 2.8.1", status: "Ready", passRate: "92%", defects: "1 high" }
];

const activityItems = [
  "Regression run updated for Payments Platform 2026.03",
  "Critical defect raised against invoice retry workflow",
  "Release readiness review notes added for Customer Portal",
  "API smoke suite archived after release sign-off"
];

export function DashboardOverview() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Release Command Centre"
        title="Quality dashboard"
        description="A business-style landing view for active QA work. This gives you a credible story in interviews around release visibility, defect exposure, test execution confidence, and operational reporting."
        breadcrumb={["Workspace", "Dashboard"]}
        action={<StatusBadge label="Demo data ready for Milestone 3" tone="info" />}
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Active projects" value="06" trend="2 banking systems, 4 internal platforms" icon={FolderKanban} tone="primary" />
        <MetricCard label="Open defects" value="18" trend="3 critical defects awaiting retest" icon={AlertTriangle} tone="danger" />
        <MetricCard label="Ready test cases" value="246" trend="Smoke, regression, UAT, and API coverage" icon={ClipboardCheck} tone="success" />
        <MetricCard label="Releases in motion" value="03" trend="1 in execution, 1 in UAT, 1 nearing sign-off" icon={Rocket} tone="warning" />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Release readiness</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-900">Current release health</h2>
            </div>
            <StatusBadge label="Portfolio snapshot" tone="success" />
          </div>
          <div className="mt-6 space-y-4">
            {releaseItems.map((item) => (
              <div key={item.release} className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{item.release}</p>
                  <p className="text-sm text-muted-foreground">{item.status}</p>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="rounded-2xl bg-white px-3 py-2 text-slate-700">Pass rate: {item.passRate}</div>
                  <div className="rounded-2xl bg-white px-3 py-2 text-slate-700">{item.defects}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-slate-950 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Recent activity</p>
          <h2 className="mt-2 text-xl font-semibold">QA operations timeline</h2>
          <div className="mt-6 space-y-4">
            {activityItems.map((item, index) => (
              <div key={item} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="h-3 w-3 rounded-full bg-amber-300" />
                  {index < activityItems.length - 1 ? <div className="mt-2 h-full w-px bg-white/10" /> : null}
                </div>
                <p className="pb-4 text-sm leading-6 text-slate-300">{item}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
