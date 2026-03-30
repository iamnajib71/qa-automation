import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[28px] border border-white/70 bg-card/95 p-6 text-card-foreground shadow-panel backdrop-blur-sm",
        className
      )}
      {...props}
    />
  );
}
