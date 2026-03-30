import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description: string;
  breadcrumb?: string[];
  action?: ReactNode;
};

export function PageHeader({ eyebrow, title, description, breadcrumb, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="space-y-3">
        {breadcrumb?.length ? (
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            {breadcrumb.map((item, index) => (
              <div key={item} className="flex items-center gap-2">
                {index > 0 ? <ChevronRight className="h-3.5 w-3.5" /> : null}
                <span>{item}</span>
              </div>
            ))}
          </div>
        ) : null}
        {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">{eyebrow}</p> : null}
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">{title}</h1>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}
