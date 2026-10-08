"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { defectInput, type Defect } from "@/lib/defects/schema";

const blank = { title: "", description: "", severity: "medium", priority: "medium", status: "open" };
const control = "w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-900";
const button = "rounded-xl bg-slate-900 px-4 py-2 font-semibold text-white disabled:opacity-50";

export function DefectWorkbench() {
  const [defects, setDefects] = useState<Defect[]>([]);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const refresh = useCallback(async () => {
    const response = await fetch("/api/defects", { cache: "no-store" });
    if (!response.ok) throw new Error("Unable to load defects.");
    setDefects((await response.json()).defects);
  }, []);
  useEffect(() => { refresh().catch((e: Error) => setError(e.message)); }, [refresh]);

  async function save(event: FormEvent) {
    event.preventDefault(); setError(""); setNotice("");
    const parsed = defectInput.safeParse(form);
    if (!parsed.success) { setError("Enter a title of 3–120 characters and a description of 1–2000 characters."); return; }
    setBusy(true);
    try {
      const response = await fetch(editing ? `/api/defects/${editing}` : "/api/defects", {
        method: editing ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(parsed.data)
      });
      if (!response.ok) throw new Error((await response.json()).error);
      await refresh(); setNotice(editing ? "Defect updated." : "Defect created."); setForm(blank); setEditing(null);
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to save defect."); }
    finally { setBusy(false); }
  }
  async function remove(id: string) {
    setError(""); setBusy(true);
    try {
      const response = await fetch(`/api/defects/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Unable to delete defect.");
      await refresh(); setNotice("Defect deleted.");
      if (editing === id) { setEditing(null); setForm(blank); }
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to delete defect."); }
    finally { setBusy(false); }
  }
  return <div className="space-y-6">
    <PageHeader eyebrow="Functional test workspace" title="Defects" description="Log, prioritise, retest and close defects. This local portfolio workspace uses synthetic data only." breadcrumb={["Workspace", "Defects"]} />
    <div role="status" aria-live="polite" className="text-emerald-800">{notice}</div>
    {error && <p role="alert" className="rounded-xl bg-rose-50 p-4 text-rose-800">{error}</p>}
    <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
      <Card><h2 className="mb-4 text-xl font-semibold">{editing ? "Edit defect" : "Log defect"}</h2>
        <form onSubmit={save} noValidate className="space-y-4">
          <label className="block">Title<input aria-label="Title" className={control} value={form.title} maxLength={120} onChange={e => setForm({ ...form, title: e.target.value })} /></label>
          <label className="block">Description<textarea aria-label="Description" className={control} value={form.description} maxLength={2000} onChange={e => setForm({ ...form, description: e.target.value })} /></label>
          {([['severity', ['low', 'medium', 'high', 'critical']], ['priority', ['low', 'medium', 'high']], ['status', ['open', 'in_progress', 'retest', 'closed']]] as const).map(([field, options]) =>
            <label key={field} className="block capitalize">{field}<select aria-label={field[0].toUpperCase() + field.slice(1)} className={control} value={form[field]} onChange={e => setForm({ ...form, [field]: e.target.value })}>
              {options.map(option => <option key={option} value={option}>{option.replace('_', ' ')}</option>)}
            </select></label>)}
          <button className={button} disabled={busy} type="submit">{editing ? "Save changes" : "Create defect"}</button>
          {editing && <button type="button" className="ml-3 underline" onClick={() => { setEditing(null); setForm(blank); }}>Cancel</button>}
        </form>
      </Card>
      <Card><h2 className="mb-4 text-xl font-semibold">Saved defects</h2>
        {!defects.length && <p>No defects yet. Log a synthetic defect to begin.</p>}
        <div className="space-y-4">{defects.map(defect => <article key={defect.id} data-testid="defect-card" className="rounded-xl border border-slate-200 p-4">
          <h3 className="text-lg font-semibold">{defect.title}</h3><p className="whitespace-pre-wrap break-words text-slate-700">{defect.description}</p>
          <p className="my-3 text-sm text-slate-700">Severity: {defect.severity} · Priority: {defect.priority} · Status: <span data-testid="defect-status">{defect.status.replace('_', ' ')}</span></p>
          <button disabled={busy} className={button} onClick={() => { setEditing(defect.id); setForm({ title: defect.title, description: defect.description, severity: defect.severity, priority: defect.priority, status: defect.status }); setNotice(""); }}>Edit <span className="sr-only">{defect.title}</span></button>
          <button disabled={busy} className="ml-4 rounded-xl border border-rose-300 px-4 py-2 text-rose-800" onClick={() => remove(defect.id)}>Delete <span className="sr-only">{defect.title}</span></button>
        </article>)}</div>
      </Card>
    </div>
  </div>;
}
