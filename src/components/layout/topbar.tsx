import { Bell, Search, ShieldCheck } from "lucide-react";

import { StatusBadge } from "@/components/ui/status-badge";

type TopbarProps = {
  pageTitle?: string;
};

export function Topbar({ pageTitle = "Delivery Overview" }: TopbarProps) {
  return (
    <header className="rounded-[28px] border border-white/70 bg-white/80 px-5 py-4 shadow-panel backdrop-blur-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">Quality Operations Workspace</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900">{pageTitle}</h2>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex min-w-[220px] items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-muted-foreground">
            <Search className="h-4 w-4" />
            <span>Search projects, runs, defects...</span>
          </div>

          <div className="flex items-center gap-3">
            <StatusBadge label="Auth scaffold" tone="info" />
            <StatusBadge label="Role: QA Analyst" tone="success" />
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <ShieldCheck className="h-4 w-4" />
              Sign out
            </button>
            <button
              type="button"
              className="inline-flex items-center rounded-2xl border border-slate-200 bg-white p-2 text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <Bell className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
