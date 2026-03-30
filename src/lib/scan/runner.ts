import path from "node:path";
import { promises as fs } from "node:fs";
import { createRequire } from "node:module";

import { chromium } from "playwright";

import type { ArtifactSource, FindingRecord, FindingCategory, Severity } from "@/lib/scan/types";
import { clampScore, createId, ensureDirPath, nowIso, publicFileUrl, safeFileStem } from "@/lib/scan/utils";

const require = createRequire(import.meta.url);
const axeScriptPath = require.resolve("axe-core/axe.min.js");

type RawFinding = {
  category: FindingCategory;
  title: string;
  description: string;
  severity: Severity;
  confidenceScore: number;
  recommendedAction: string;
  metadata: Record<string, unknown>;
};

type AxeViolation = {
  id: string;
  impact?: string;
  description: string;
  help: string;
  helpUrl: string;
  nodes: { target: string[]; failureSummary?: string }[];
};

type ScanArtifacts = {
  screenshotPath: string;
  screenshotFileSize: number;
  rawScanPath: string;
  rawScanFileSize: number;
  axePath: string;
  axeFileSize: number;
};

export type WebsiteScanResult = {
  startedAt: string;
  completedAt: string;
  normalizedUrl: string;
  finalUrl: string;
  pageTitle: string | null;
  statusCode: number | null;
  responseTimeMs: number | null;
  linkCount: number;
  formCount: number;
  buttonCount: number;
  inputCount: number;
  imageCount: number;
  consoleErrors: string[];
  requestFailures: { url: string; errorText: string }[];
  accessibilityViolations: AxeViolation[];
  scores: {
    performance: number;
    accessibility: number;
    seo: number;
    bestPractices: number;
  };
  findings: RawFinding[];
  artifacts: ScanArtifacts;
  rawMetrics: Record<string, unknown>;
};

function scoreFromThreshold(value: number, good: number, okay: number) {
  if (value <= good) {
    return 100;
  }
  if (value <= okay) {
    return 70;
  }
  return 35;
}

function accessibilityScore(violationCount: number, seriousCount: number) {
  return clampScore(100 - violationCount * 8 - seriousCount * 6);
}

function seoScore(hasTitle: boolean, hasMetaDescription: boolean, h1Count: number, brokenRequests: number) {
  return clampScore((hasTitle ? 35 : 0) + (hasMetaDescription ? 30 : 0) + (h1Count > 0 ? 20 : 0) + (brokenRequests === 0 ? 15 : 0));
}

function bestPracticesScore(isHttps: boolean, consoleErrorCount: number, requestFailureCount: number, imagesMissingAlt: number) {
  return clampScore((isHttps ? 30 : 10) + Math.max(0, 30 - consoleErrorCount * 10) + Math.max(0, 25 - requestFailureCount * 8) + Math.max(0, 15 - imagesMissingAlt * 5));
}

function mapImpactToSeverity(impact?: string): Severity {
  switch (impact) {
    case "critical":
      return "critical";
    case "serious":
      return "high";
    case "moderate":
      return "medium";
    default:
      return "low";
  }
}

function pushFinding(target: RawFinding[], finding: RawFinding) {
  target.push(finding);
}

async function saveArtifacts(scanId: string, finalUrl: string, screenshot: Buffer, axeResults: unknown, rawScan: unknown) {
  const outputDir = ensureDirPath("public", "generated", "scans", scanId);
  await fs.mkdir(outputDir, { recursive: true });

  const stem = safeFileStem(new URL(finalUrl).hostname);
  const screenshotFileName = `${stem}-page.png`;
  const rawScanFileName = `${stem}-scan.json`;
  const axeFileName = `${stem}-axe.json`;

  const screenshotPath = path.join(outputDir, screenshotFileName);
  const rawScanPath = path.join(outputDir, rawScanFileName);
  const axePath = path.join(outputDir, axeFileName);

  await fs.writeFile(screenshotPath, screenshot);
  await fs.writeFile(rawScanPath, JSON.stringify(rawScan, null, 2), "utf8");
  await fs.writeFile(axePath, JSON.stringify(axeResults, null, 2), "utf8");

  const screenshotStat = await fs.stat(screenshotPath);
  const rawScanStat = await fs.stat(rawScanPath);
  const axeStat = await fs.stat(axePath);

  return {
    screenshotPath: publicFileUrl("generated", "scans", scanId, screenshotFileName),
    screenshotFileSize: screenshotStat.size,
    rawScanPath: publicFileUrl("generated", "scans", scanId, rawScanFileName),
    rawScanFileSize: rawScanStat.size,
    axePath: publicFileUrl("generated", "scans", scanId, axeFileName),
    axeFileSize: axeStat.size
  };
}

