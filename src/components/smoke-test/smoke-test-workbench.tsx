"use client";

import { FormEvent, useEffect, useState } from "react";
import { ExternalLink, Globe, LoaderCircle, ShieldAlert, ShieldCheck } from "lucide-react";

import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";

type Severity = "low" | "medium" | "high" | "critical";
type FindingStatus = "suggested_test_case" | "automated_finding" | "draft_defect" | "confirmed_defect";

type ScanResult = {
  project: {
    id: string;
    projectKey: string;
    name: string;
    description: string;
    baseUrl: string;
    environment: string;
    status: string;
  };
  page: {
    id: string;
    normalizedUrl: string;
    title: string | null;
  };
  scanRun: {
    id: string;
    baseUrl: string;
    summary: {
      findingCount: number;
      accessibilityIssueCount: number;
      performanceScore: number | null;
      accessibilityScore: number | null;
      seoScore: number | null;
      bestPracticesScore: number | null;
      releaseReadiness: "good" | "watch" | "at_risk";
    };
    completedAt: string | null;
  };
  pageScan: {
    finalUrl: string;
    title: string | null;
    httpStatus: number | null;
    responseTimeMs: number | null;
    linkCount: number;
    formCount: number;
    buttonCount: number;
    inputCount: number;
    imageCount: number;
    consoleErrorCount: number;
    requestFailureCount: number;
    confidenceScore: number;
  };
  findings: {
    id: string;
    category: string;
    title: string;
    description: string;
    severity: Severity;
    confidenceScore: number;
    source: string;
    recommendedAction: string;
    status: FindingStatus;
  }[];
  evidence: {
    id: string;
    kind: "screenshot" | "raw_scan" | "axe_results";
    label: string;
    filePath: string;
    contentType: string;
    fileSize: number;
    source: string;
  }[];
};

function formatConfidence(value: number) {
  return `${Math.round(value * 100)}%`;
}

function scoreTone(score: number | null) {
  if (score === null) {
    return "text-slate-500";
  }
  if (score >= 85) {
    return "text-emerald-600";
  }
  if (score >= 60) {
    return "text-amber-600";
  }
  return "text-rose-600";
}

function readinessTone(readiness: "good" | "watch" | "at_risk") {
  switch (readiness) {
    case "good":
      return "success" as const;
    case "watch":
      return "warning" as const;
    default:
      return "danger" as const;
  }
}

