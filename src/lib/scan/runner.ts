import path from "node:path";
import { promises as fs } from "node:fs";
import { createRequire } from "node:module";
import os from "node:os";

import { chromium } from "playwright";

import type { ArtifactSource, FindingRecord, FindingCategory, Severity } from "@/lib/scan/types";
import { clampScore, createId, ensureDirPath, nowIso, publicFileUrl, safeFileStem } from "@/lib/scan/utils";

const require = createRequire(import.meta.url);
const axeScriptPath = require.resolve("axe-core/axe.min.js");
const isVercelRuntime = Boolean(process.env.VERCEL);

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

type PageSummary = {
  linkCount: number;
  formCount: number;
  buttonCount: number;
  inputCount: number;
  imageCount: number;
  h1Count: number;
  imagesMissingAlt: number;
  metaDescription: string | null;
  titleText: string | null;
  navigationTiming: {
    domContentLoaded: number;
    loadComplete: number;
    transferSize: number;
    encodedBodySize: number;
    decodedBodySize: number;
  } | null;
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

function toDataUrl(contentType: string, content: string) {
  return `data:${contentType};base64,${Buffer.from(content, "utf8").toString("base64")}`;
}

function getHtmlTitle(html: string) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match?.[1]?.replace(/\s+/g, " ").trim() ?? null;
}

function summarizeHtml(html: string): PageSummary {
  const titleText = getHtmlTitle(html);
  const metaDescriptionMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
  const metaDescription = metaDescriptionMatch?.[1]?.trim() ?? null;
  const linkCount = (html.match(/<a\b/gi) ?? []).length;
  const formCount = (html.match(/<form\b/gi) ?? []).length;
  const buttonCount = (html.match(/<button\b/gi) ?? []).length;
  const inputCount = (html.match(/<(input|textarea|select)\b/gi) ?? []).length;
  const imageMatches = html.match(/<img\b[^>]*>/gi) ?? [];
  const imageCount = imageMatches.length;
  const imagesMissingAlt = imageMatches.filter((tag) => !/\balt\s*=\s*["'][^"']*["']/i.test(tag)).length;
  const h1Count = (html.match(/<h1\b/gi) ?? []).length;

  return {
    linkCount,
    formCount,
    buttonCount,
    inputCount,
    imageCount,
    h1Count,
    imagesMissingAlt,
    metaDescription,
    titleText,
    navigationTiming: null
  };
}

