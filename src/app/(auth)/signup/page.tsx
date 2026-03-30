import Link from "next/link";
import { ArrowLeft, BadgeCheck, Mail, Shield } from "lucide-react";

import { Card } from "@/components/ui/card";

export default function SignupPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Create account</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">Set up a realistic QA portal profile</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            This scaffold mirrors the fields you will wire to Supabase in the next milestone, including full name, email, password, and role-backed
            profile creation.
          </p>

          <div className="mt-8 grid gap-4">
            {[
              ["Full name", "Alex Morgan"],
              ["Email", "alex.morgan@example.com"],
              ["Password", "��������"],
              ["Confirm password", "��������"]
            ].map(([label, value]) => (
              <div key={label} className="space-y-2">
                <label className="text-sm font-medium text-slate-800">{label}</label>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-muted-foreground">{value}</div>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="mt-6 w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-95"
          >
            Create account scaffold
          </button>

          <div className="mt-6 flex items-center justify-between text-sm text-muted-foreground">
            <Link href="/" className="inline-flex items-center gap-2 hover:text-slate-900">
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Link>
            <Link href="/login" className="font-medium text-primary hover:opacity-80">
              Already have an account?
            </Link>
          </div>
        </Card>

        <Card className="bg-slate-950 text-white">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <BadgeCheck className="h-5 w-5 text-emerald-300" />
              <h2 className="text-xl font-semibold">Profile model for Milestone 2</h2>
            </div>
            <div className="space-y-4 text-sm leading-6 text-slate-300">
              <p>Signup will create a Supabase Auth user and then insert a matching record into the `profiles` table for role and identity data.</p>
              <p>The best demo default for your portfolio is `qa_analyst`, because it unlocks the working flow you want to showcase.</p>
            </div>
          </div>

          <div className="mt-8 space-y-3 rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-amber-200" />
              <span className="text-sm">Email/password auth via Supabase</span>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="h-4 w-4 text-amber-200" />
              <span className="text-sm">Role-aware protected workspace</span>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