function severityClasses(severity: Severity) {
  switch (severity) {
    case "critical":
      return "border-rose-200 bg-rose-50 text-rose-800";
    case "high":
      return "border-orange-200 bg-orange-50 text-orange-800";
    case "medium":
      return "border-amber-200 bg-amber-50 text-amber-800";
    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

function ResultPanel({ result }: { result: ScanResult }) {
  const screenshot = result.evidence.find((item) => item.kind === "screenshot");
  const rawScan = result.evidence.find((item) => item.kind === "raw_scan");
  const axe = result.evidence.find((item) => item.kind === "axe_results");

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Saved project</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-900">{result.project.name}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{result.project.description}</p>
        </div>
        <StatusBadge label={result.scanRun.summary.releaseReadiness.replace("_", " ")} tone={readinessTone(result.scanRun.summary.releaseReadiness)} />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-sm font-medium text-muted-foreground">HTTP status</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{result.pageScan.httpStatus ?? "N/A"}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-sm font-medium text-muted-foreground">Response time</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{result.pageScan.responseTimeMs ?? "N/A"}ms</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-sm font-medium text-muted-foreground">Findings</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{result.scanRun.summary.findingCount}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-sm font-medium text-muted-foreground">Source</p>
          <p className="mt-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-900">automated-rule</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-medium text-muted-foreground">Performance</p>
          <p className={`mt-2 text-2xl font-semibold ${scoreTone(result.scanRun.summary.performanceScore)}`}>{result.scanRun.summary.performanceScore ?? "N/A"}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-medium text-muted-foreground">Accessibility</p>
          <p className={`mt-2 text-2xl font-semibold ${scoreTone(result.scanRun.summary.accessibilityScore)}`}>{result.scanRun.summary.accessibilityScore ?? "N/A"}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-medium text-muted-foreground">SEO</p>
          <p className={`mt-2 text-2xl font-semibold ${scoreTone(result.scanRun.summary.seoScore)}`}>{result.scanRun.summary.seoScore ?? "N/A"}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-medium text-muted-foreground">Best practices</p>
          <p className={`mt-2 text-2xl font-semibold ${scoreTone(result.scanRun.summary.bestPracticesScore)}`}>{result.scanRun.summary.bestPracticesScore ?? "N/A"}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-4">
          <div>
            <p className="text-sm font-medium text-slate-900">Page summary</p>
            <p className="mt-2 text-sm text-muted-foreground">{result.pageScan.finalUrl}</p>
            <p className="mt-1 text-sm text-slate-700">{result.pageScan.title ?? "No page title detected"}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">Links discovered: {result.pageScan.linkCount}</div>
            <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">Forms discovered: {result.pageScan.formCount}</div>
            <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">Buttons discovered: {result.pageScan.buttonCount}</div>
            <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">Inputs discovered: {result.pageScan.inputCount}</div>
            <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">Images discovered: {result.pageScan.imageCount}</div>
            <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">Console errors: {result.pageScan.consoleErrorCount}</div>
          </div>
          <div className="rounded-2xl border border-dashed border-slate-200 p-3 text-sm text-muted-foreground">
            Confidence: {formatConfidence(result.pageScan.confidenceScore)}. Generated items are saved with source labels so manual and automated QA work can sit side by side later.
          </div>
        </div>

        <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-medium text-slate-900">Evidence artifacts</p>
          {screenshot ? <img src={screenshot.filePath} alt="Scanned page screenshot" className="w-full rounded-2xl border border-slate-200" /> : null}
          <div className="space-y-2 text-sm">
            {rawScan ? (
              <a href={rawScan.filePath} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-slate-700 hover:bg-slate-100">
                <span>{rawScan.label}</span>
                <ExternalLink className="h-4 w-4" />
              </a>
            ) : null}
            {axe ? (
              <a href={axe.filePath} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-slate-700 hover:bg-slate-100">
                <span>{axe.label}</span>
                <ExternalLink className="h-4 w-4" />
              </a>
            ) : null}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-slate-900">Automated findings</p>
        {result.findings.length > 0 ? (
          result.findings.map((finding) => (
            <div key={finding.id} className={`rounded-2xl border p-4 ${severityClasses(finding.severity)}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold">{finding.title}</p>
                  <p className="mt-2 text-sm leading-6">{finding.description}</p>
                </div>
                <div className="text-right text-xs uppercase tracking-[0.2em]">
                  <p>{finding.severity}</p>
                  <p className="mt-2">{finding.status.replace("_", " ")}</p>
                </div>
              </div>
              <p className="mt-3 text-sm">Recommended next action: {finding.recommendedAction}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-500">Source {finding.source} • Confidence {formatConfidence(finding.confidenceScore)}</p>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-muted-foreground">No findings were generated for this scan.</div>
        )}
      </div>
    </div>
  );
}

export function SmokeTestWorkbench() {
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [recentScans, setRecentScans] = useState<ScanResult[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(true);

  async function loadRecentScans() {
    setLoadingRecent(true);
    try {
      const response = await fetch("/api/smoke-test?limit=4", { cache: "no-store" });
      const data = (await response.json()) as { scans: ScanResult[] };
      setRecentScans(data.scans ?? []);
    } catch {
      setRecentScans([]);
    } finally {
      setLoadingRecent(false);
    }
  }

  useEffect(() => {
    setWebsiteUrl(window.location.origin);
    void loadRecentScans();
  }, []);

  async function runSmokeTest(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();

    const trimmedUrl = websiteUrl.trim();
    if (!trimmedUrl) {
      setError("Enter a website URL.");
      setResult(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/smoke-test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ websiteUrl: trimmedUrl })
      });

      const data = (await response.json()) as ScanResult | { error: string };

      if (!response.ok || "error" in data) {
        throw new Error("error" in data ? data.error : "Smoke test failed.");
      }

      setResult(data);
      void loadRecentScans();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to run smoke test.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.18),_transparent_26%),linear-gradient(180deg,_#f8fafc_0%,_#e2e8f0_100%)] px-4 py-8 lg:px-6 lg:py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <PageHeader
          eyebrow="Milestone A"
          title="AI-assisted website QA scanner"
          description="Paste a website URL and run a real local scan. The platform now loads the page in Playwright, captures a screenshot, runs axe-core accessibility checks, generates rule-based findings, and saves the result as a project-backed scan artifact."
          breadcrumb={["Public Tools", "Smoke Test"]}
          action={<StatusBadge label="Free local tooling" tone="info" />}
        />

        <div className="grid gap-4 xl:grid-cols-[0.86fr_1.14fr]">
          <Card className="space-y-4 border-white/80 bg-white/85 shadow-panel backdrop-blur-sm">
            <form className="space-y-4" onSubmit={runSmokeTest}>
              <div className="space-y-2">
                <label htmlFor="websiteUrl" className="text-sm font-medium text-slate-900">
                  Website URL
                </label>
                <input
                  id="websiteUrl"
                  value={websiteUrl}
                  onChange={(event) => setWebsiteUrl(event.target.value)}
                  placeholder="example.com, https://example.com, or localhost:3001"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:bg-white"
                />
              </div>

              <button
                type="submit"
                aria-disabled={loading}
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4" />}
                {loading ? "Running automated QA scan" : "Run smoke test"}
              </button>
            </form>

            <div className="rounded-3xl bg-slate-50 p-4 text-sm text-muted-foreground">
              Current slice: single-page automated QA. It saves a project, page, scan run, page scan, findings, evidence artifacts, and an activity log entry using free local tooling only.
            </div>

            {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

            <div className="space-y-3 rounded-3xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-slate-900">Recent saved scans</p>
                {loadingRecent ? <span className="text-xs text-muted-foreground">Loading...</span> : null}
              </div>
              {recentScans.length > 0 ? (
                recentScans.map((scan) => (
                  <button
                    key={scan.scanRun.id}
                    type="button"
                    onClick={() => setResult(scan)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left transition hover:border-slate-300 hover:bg-white"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{scan.project.name}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{scan.pageScan.finalUrl}</p>
                      </div>
                      <StatusBadge label={scan.scanRun.summary.releaseReadiness.replace("_", " ")} tone={readinessTone(scan.scanRun.summary.releaseReadiness)} />
                    </div>
                  </button>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-muted-foreground">No saved scans yet.</div>
              )}
            </div>
          </Card>

          <Card className="space-y-5 border-white/80 bg-white/90 shadow-panel backdrop-blur-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Latest result</p>
                <h2 className="mt-2 text-xl font-semibold text-slate-900">Scan result summary</h2>
              </div>
              {result ? (
                <StatusBadge label={result.scanRun.summary.releaseReadiness.replace("_", " ")} tone={readinessTone(result.scanRun.summary.releaseReadiness)} />
              ) : null}
            </div>

            {result ? (
              <ResultPanel result={result} />
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-muted-foreground">
                Run a scan to see the saved project, evidence, findings, and score summary here.
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