function buildFindings(params: {
  responseStatus: number | null;
  pageTitle: string | null;
  pageSummary: PageSummary;
  consoleErrors: string[];
  requestFailures: { url: string; errorText: string }[];
  violations: AxeViolation[];
  performanceScore: number;
  bestPractices: number;
  finalUrl: string;
  responseTimeMs: number | null;
  browserFallbackReason?: string;
}) {
  const findings: RawFinding[] = [];
  const seriousViolationCount = params.violations.filter((item) => item.impact === "critical" || item.impact === "serious").length;

  if (!params.responseStatus || (params.responseStatus >= 400 && params.responseStatus < 600)) {
    pushFinding(findings, {
      category: "automation",
      title: "Page load returned a non-success HTTP status",
      description: `The scanned URL returned status ${params.responseStatus ?? "unknown"}. This suggests the page is not healthy for release-readiness checks.`,
      severity: params.responseStatus && params.responseStatus >= 500 ? "critical" : "high",
      confidenceScore: 0.98,
      recommendedAction: "Confirm the deployment or routing issue and rerun the automated scan once the page loads successfully.",
      metadata: { statusCode: params.responseStatus ?? null }
    });
  }

  if (!params.pageTitle) {
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

  if (!params.pageSummary.metaDescription) {
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

  if (params.consoleErrors.length > 0) {
    pushFinding(findings, {
      category: "automation",
      title: "Console errors were detected during page load",
      description: `The browser reported ${params.consoleErrors.length} console/page errors while loading the page.`,
      severity: params.consoleErrors.length >= 3 ? "high" : "medium",
      confidenceScore: 0.88,
      recommendedAction: "Review the browser console stack traces and resolve JavaScript runtime issues before sign-off.",
      metadata: { sample: params.consoleErrors.slice(0, 3) }
    });
  }

  if (params.requestFailures.length > 0) {
    pushFinding(findings, {
      category: "automation",
      title: "Network request failures were detected",
      description: `The page generated ${params.requestFailures.length} failed network requests during the scan.`,
      severity: params.requestFailures.length >= 3 ? "high" : "medium",
      confidenceScore: 0.9,
      recommendedAction: "Inspect the failed network requests and confirm whether they are blocking user-critical content.",
      metadata: { sample: params.requestFailures.slice(0, 3) }
    });
  }

  for (const violation of params.violations.slice(0, 8)) {
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

  if (params.performanceScore < 60) {
    pushFinding(findings, {
      category: "performance",
      title: "Page load speed is below the target threshold",
      description: `The simplified performance score is ${params.performanceScore}/100 based on available timing signals captured in this scan.`,
      severity: params.performanceScore < 40 ? "high" : "medium",
      confidenceScore: 0.82,
      recommendedAction: "Review payload size, render-blocking resources, and third-party dependencies.",
      metadata: {
        responseTimeMs: params.responseTimeMs,
        navigationTiming: params.pageSummary.navigationTiming
      }
    });
  }

  if (params.bestPractices < 65) {
    pushFinding(findings, {
      category: "best_practice",
      title: "Best-practice checks need attention",
      description: `The page scored ${params.bestPractices}/100 on local best-practice heuristics including HTTPS, runtime stability, request health, and image alt coverage.`,
      severity: params.bestPractices < 45 ? "high" : "medium",
      confidenceScore: 0.8,
      recommendedAction: "Review transport security, client-side runtime health, and content hygiene before release.",
      metadata: {
        consoleErrorCount: params.consoleErrors.length,
        requestFailureCount: params.requestFailures.length,
        imagesMissingAlt: params.pageSummary.imagesMissingAlt
      }
    });
  }

  if (params.browserFallbackReason) {
    pushFinding(findings, {
      category: "automation",
      title: "Browser automation fallback was used",
      description: `Playwright could not launch in this hosted runtime, so the scan used an HTTP and HTML analysis fallback instead. Reason: ${params.browserFallbackReason}`,
      severity: "low",
      confidenceScore: 0.99,
      recommendedAction: "Use a host with Playwright browser support for full visual and accessibility automation, or keep this fallback for lightweight checks.",
      metadata: { fallbackReason: params.browserFallbackReason }
    });
  }

  return {
    findings,
    accessibilityIssueCount: params.violations.length,
    accessibilityScoreValue: accessibilityScore(params.violations.length, seriousViolationCount)
  };
}

async function saveArtifacts(scanId: string, finalUrl: string, screenshot: Buffer | null, axeResults: unknown, rawScan: unknown, fallbackReason?: string) {
  if (isVercelRuntime || !screenshot) {
    const rawScanJson = JSON.stringify(rawScan, null, 2);
    const axeJson = JSON.stringify(axeResults, null, 2);
    const fallbackSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720"><rect width="100%" height="100%" fill="#0f172a"/><text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" fill="#f8fafc" font-family="Arial, sans-serif" font-size="28">Browser screenshot unavailable in hosted fallback</text><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="#cbd5e1" font-family="Arial, sans-serif" font-size="18">${fallbackReason ?? "Inline evidence returned instead of persisted files."}</text><text x="50%" y="63%" dominant-baseline="middle" text-anchor="middle" fill="#93c5fd" font-family="Arial, sans-serif" font-size="16">${finalUrl}</text></svg>`;

    return {
      screenshotPath: toDataUrl("image/svg+xml", fallbackSvg),
      screenshotFileSize: Buffer.byteLength(fallbackSvg, "utf8"),
      rawScanPath: `data:application/json;base64,${Buffer.from(rawScanJson, "utf8").toString("base64")}`,
      rawScanFileSize: Buffer.byteLength(rawScanJson, "utf8"),
      axePath: `data:application/json;base64,${Buffer.from(axeJson, "utf8").toString("base64")}`,
      axeFileSize: Buffer.byteLength(axeJson, "utf8")
    };
  }

  const outputDir = path.join(ensureDirPath("public", "generated", "scans"), scanId);
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

async function runHttpFallbackScan(targetUrl: string, launchError: string): Promise<WebsiteScanResult> {
  const startedAt = nowIso();
  const started = Date.now();
  const response = await fetch(targetUrl, {
    method: "GET",
    redirect: "follow",
    headers: {
      "User-Agent": "QA-Automation-Fallback-Scanner"
    },
    cache: "no-store"
  });
  const html = await response.text();
  const responseTimeMs = Date.now() - started;
  const finalUrl = response.url || targetUrl;
  const pageSummary = summarizeHtml(html);
  const pageTitle = pageSummary.titleText;
  const violations: AxeViolation[] = [];
  const consoleErrors: string[] = [];
  const requestFailures: { url: string; errorText: string }[] = [];

  const performanceScore = scoreFromThreshold(responseTimeMs, 2500, 4500);
  const seo = seoScore(Boolean(pageSummary.titleText), Boolean(pageSummary.metaDescription), pageSummary.h1Count, 0);
  const bestPractices = bestPracticesScore(finalUrl.startsWith("https://"), 0, 0, pageSummary.imagesMissingAlt);
  const { findings, accessibilityScoreValue } = buildFindings({
    responseStatus: response.status,
    pageTitle,
    pageSummary,
    consoleErrors,
    requestFailures,
    violations,
    performanceScore,
    bestPractices,
    finalUrl,
    responseTimeMs,
    browserFallbackReason: launchError
  });

  const rawMetrics = {
    pageSummary,
    responseHeaders: Object.fromEntries(response.headers.entries()),
    browserFallbackReason: launchError,
    scores: {
      performance: performanceScore,
      accessibility: accessibilityScoreValue,
      seo,
      bestPractices
    }
  };

  const artifacts = await saveArtifacts(createId(), finalUrl, null, { violations }, rawMetrics, launchError);

  return {
    startedAt,
    completedAt: nowIso(),
    normalizedUrl: targetUrl,
    finalUrl,
    pageTitle,
    statusCode: response.status,
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
      accessibility: accessibilityScoreValue,
      seo,
      bestPractices
    },
    findings,
    artifacts,
    rawMetrics
  };
}

export async function runWebsiteScan(targetUrl: string): Promise<WebsiteScanResult> {
  try {
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
        } satisfies PageSummary;
      });

      await page.addScriptTag({ path: axeScriptPath });
      const axeResults = await page.evaluate(async () => {
        const axe = (window as typeof window & { axe: { run: () => Promise<unknown> } }).axe;
        return axe.run();
      });

      const violations = (axeResults as { violations?: AxeViolation[] }).violations ?? [];
      const performanceScore = pageSummary.navigationTiming?.loadComplete ? scoreFromThreshold(pageSummary.navigationTiming.loadComplete, 2500, 4500) : 55;
      const seo = seoScore(Boolean(pageSummary.titleText), Boolean(pageSummary.metaDescription), pageSummary.h1Count, requestFailures.length);
      const bestPractices = bestPracticesScore(finalUrl.startsWith("https://"), consoleErrors.length, requestFailures.length, pageSummary.imagesMissingAlt);
      const { findings, accessibilityScoreValue } = buildFindings({
        responseStatus: response?.status() ?? null,
        pageTitle,
        pageSummary,
        consoleErrors,
        requestFailures,
        violations,
        performanceScore,
        bestPractices,
        finalUrl,
        responseTimeMs
      });

      const rawMetrics = {
        pageSummary,
        scores: {
          performance: performanceScore,
          accessibility: accessibilityScoreValue,
          seo,
          bestPractices
        },
        consoleErrors,
        requestFailures,
        accessibilityViolationCount: violations.length,
        accessibilityViolations: violations
      };

      const screenshot = await page.screenshot({ fullPage: true, type: "png" });
      const artifacts = await saveArtifacts(createId(), finalUrl, screenshot, axeResults, {
        finalUrl,
        pageTitle,
        statusCode: response?.status() ?? null,
        responseTimeMs,
        pageSummary,
        scores: {
          performance: performanceScore,
          accessibility: accessibilityScoreValue,
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
          accessibility: accessibilityScoreValue,
          seo,
          bestPractices
        },
        findings,
        artifacts,
        rawMetrics
      };
    } finally {
      await context.close();
      await browser.close();
    }
  } catch (error) {
    return runHttpFallbackScan(targetUrl, error instanceof Error ? error.message : "Playwright launch failed.");
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


