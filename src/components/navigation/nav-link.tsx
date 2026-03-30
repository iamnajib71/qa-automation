"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { NavigationItem } from "@/constants/navigation";
import { cn } from "@/lib/utils/cn";

type NavLinkProps = {
  item: NavigationItem;
};

export function NavLink({ item }: NavLinkProps) {
  const pathname = usePathname();
  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={cn(
        "group flex items-start gap-3 rounded-2xl border px-4 py-3 transition",
        active
          ? "border-primary/30 bg-primary text-primary-foreground shadow-soft"
          : "border-transparent bg-white/70 text-slate-700 hover:border-slate-200 hover:bg-white"
      )}
    >
      <span
        className={cn(
          "mt-0.5 rounded-xl p-2 transition",
          active ? "bg-white/15" : "bg-slate-100 text-primary group-hover:bg-slate-200"
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className="space-y-1">
        <span className={cn("block text-sm font-semibold", active ? "text-white" : "text-slate-900")}>{item.label}</span>
        <span className={cn("block text-xs leading-5", active ? "text-slate-200" : "text-muted-foreground")}>
          {item.description}
        </span>
      </span>
    </Link>
  );
}
