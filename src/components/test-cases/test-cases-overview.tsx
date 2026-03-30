import { ClipboardCheck } from "lucide-react";

import { Card } from "@/components/ui/card";
import { DataTablePreview } from "@/components/ui/data-table-preview";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";

export function TestCasesOverview() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Test Library"
        title="Test Cases"
        description="This area is intentionally structured around real QA documentation fields: module, preconditions, steps, expected result, priority, and case type."
        breadcrumb={["Workspace", "Test Cases"]}
        action={<StatusBadge label="Regression-focused design" tone="info" />}
      />

      <Card>
        <DataTablePreview
          columns={["Case ID", "Title", "Module", "Priority", "Type", "Status"]}
          rows={[
            ["TC-PAY-001", "Validate successful card payment", "Checkout", "High", "Functional", "Ready"],
            ["TC-PAY-014", "Retry failed invoice after gateway timeout", "Billing", "Critical", "Regression", "Ready"],
            ["TC-CUS-007", "Update contact preferences", "Profile", "Medium", "UAT", "Draft"]
          ]}
        />
      </Card>

      <EmptyState
        icon={ClipboardCheck}
        title="Case creation and filtering land in Milestone 4"
        description="The finished app will support searching and filtering by module, status, priority, and test type so you can show structured test management rather than simple note taking."
        actionLabel="Create test case"
      />
    </div>
  );
}
