"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowLeft, ArrowRight, Download, FlaskConical, LoaderCircle } from "lucide-react";
import type { CheckReport } from "@/lib/api-testing/schema";
import { downloadReport, escapeXml } from "./report-download";
import { importOpenApi } from "@/lib/api-testing/openapi";

const example = [
  { name: "Read a post", method: "GET", path: "/posts/1", expectedStatus: 200, maxMs: 5000, jsonPaths: ["id", "title"], responseSchema: { type: "object", required: ["id", "title"], properties: { id: { type: "integer" }, title: { type: "string" } } } },
  { name: "Read comments", method: "GET", path: "/posts/1/comments", expectedStatus: 200, responseSchema: { type: "array", items: { type: "object", required: ["id", "email"] } } },
  { name: "Missing record", method: "GET", path: "/posts/999999", expectedStatus: 404 },
];

const field = "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100";

export function ApiTestingWorkbench() {
  const [baseUrl, setBaseUrl] = useState("https://jsonplaceholder.typicode.com");
  const [token, setToken] = useState("");
  const [cases, setCases] = useState(JSON.stringify(example, null, 2));
  const [allowWrites, setAllowWrites] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [report, setReport] = useState<CheckReport | null>(null);
  const [contract, setContract] = useState("");
  const [importNote, setImportNote] = useState("");

  function importContract() {
    try {
      const imported = importOpenApi(JSON.parse(contract));
      if (!imported.cases.length) throw new Error("No concrete GET paths with a documented success response found. Define cases manually for parameterized paths.");
      setCases(JSON.stringify(imported.cases, null, 2));
      if (imported.baseUrl) setBaseUrl(imported.baseUrl);
      setImportNote(`Imported ${imported.cases.length} of ${imported.available} concrete GET operations with local schema references inlined. ${imported.skipped} parameterized, recursive or unsupported operations need manual cases.`);
      setError("");
    } catch (e) { setError(e instanceof Error ? e.message : "Invalid contract JSON."); }
  }

  async function run(event: FormEvent) {
    event.preventDefault(); setError(""); setReport(null);
    if (!authorized) { setError("Confirm you are permitted to test the target API."); return; }
    let parsed: unknown;
    try { parsed = JSON.parse(cases); } catch { setError("The test cases must be valid JSON."); return; }
    setBusy(true);
    try {
      const response = await fetch("/api/api-check", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ baseUrl, token, allowWrites, cases: parsed }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "The suite could not run.");
      setReport(result);
    } catch (e) { setError(e instanceof Error ? e.message : "The suite could not run."); }
    finally { setBusy(false); setToken(""); }
  }

  function junit() {
    if (!report) return;
    const xml = `<?xml version="1.0" encoding="UTF-8"?><testsuite name="API checks" tests="${report.results.length}" failures="${report.failed}" errors="${report.errors}">${report.results.map(r => `<testcase name="${escapeXml(r.name)}" time="${(r.elapsedMs || 0) / 1000}">${r.outcome === "passed" ? "" : `<${r.outcome === "error" ? "error" : "failure"} message="${escapeXml(r.error || r.assertions.filter(a => !a.passed).map(a => a.label).join(", "))}"/>`}</testcase>`).join("")}</testsuite>`;
    downloadReport("api-results.xml", xml, "application/xml");
  }

  return <main className="mx-auto max-w-7xl px-5 py-8 lg:py-12">
    <nav aria-label="Tool navigation" className="mb-8 flex flex-wrap items-center justify-between gap-4 text-sm font-medium">
      <Link href="/" className="inline-flex items-center gap-2 text-slate-600"><ArrowLeft size={16} aria-hidden="true" /> QA portfolio</Link>
      <Link href="/php-security" className="inline-flex items-center gap-2 text-blue-800">PHP patch diagnostics <ArrowRight size={16} aria-hidden="true" /></Link>
    </nav>
    <header className="rounded-3xl bg-slate-950 p-7 text-white lg:p-10">
      <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-amber-200"><FlaskConical size={18} aria-hidden="true" /> Developer testing tools</span>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight lg:text-5xl">An API check you can repeat.</h1>
      <p className="mt-4 max-w-2xl text-slate-300">Define the response you expect. Run a small suite against your API, inspect each assertion, and take the evidence into your release review.</p>
    </header>
    <div className="mt-7 grid gap-7 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <form onSubmit={run} className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3"><h2 className="text-xl font-semibold">Configure your suite</h2><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-900">Up to 3 requests</span></div>
        <label className="block text-sm font-semibold">API base URL<input type="url" required className={field} value={baseUrl} onChange={e => setBaseUrl(e.target.value)} /></label>
        <label className="block text-sm font-semibold">Bearer token <span className="font-normal text-slate-500">(optional)</span><input type="password" autoComplete="off" className={field} value={token} onChange={e => setToken(e.target.value)} placeholder="Used for this run only" /></label>
        <div><label htmlFor="api-cases" className="block text-sm font-semibold">Test cases (JSON)</label><textarea id="api-cases" className={`${field} min-h-[340px] font-mono text-xs leading-6`} spellCheck={false} value={cases} onChange={e => setCases(e.target.value)} /></div>
        <details className="rounded-xl border border-slate-200 p-4 text-sm"><summary className="cursor-pointer font-semibold">Import an OpenAPI contract</summary><div className="mt-3"><label htmlFor="api-contract" className="block font-medium">OpenAPI 3.0 / Swagger 2.0 JSON</label><textarea id="api-contract" rows={5} maxLength={200000} className={`${field} font-mono text-xs`} value={contract} onChange={e => setContract(e.target.value)} /></div><button type="button" onClick={importContract} className="mt-3 rounded-lg border border-slate-300 px-4 py-2 font-semibold">Import GET cases</button>{importNote && <p role="status" className="mt-3 leading-6 text-slate-600">{importNote}</p>}</details>
        <details className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700"><summary className="cursor-pointer font-semibold">Case format and supported checks</summary><p className="mt-3">Each case defines a name, method, path and expectedStatus. Optional maxMs checks elapsed time; jsonPaths checks dot-separated JSON paths; responseSchema accepts a bounded, inline JSON Schema. Set authenticated to false for a negative authentication case. jsonBody sends a JSON payload. Schema references, regex patterns and complex recursive schemas are unsupported in hosted runs.</p><p className="mt-3">Public HTTPS APIs on port 443 are supported. Redirects are returned as responses. Private networks are blocked. The example uses JSONPlaceholder, a public API with fictional data. These are bounded functional checks, not a load test.</p></details>
        <label className="flex items-start gap-3 text-sm"><input type="checkbox" className="mt-1" checked={allowWrites} onChange={e => setAllowWrites(e.target.checked)} /><span>Allow POST, PUT, PATCH and DELETE requests that can change target data.</span></label>
        <label className="flex items-start gap-3 text-sm"><input type="checkbox" className="mt-1" checked={authorized} onChange={e => setAuthorized(e.target.checked)} /><span>I own this API or have permission to run these checks.</span></label>
        {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-800">{error}</p>}
        <button disabled={busy} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-800 px-5 py-3 font-semibold text-white disabled:opacity-60">{busy && <LoaderCircle size={18} className="animate-spin" aria-hidden="true" />}{busy ? "Running checks…" : "Run API checks"}</button>
        <p className="text-xs leading-5 text-slate-500">Tokens, payloads and response bodies are not saved in reports. The token field clears after each run. Results stay in this tab until you download them or leave.</p>
      </form>
      <section aria-label="API results" aria-live="polite" className="min-w-0 space-y-5">
        {!report ? <div className="rounded-3xl border border-dashed border-slate-300 bg-white/60 p-8"><p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Evidence, not assumptions</p><h2 className="mt-3 text-2xl font-semibold">Your results will appear here.</h2><p className="mt-3 leading-7 text-slate-600">Try the included three-case example, or replace it with your own endpoint, status and JSON contract. A failed assertion stays visible in the report.</p></div> : <>
          <div className="grid grid-cols-3 gap-3">{[["Passed", report.passed], ["Failed", report.failed], ["Errors", report.errors]].map(([name, count]) => <div key={name} className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-600">{name}</p><p className="mt-2 text-3xl font-semibold">{count}</p></div>)}</div>
          <p className="break-all text-xs text-slate-500">{report.targetOrigin} · {report.startedAt}</p>
          {report.results.map((result, index) => <article key={index} className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex flex-wrap justify-between gap-2"><h2 className="font-semibold">{result.name}</h2><span className={`rounded-full px-3 py-1 text-xs font-semibold ${result.outcome === "passed" ? "bg-emerald-100 text-emerald-900" : "bg-red-100 text-red-900"}`}>{result.outcome}</span></div>
            <p className="mt-2 break-all font-mono text-xs text-slate-500">{result.method} {result.path} · HTTP {result.status ?? "—"} · {result.elapsedMs ?? "—"} ms</p>
            <ul className="mt-4 space-y-2 text-sm">{result.assertions.map((a, i) => <li key={i}>{a.passed ? "✓" : "✕"} {a.label}</li>)}</ul>
            {result.error && <p className="mt-3 text-sm text-red-800">{result.error}</p>}
          </article>)}
          <div className="flex flex-wrap gap-3"><button onClick={() => downloadReport("api-results.json", report)} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold"><Download size={16} aria-hidden="true" /> JSON report</button><button onClick={junit} className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold">JUnit report</button></div>
        </>}
      </section>
    </div>
  </main>;
}