export async function runWebsiteScan(targetUrl: string): Promise<WebsiteScanResult> {
  const startedAt = nowIso();
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const consoleErrors: string[] = [];
  const requestFailures: { url: string; errorText: string }[] = [];

  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });

  page.on("pageerror", (error) => {
    consoleErrors.push(error.message);
  });

  page.on("requestfailed", (request) => {
    requestFailures.push({
      url: request.url(),
      errorText: request.failure()?.errorText ?? "Request failed"
    });
  });

  try {
    const start = Date.now();
    const response = await page.goto(targetUrl, { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.waitForLoadState("networkidle", { timeout: 7000 }).catch(() => undefined);
    const responseTimeMs = Date.now() - start;
    const finalUrl = page.url();
    const pageTitle = (await page.title()) || null;

    const pageSummary = await page.evaluate(() => {
      const navigationEntry = window.performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
      const metaDescription = document.querySelector('meta[name="description"]')?.getAttribute("content") ?? null;
      const titleText = document.title || null;
      const images = Array.from(document.images);

      return {
        linkCount: document.querySelectorAll("a[href]").length,
        formCount: document.querySelectorAll("form").length,
        buttonCount: document.querySelectorAll("button").length,
        inputCount: document.querySelectorAll("input, textarea, select").length,
        imageCount: images.length,
        h1Count: document.querySelectorAll("h1").length,
        imagesMissingAlt: images.filter((image) => !(image.getAttribute("alt") ?? "").trim()).length,
        metaDescription,
        titleText,
        navigationTiming: navigationEntry
          ? {
              domContentLoaded: Math.round(navigationEntry.domContentLoadedEventEnd),
              loadComplete: Math.round(navigationEntry.loadEventEnd || navigationEntry.domComplete),
              transferSize: navigationEntry.transferSize,
              encodedBodySize: navigationEntry.encodedBodySize,
              decodedBodySize: navigationEntry.decodedBodySize
            }
          : null
      };
    });

    await page.addScriptTag({ path: axeScriptPath });
    const axeResults = await page.evaluate(async () => {
      const axe = (window as typeof window & { axe: { run: () => Promise<unknown> } }).axe;
      return axe.run();
    });

    const violations = (axeResults as { violations?: AxeViolation[] }).violations ?? [];
    const seriousViolationCount = violations.filter((item) => item.impact === "critical" || item.impact === "serious").length;

    const performanceScore = pageSummary.navigationTiming?.loadComplete
      ? scoreFromThreshold(pageSummary.navigationTiming.loadComplete, 2500, 4500)
      : 55;
    const accessibility = accessibilityScore(violations.length, seriousViolationCount);
    const seo = seoScore(Boolean(pageSummary.titleText), Boolean(pageSummary.metaDescription), pageSummary.h1Count, requestFailures.length);
    const bestPractices = bestPracticesScore(finalUrl.startsWith("https://"), consoleErrors.length, requestFailures.length, pageSummary.imagesMissingAlt);

    const findings: RawFinding[] = [];

    if (!response || (response.status() >= 400 && response.status() < 600)) {
      pushFinding(findings, {
        category: "automation",
        title: "Page load returned a non-success HTTP status",
        description: `The scanned URL returned status ${response?.status() ?? "unknown"}. This suggests the page is not healthy for release-readiness checks.`,
        severity: response?.status() && response.status() >= 500 ? "critical" : "high",
        confidenceScore: 0.98,
        recommendedAction: "Confirm the deployment or routing issue and rerun the automated scan once the page loads successfully.",
        metadata: { statusCode: response?.status() ?? null }
      });
    }

    if (!pageTitle) {
      pushFinding(findings, {
        category: "seo",
        title: "Page title is missing",
        description: "The page does not expose a meaningful HTML title, which weakens usability, browser context, and search basics.",
        severity: "medium",
        confidenceScore: 0.9,
        recommendedAction: "Add a descriptive, unique title tag for this page.",
        metadata: {}
      });
    }

    if (!pageSummary.metaDescription) {
      pushFinding(findings, {
        category: "seo",
        title: "Meta description is missing",
        description: "No meta description was detected on the page. This is a common content and discoverability gap.",
        severity: "low",
        confidenceScore: 0.86,
        recommendedAction: "Add a concise meta description that reflects the page purpose.",
        metadata: {}
      });
    }

    if (consoleErrors.length > 0) {
      pushFinding(findings, {
        category: "automation",
        title: "Console errors were detected during page load",
        description: `The browser reported ${consoleErrors.length} console/page errors while loading the page.`,
        severity: consoleErrors.length >= 3 ? "high" : "medium",
        confidenceScore: 0.88,
        recommendedAction: "Review the browser console stack traces and resolve JavaScript runtime issues before sign-off.",
        metadata: { sample: consoleErrors.slice(0, 3) }
      });
    }

    if (requestFailures.length > 0) {
      pushFinding(findings, {
        category: "automation",
        title: "Network request failures were detected",
        description: `The page generated ${requestFailures.length} failed network requests during the scan.`,
        severity: requestFailures.length >= 3 ? "high" : "medium",
        confidenceScore: 0.9,
        recommendedAction: "Inspect the failed network requests and confirm whether they are blocking user-critical content.",
        metadata: { sample: requestFailures.slice(0, 3) }
      });
    }

    for (const violation of violations.slice(0, 8)) {
      pushFinding(findings, {
        category: "accessibility",
        title: `Accessibility issue: ${violation.help}`,
        description: `${violation.description} ${violation.nodes[0]?.failureSummary ?? ""}`.trim(),
        severity: mapImpactToSeverity(violation.impact),
        confidenceScore: 0.94,
        recommendedAction: `Review the impacted elements and the guidance at ${violation.helpUrl}.`,
        metadata: {
          ruleId: violation.id,
          impact: violation.impact ?? null,
          nodeTargets: violation.nodes.flatMap((node) => node.target).slice(0, 6)
        }
      });
    }

    if (performanceScore < 60) {
      pushFinding(findings, {
        category: "performance",
        title: "Page load speed is below the target threshold",
        description: `The simplified performance score is ${performanceScore}/100 based on navigation timing captured in the browser session.`,
        severity: performanceScore < 40 ? "high" : "medium",
        confidenceScore: 0.82,
        recommendedAction: "Review payload size, render-blocking resources, and third-party dependencies.",
        metadata: pageSummary.navigationTiming ?? {}
      });
    }

    if (bestPractices < 65) {
      pushFinding(findings, {
        category: "best_practice",
        title: "Best-practice checks need attention",
        description: `The page scored ${bestPractices}/100 on local best-practice heuristics including HTTPS, console stability, request health, and image alt coverage.`,
        severity: bestPractices < 45 ? "high" : "medium",
        confidenceScore: 0.8,
        recommendedAction: "Review transport security, client-side runtime health, and content hygiene before release.",
        metadata: {
          consoleErrorCount: consoleErrors.length,
          requestFailureCount: requestFailures.length,
          imagesMissingAlt: pageSummary.imagesMissingAlt
        }
      });
    }

    const screenshot = await page.screenshot({ fullPage: true, type: "png" });
    const artifacts = await saveArtifacts(createId(), finalUrl, screenshot, axeResults, {
      finalUrl,
      pageTitle,
      statusCode: response?.status() ?? null,
      responseTimeMs,
      pageSummary,
      scores: {
        performance: performanceScore,
        accessibility,
        seo,
        bestPractices
      },
      consoleErrors,
      requestFailures,
      violations
    });

    return {
      startedAt,
      completedAt: nowIso(),
      normalizedUrl: targetUrl,
      finalUrl,
      pageTitle,
      statusCode: response?.status() ?? null,
      responseTimeMs,
      linkCount: pageSummary.linkCount,
      formCount: pageSummary.formCount,
      buttonCount: pageSummary.buttonCount,
      inputCount: pageSummary.inputCount,
      imageCount: pageSummary.imageCount,
      consoleErrors,
      requestFailures,
      accessibilityViolations: violations,
      scores: {
        performance: performanceScore,
        accessibility,
        seo,
        bestPractices
      },
      findings,
      artifacts,
      rawMetrics: {
        pageSummary,
        scores: {
          performance: performanceScore,
          accessibility,
          seo,
          bestPractices
        },
        consoleErrors,
        requestFailures,
        accessibilityViolationCount: violations.length,
        accessibilityViolations: violations
      }
    };
  } finally {
    await context.close();
    await browser.close();
  }
}

export function buildStoredFindings(params: {
  findings: RawFinding[];
  projectId: string;
  pageId: string;
  scanRunId: string;
  pageScanId: string;
  source?: ArtifactSource;
}): FindingRecord[] {
  return params.findings.map((finding) => ({
    id: createId(),
    projectId: params.projectId,
    pageId: params.pageId,
    scanRunId: params.scanRunId,
    pageScanId: params.pageScanId,
    category: finding.category,
    title: finding.title,
    description: finding.description,
    severity: finding.severity,
    confidenceScore: finding.confidenceScore,
    source: params.source ?? "automated-rule",
    recommendedAction: finding.recommendedAction,
    status: finding.severity === "critical" || finding.severity === "high" ? "draft_defect" : "automated_finding",
    metadata: finding.metadata,
    createdAt: nowIso(),
    updatedAt: nowIso()
  }));
}
