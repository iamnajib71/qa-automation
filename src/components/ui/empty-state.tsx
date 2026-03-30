import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
};

export function EmptyState({ icon: Icon, title, description, actionLabel }: EmptyStateProps) {
  return (
    <Card className="border-dashed bg-slate-50/80 text-center">
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 py-8">
        <div className="rounded-3xl bg-primary/10 p-4 text-primary">
          <Icon className="h-6 w-6" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
          <p className="text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
        {actionLabel ? (
          <button
            type="button"
            className="rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-95"
          >
            {actionLabel}
          </button>
        ) : null}
      </div>
    </Card>
  );
}
