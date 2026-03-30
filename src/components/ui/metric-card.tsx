import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

type MetricCardProps = {
  label: string;
  value: string;
  trend: string;
  icon: LucideIcon;
  tone?: "primary" | "success" | "warning" | "danger";
};

const toneMap = {
  primary: "bg-primary/10 text-primary",
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-rose-100 text-rose-700"
};

export function MetricCard({ label, value, trend, icon: Icon, tone = "primary" }: MetricCardProps) {
  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <span className={cn("rounded-2xl p-2", toneMap[tone])}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div className="space-y-1">
        <p className="text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
        <p className="text-sm text-muted-foreground">{trend}</p>
      </div>
    </Card>
  );
}
