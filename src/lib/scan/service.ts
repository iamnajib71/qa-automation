import type { EvidenceRecord, PageScanRecord, ScanResponse, ScanRunRecord } from "@/lib/scan/types";
import { ensureProject, listRecentScans, saveScan, upsertPage } from "@/lib/scan/local-store";
import { buildStoredFindings, runWebsiteScan } from "@/lib/scan/runner";
import { createId, nowIso, normalizeTargetUrl } from "@/lib/scan/utils";

export async function executeSinglePageScan(rawUrl: string): Promise<ScanResponse> {
  const normalizedUrl = normalizeTargetUrl(rawUrl);
  const { project, projectUrl } = await ensureProject(normalizedUrl);

  const scan = await runWebsiteScan(normalizedUrl);
  const page = await upsertPage(project.id, projectUrl.id, scan.finalUrl, scan.pageTitle, scan.statusCode);

  const scanRunId = createId();
  const pageScanId = createId();
  const timestamp = nowIso();

  const findings = buildStoredFindings({
    findings: scan.findings,
    projectId: project.id,
    pageId: page.id,
    scanRunId,
    pageScanId
  });

  const evidence: EvidenceRecord[] = [
    {
      id: createId(),
      projectId: project.id,
      pageId: page.id,
      scanRunId,
      pageScanId,
      kind: "screenshot",
      label: "Full-page screenshot",
      filePath: scan.artifacts.screenshotPath,
      contentType: "image/png",
      fileSize: scan.artifacts.screenshotFileSize,
      source: "automated-rule",
      createdAt: timestamp
    },
    {
      id: createId(),
      projectId: project.id,
      pageId: page.id,
      scanRunId,
      pageScanId,
      kind: "raw_scan",
      label: "Raw scan metrics",
      filePath: scan.artifacts.rawScanPath,
      contentType: "application/json",
      fileSize: scan.artifacts.rawScanFileSize,
      source: "automated-rule",
      createdAt: timestamp
    },
    {
      id: createId(),
      projectId: project.id,
      pageId: page.id,
      scanRunId,
      pageScanId,
      kind: "axe_results",
      label: "axe-core accessibility results",
      filePath: scan.artifacts.axePath,
      contentType: "application/json",
      fileSize: scan.artifacts.axeFileSize,
      source: "automated-rule",
      createdAt: timestamp
    }
  ];

  const releaseReadiness: ScanRunRecord["summary"]["releaseReadiness"] = findings.some((item) => item.severity === "critical")
    ? "at_risk"
    : findings.some((item) => item.severity === "high")
      ? "watch"
      : "good";

  const scanRun: ScanRunRecord = {
    id: scanRunId,
    projectId: project.id,
    projectUrlId: projectUrl.id,
    mode: "single_page" as const,
    status: "completed" as const,
    source: "automated-rule" as const,
    startedAt: scan.startedAt,
    completedAt: scan.completedAt,
    baseUrl: normalizedUrl,
    summary: {
      pageCount: 1,
      findingCount: findings.length,
      accessibilityIssueCount: scan.accessibilityViolations.length,
      performanceScore: scan.scores.performance,
      accessibilityScore: scan.scores.accessibility,
      seoScore: scan.scores.seo,
      bestPracticesScore: scan.scores.bestPractices,
      releaseReadiness
    },
    errorMessage: null,
    createdAt: timestamp,
    updatedAt: timestamp
  };

  const pageScan: PageScanRecord = {
    id: pageScanId,
    scanRunId,
    pageId: page.id,
    finalUrl: scan.finalUrl,
    title: scan.pageTitle,
    httpStatus: scan.statusCode,
    responseTimeMs: scan.responseTimeMs,
    linkCount: scan.linkCount,
    formCount: scan.formCount,
    buttonCount: scan.buttonCount,
    inputCount: scan.inputCount,
    imageCount: scan.imageCount,
    consoleErrorCount: scan.consoleErrors.length,
    requestFailureCount: scan.requestFailures.length,
    source: "automated-rule" as const,
    confidenceScore: 0.95,
    performanceScore: scan.scores.performance,
    accessibilityScore: scan.scores.accessibility,
    seoScore: scan.scores.seo,
    bestPracticesScore: scan.scores.bestPractices,
    metrics: scan.rawMetrics,
    createdAt: timestamp
  };

  await saveScan({
    project,
    projectUrl,
    page,
    scanRun,
    pageScan,
    findings,
    evidence,
    activityLog: {
      id: createId(),
      projectId: project.id,
      entityType: "scan_run",
      entityId: scanRunId,
      action: "created",
      summary: `Automated single-page QA scan completed for ${scan.finalUrl}`,
      metadata: {
        findingCount: findings.length,
        accessibilityIssueCount: scan.accessibilityViolations.length,
        responseTimeMs: scan.responseTimeMs
      },
      createdAt: timestamp
    }
  });

  return {
    project,
    projectUrl,
    page,
    scanRun,
    pageScan,
    findings,
    evidence
  };
}

export async function getRecentSinglePageScans(limit = 5) {
  return listRecentScans(limit);
}


