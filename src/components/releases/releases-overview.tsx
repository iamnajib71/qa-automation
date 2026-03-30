import { Rocket } from "lucide-react";

import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";

const releaseCards = [
  { name: "Payments Platform 2026.03", status: "In testing", window: "28 Mar - 04 Apr", readiness: "At risk" },
  { name: "Customer Portal 2026.04", status: "Planning", window: "06 Apr - 15 Apr", readiness: "On track" },
  { name: "Claims API 2.8.1", status: "Ready", window: "01 Apr", readiness: "Ready to release" }
];

export function ReleasesOverview() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Release Management"
        title="Releases"
        description="Each release ties testing scope, execution progress, defects, and go-live confidence into one operational thread."
        breadcrumb={["Workspace", "Releases"]}
      />

      <div className="grid gap-4 xl:grid-cols-3">
        {releaseCards.map((release) => (
          <Card key={release.name}>
            <div className="flex items-center justify-between">
              <StatusBadge label={release.status} tone={release.status === "Ready" ? "success" : release.status === "Planning" ? "info" : "warning"} />
              <span className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">{release.window}</span>
            </div>
            <h2 className="mt-4 text-lg font-semibold text-slate-900">{release.name}</h2>
            <p className="mt-2 text-sm text-muted-foreground">Release readiness: {release.readiness}</p>
          </Card>
        ))}
      </div>

      <EmptyState
        icon={Rocket}
        title="Release CRUD and readiness logic come in Milestone 3"
        description="The final version will let you create releases under projects, track build numbers, show release status, and surface pass/fail readiness indicators."
        actionLabel="Add release"
      />
    </div>
  );
}
