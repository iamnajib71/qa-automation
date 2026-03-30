import { PlayCircle } from "lucide-react";

import { Card } from "@/components/ui/card";
import { DataTablePreview } from "@/components/ui/data-table-preview";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

export function TestRunsOverview() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Execution Tracking"
        title="Test Runs"
        description="Test run management is where the app starts feeling closest to real delivery work: assign a release, execute cases, record results, and capture execution notes."
        breadcrumb={["Workspace", "Test Runs"]}
      />

      <Card>
        <DataTablePreview
          columns={["Run", "Release", "Owner", "Status", "Progress"]}
          rows={[
            ["Regression Pack A", "Payments 2026.03", "Alex Morgan", "In progress", "84 / 102 complete"],
            ["Smoke Validation", "Claims API 2.8.1", "Priya Shah", "Completed", "18 / 18 complete"],
            ["UAT Dry Run", "Customer Portal 2026.04", "Jordan Lee", "Not started", "0 / 24 complete"]
          ]}
        />
      </Card>

      <EmptyState
        icon={PlayCircle}
        title="Execution capture comes in Milestone 5"
        description="This module will let you assign cases to a run and mark them passed, failed, blocked, or not run, with notes and defect links for failed results."
        actionLabel="Create test run"
      />
    </div>
  );
}
