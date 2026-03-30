"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";

import { mainNavigation } from "@/constants/navigation";
import { NavLink } from "@/components/navigation/nav-link";

export function Sidebar() {
  return (
    <aside className="flex h-full flex-col gap-6 rounded-[28px] border border-white/70 bg-slate-950/95 p-5 text-white shadow-soft">
      <Link href="/" className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-amber-300/20 p-2 text-amber-200">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-300">QA Portfolio App</p>
            <h1 className="text-lg font-semibold leading-tight">QA Test Management Portal</h1>
            <p className="text-sm text-slate-300">Practical QA delivery software with release and defect workflow structure.</p>
          </div>
        </div>
      </Link>

      <nav className="space-y-2">
        {mainNavigation.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
      </nav>

      <div className="mt-auto rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Milestone 1</p>
        <p className="mt-2 text-sm text-slate-200">
          Layout, Supabase scaffolding, SQL schema, and a website smoke test prototype are ready to build on.
        </p>
      </div>
    </aside>
  );
}

