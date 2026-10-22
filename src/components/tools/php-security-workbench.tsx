"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowLeft, ArrowRight, Download, ShieldCheck } from "lucide-react";
import { assessPhpVersion, inspectPhpRuntime, phpAdvisory } from "@/lib/security/php";
import { downloadReport } from "./report-download";

export function PhpSecurityWorkbench() {
  const [version, setVersion] = useState("");
  const [source, setSource] = useState<"runtime" | "header" | "package">("runtime");
  const [inventory, setInventory] = useState("");
  const [result, setResult] = useState<ReturnType<typeof assessPhpVersion> | null>(null);
  const [checkedAt, setCheckedAt] = useState("");
  const [restarted, setRestarted] = useState(false);
  const [runtimeNotes, setRuntimeNotes] = useState<string[]>([]);
  const [runtimeError, setRuntimeError] = useState("");
  function readRuntime() {
    try {
      const runtime = inspectPhpRuntime(JSON.parse(inventory));
      setVersion(runtime.version); setSource("runtime"); setRuntimeNotes(runtime.notes); setRuntimeError(""); setResult(null);
    } catch (error) { setRuntimeError(error instanceof Error ? error.message : "Invalid runtime JSON."); setResult(null); }
  }
  function assess(event: FormEvent) { event.preventDefault(); setResult(assessPhpVersion(version, source)); setCheckedAt(new Date().toISOString()); }
  const report = { checkedAt, advisoryReviewed: phpAdvisory.checkedAt, assessment: result, evidenceSource: source,
    runtimeEvidence: inventory, configurationObservations: runtimeNotes, workersRestartedConfirmedByUser: restarted, cves: phpAdvisory.cves, references: phpAdvisory.advisories,
    limitation: "Version/configuration assessment only. No exploit, overload, memory-disclosure or compromise test was performed." };
  return <main className="mx-auto max-w-6xl px-5 py-8 lg:py-12">
    <nav aria-label="Tool navigation" className="mb-8 flex flex-wrap justify-between gap-4 text-sm font-medium"><Link href="/" className="inline-flex items-center gap-2 text-slate-600"><ArrowLeft size={16} aria-hidden="true" /> QA portfolio</Link><Link href="/api-testing" className="inline-flex items-center gap-2 text-blue-800">API testing <ArrowRight size={16} aria-hidden="true" /></Link></nav>
    <header className="rounded-3xl bg-slate-950 p-7 text-white lg:p-10"><span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-amber-200"><ShieldCheck size={18} aria-hidden="true" /> PHP developer diagnostics</span><h1 className="mt-4 text-3xl font-semibold tracking-tight lg:text-5xl">Check exposure. Patch. Verify.</h1><p className="mt-4 max-w-3xl leading-7 text-slate-300">Assess the PHP2Shell advisory against the runtime your application actually serves. Keep the evidence, choose the right update, and confirm every worker is running the patched version.</p></header>
    <div className="mt-7 grid gap-7 lg:grid-cols-2">
      <form onSubmit={assess} className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6"><h2 className="text-xl font-semibold">1. Gather runtime evidence</h2>
        <p className="text-sm leading-6 text-slate-600">Run the small diagnostic helper in your own environment. A CLI installation can differ from PHP-FPM or Apache; use evidence from the serving runtime. Keep diagnostic endpoints private and remove them afterward.</p>
        <a href="/tools/php-runtime-check.php.txt" download="php-runtime-check.php" className="inline-flex items-center gap-2 font-semibold text-blue-800 underline"><Download size={16} aria-hidden="true" /> Download PHP runtime helper</a>
        <pre className="overflow-x-auto rounded-xl bg-slate-950 p-4 text-xs leading-6 text-slate-200">{`php php-runtime-check.php\n# Docker: run inside the serving container\ndocker exec <container> php /path/php-runtime-check.php`}</pre>
        <label className="block text-sm font-semibold">PHP version<input required placeholder="For example, 8.4.26" value={version} onChange={e => { setVersion(e.target.value); setResult(null); }} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-mono" /></label>
        <div><label htmlFor="php-evidence-source" className="block text-sm font-semibold">Evidence source</label><select id="php-evidence-source" value={source} onChange={e => { setSource(e.target.value as typeof source); setResult(null); }} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3"><option value="runtime">Actual runtime version</option><option value="package">Distribution package / vendor backport</option><option value="header">Remote HTTP header only</option></select></div>
        <div><label htmlFor="php-inventory" className="block text-sm font-semibold">Runtime or package evidence <span className="font-normal text-slate-500">(optional, stored in this tab only)</span></label><textarea id="php-inventory" rows={5} value={inventory} onChange={e => { setInventory(e.target.value); setRuntimeNotes([]); setResult(null); }} placeholder="Paste the helper output or vendor package advisory. Exclude secrets." className="mt-2 w-full rounded-xl border border-slate-300 p-4 font-mono text-xs" /></div>
        <button type="button" onClick={readRuntime} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold">Read runtime JSON</button>{runtimeError && <p role="alert" className="text-sm text-red-800">{runtimeError}</p>}{runtimeNotes.length > 0 && <ul className="space-y-2 rounded-xl bg-blue-50 p-4 text-sm leading-6 text-blue-950">{runtimeNotes.map(note => <li key={note}>{note}</li>)}</ul>}
        <label className="flex items-start gap-3 text-sm"><input type="checkbox" checked={restarted} onChange={e => setRestarted(e.target.checked)} className="mt-1" />I have restarted every serving PHP worker after applying the update.</label>
        <button className="w-full rounded-xl bg-blue-800 px-5 py-3 font-semibold text-white">Assess PHP patch status</button>
      </form>
      <section aria-live="polite" className="space-y-5">
        <div className="rounded-3xl border border-slate-200 bg-white p-6"><h2 className="text-xl font-semibold">2. Review exposure and update</h2>
          {result ? <div className="mt-4" data-testid="php-assessment"><span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${result.status === "upstream-fixed" ? "bg-emerald-100 text-emerald-900" : result.status === "needs-update" ? "bg-red-100 text-red-900" : "bg-amber-100 text-amber-950"}`}>{result.status}</span><h3 className="mt-4 text-xl font-semibold">{result.title}</h3><p className="mt-3 text-sm leading-7 text-slate-600">{result.detail}</p>{result.fixedVersion && <p className="mt-3 font-mono text-sm">Upstream branch minimum: {result.fixedVersion}</p>}</div> : <p className="mt-4 text-sm leading-7 text-slate-600">Enter the actual runtime version to assess the two published CVEs. A website URL or successful normal request cannot prove a server is patched.</p>}
          <table className="mt-6 w-full text-left text-sm"><caption className="mb-3 text-left font-semibold">Upstream fixes released 21 October 2026</caption><thead><tr className="border-b"><th className="py-2">Branch</th><th>Fixed release</th></tr></thead><tbody>{Object.entries(phpAdvisory.fixed).map(([branch, fixed]) => <tr key={branch} className="border-b border-slate-100"><td className="py-2">PHP {branch}</td><td className="font-mono">{fixed}</td></tr>)}</tbody></table>
          <p className="mt-4 text-xs leading-6 text-slate-500">{phpAdvisory.cves.join(" · ")}<br />Advisory data reviewed {phpAdvisory.checkedAt}. This checker does not automatically refresh vulnerability feeds.</p><a href={phpAdvisory.source} className="mt-3 inline-block text-sm font-semibold text-blue-800 underline">Read the PHP security advisory</a>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6"><h2 className="text-xl font-semibold">3. Verify the fix and retain evidence</h2><ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-6 text-slate-700"><li>Update using the official release or your distribution’s security package. Confirm the vendor explicitly fixes both CVEs if it backports patches.</li><li>Restart all PHP-FPM pools, Apache/mod_php workers or serving containers. Updating a file on disk does not update a running worker.</li><li>Run the helper again in the serving environment. Reassess the reported version and repeat your application’s functional and isolation regressions.</li><li>Export the before/after reports with the package changelog and your real regression results for review.</li></ol><p className="mt-4 rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-950">This tool assesses declared version evidence. It does not trigger memory exhaustion, demonstrate exploitation, certify that a site is safe, or determine whether it was compromised. Vendor backports and hidden versions remain inconclusive without supporting evidence.</p>
          {result && <button onClick={() => downloadReport("php-patch-assessment.json", report)} className="mt-5 inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold"><Download size={16} aria-hidden="true" /> Download diagnostic report</button>}
        </div>
      </section>
    </div>
  </main>;
}
