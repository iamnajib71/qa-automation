import { AlertTriangle } from "lucide-react";

import { Card } from "@/components/ui/card";
import { DataTablePreview } from "@/components/ui/data-table-preview";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

export function DefectsOverview() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Defect Lifecycle"
        title="Defects"
        description="This workflow is intentionally aligned to interview-ready QA language: open, in progress, retest, and closed, with severity, priority, environment, and ownership."
        breadcrumb={["Workspace", "Defects"]}
      />

      <Card>
        <DataTablePreview
          columns={["Defect", "Severity", "Priority", "Status", "Environment", "Owner"]}
          rows={[
            ["BUG-PAY-014", "Critical", "High", "Open", "UAT", "Release Manager"],
            ["BUG-PAY-016", "High", "High", "Retest", "SIT", "QA Analyst"],
            ["BUG-CUS-003", "Medium", "Medium", "In progress", "UAT", "Dev Lead"]
          ]}
        />
      </Card>

      <EmptyState
        icon={AlertTriangle}
        title="Defect creation, linking, and evidence upload come in Milestone 6"
        description="Failed execution results will be able to raise defects directly, attach screenshots in Supabase storage, and track the issue through retest and closure."
        actionLabel="Log defect"
      />
    </div>
  );
}
