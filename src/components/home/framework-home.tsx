import Link from "next/link";
import { CheckCircle2, FlaskConical, Bug, Globe } from "lucide-react";
import { Card } from "@/components/ui/card";

export function FrameworkHome() {
  return <main className="mx-auto max-w-7xl space-y-6 px-6 py-10">
    <section className="rounded-[32px] bg-slate-950 p-8 text-white shadow-soft lg:p-12">
      <p className="text-sm font-semibold uppercase tracking-widest text-amber-200">Nazmul Hassan · QA automation portfolio</p>
      <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-tight lg:text-6xl">A real app. A tested API. Evidence you can inspect.</h1>
      <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">Explore the portal used by this test automation framework: log a synthetic defect, run a real browser scan, and inspect saved findings and evidence.</p>
      <div className="mt-8 flex flex-wrap gap-4">
        <Link href="/defects" className="rounded-xl bg-amber-200 px-5 py-3 font-semibold text-slate-950">Try defect workflow</Link>
        <Link href="/smoke-test" className="rounded-xl border border-slate-400 px-5 py-3 font-semibold">Try smoke test</Link>
        <Link href="/dashboard" className="rounded-xl border border-slate-400 px-5 py-3 font-semibold">Open demo workspace</Link>
      </div>
    </section>
    <section className="grid gap-5 md:grid-cols-3">
      {[{icon:Bug,title:"Functional and regression testing",description:"Defect creation, validation, persistence, retest, closure and deletion through UI and REST API."}, {icon:Globe,title:"Browser and accessibility testing",description:"Cypress page objects, Playwright end-to-end journeys, and axe checks against WCAG 2.1 AA rules."}, {icon:FlaskConical,title:"Repeatable release evidence",description:"Unit tests, Postman/Newman contracts, local k6 smoke tests and GitHub Actions reports."}].map(({icon:Icon,title,description})=><Card key={title}><Icon className="h-6 w-6 text-primary" aria-hidden="true" /><h2 className="mt-4 text-xl font-semibold">{title}</h2><p className="mt-3 leading-7 text-slate-700">{description}</p></Card>)}
    </section>
    <Card><div className="flex gap-3"><CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-primary" aria-hidden="true"/><div><h2 className="text-xl font-semibold">Local portfolio workspace</h2><p className="mt-3 leading-7 text-slate-700">Defects and scans are saved locally. Dashboard, releases, test cases, runs and reports contain labelled synthetic previews. Authentication and team permissions are scaffolds. Use fictional data only.</p><a className="mt-4 inline-block font-semibold text-primary underline" href="https://github.com/iamnajib71/qa-automation">Read the framework, results and test documentation on GitHub</a></div></div></Card>
  </main>;
}
