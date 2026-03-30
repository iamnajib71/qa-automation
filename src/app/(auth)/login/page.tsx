import Link from "next/link";
import { ArrowLeft, LockKeyhole, Mail } from "lucide-react";

import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="bg-slate-950 text-white">
          <StatusBadge label="Milestone 1" tone="warning" className="bg-amber-200 text-amber-900" />
          <h1 className="mt-6 text-3xl font-semibold tracking-tight">Sign in to your QA workspace</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Authentication wiring is scaffolded in this milestone. The real Supabase sign-in flow, role fetch, and protected session handling land in
            Milestone 2.
          </p>

          <div className="mt-8 space-y-4 rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Email</label>
              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-900 px-3 py-3 text-slate-400">
                <Mail className="h-4 w-4" />
                <span>qa.analyst@example.com</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Password</label>
              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-900 px-3 py-3 text-slate-400">
                <LockKeyhole className="h-4 w-4" />
                <span>��������</span>
              </div>
            </div>
            <button
              type="button"
              className="w-full rounded-2xl bg-amber-300 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-200"
            >
              Sign in scaffold
            </button>
          </div>

          <div className="mt-6 flex items-center justify-between text-sm text-slate-300">
            <Link href="/" className="inline-flex items-center gap-2 hover:text-white">
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Link>
            <Link href="/signup" className="font-medium text-amber-200 hover:text-amber-100">
              Create account
            </Link>
          </div>
        </Card>

        <Card>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Auth setup notes</p>
          <h2 className="mt-4 text-2xl font-semibold text-slate-900">What this page already proves</h2>
          <div className="mt-6 space-y-4 text-sm leading-6 text-muted-foreground">
            <p>The app structure is already ready for public routes, protected routes, session-aware middleware, and role-based navigation.</p>
            <p>This is a realistic portfolio approach: the UX is visible now, and the actual auth behavior gets wired next without needing a redesign.</p>
          </div>
        </Card>
      </div>
    </main>
  );
}
