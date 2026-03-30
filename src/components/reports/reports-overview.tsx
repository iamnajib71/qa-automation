import { BarChart3 } from "lucide-react";

import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";

const chartBars = [
  { label: "Critical", value: 4, color: "bg-rose-500" },
  { label: "High", value: 7, color: "bg-amber-500" },
  { label: "Medium", value: 5, color: "bg-sky-500" },
  { label: "Low", value: 2, color: "bg-emerald-500" }
];

export function ReportsOverview() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Operational Reporting"
        title="Reports"
        description="Reporting is what makes the app speak the language of stakeholders: severity trends, execution performance, release readiness, and testing outcomes over time."
        breadcrumb={["Workspace", "Reports"]}
        action={<StatusBadge label="Chart scaffolds in place" tone="info" />}
      />

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <p className="text-sm font-medium text-muted-foreground">Defect summary by severity</p>
          <div className="mt-6 space-y-4">
            {chartBars.map((bar) => (
              <div key={bar.label} className="space-y-2">
                <div className="flex items-center justify-between text-sm text-slate-700">
                  <span>{bar.label}</span>
                  <span>{bar.value}</span>
                </div>
                <div className="h-3 rounded-full bg-slate-100">
                  <div className={`h-3 rounded-full ${bar.color}`} style={{ width: `${bar.value * 10}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <EmptyState
          icon={BarChart3}
          title="Full reporting lands in Milestone 7"
          description="The final report views will show defect severity summaries, execution trends by release, pass/fail progress, and a release-readiness view that ties results back to go-live confidence."
          actionLabel="Open reporting backlog"
        />
      </div>
    </div>
  );
}
