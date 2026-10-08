import { clampScore } from "./utils";

export function scoreFromThreshold(value: number, good: number, okay: number) {
  if (value <= good) {
    return 100;
  }
  if (value <= okay) {
    return 70;
  }
  return 35;
}

export function accessibilityScore(violationCount: number, seriousCount: number) {
  return clampScore(100 - violationCount * 8 - seriousCount * 6);
}

export function seoScore(hasTitle: boolean, hasMetaDescription: boolean, h1Count: number, brokenRequests: number) {
  return clampScore((hasTitle ? 35 : 0) + (hasMetaDescription ? 30 : 0) + (h1Count > 0 ? 20 : 0) + (brokenRequests === 0 ? 15 : 0));
}

export function bestPracticesScore(isHttps: boolean, consoleErrorCount: number, requestFailureCount: number, imagesMissingAlt: number) {
  return clampScore((isHttps ? 30 : 10) + Math.max(0, 30 - consoleErrorCount * 10) + Math.max(0, 25 - requestFailureCount * 8) + Math.max(0, 15 - imagesMissingAlt * 5));
}

