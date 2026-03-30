export type ArtifactSource = "manual" | "automated-rule" | "automated-ai" | "imported";
export type ScanMode = "single_page" | "multi_page" | "site";
export type Severity = "low" | "medium" | "high" | "critical";
export type FindingCategory = "accessibility" | "performance" | "seo" | "best_practice" | "content" | "automation";

export type ProjectRecord = {
  id: string;
  projectKey: string;
  name: string;
  description: string;
  baseUrl: string;
  environment: string;
  status: "active" | "on_hold" | "completed" | "archived";
  createdAt: string;
  updatedAt: string;
};

export type ProjectUrlRecord = {
  id: string;
  projectId: string;
  label: string;
  baseUrl: string;
  isPrimary: boolean;
  scanPreferences: {
    maxPages: number;
    maxDepth: number;
    sameOriginOnly: boolean;
    timeoutMs: number;
  };
  createdAt: string;
  updatedAt: string;
};

export type PageRecord = {
  id: string;
  projectId: string;
  projectUrlId: string;
  url: string;
  normalizedUrl: string;
  title: string | null;
  lastHttpStatus: number | null;
  lastScannedAt: string;
  createdAt: string;
  updatedAt: string;
};

export type ScanRunRecord = {
  id: string;
  projectId: string;
  projectUrlId: string;
  mode: ScanMode;
  status: "queued" | "running" | "completed" | "failed";
  source: ArtifactSource;
  startedAt: string;
  completedAt: string | null;
  baseUrl: string;
  summary: {
    pageCount: number;
    findingCount: number;
    accessibilityIssueCount: number;
    performanceScore: number | null;
    accessibilityScore: number | null;
    seoScore: number | null;
    bestPracticesScore: number | null;
    releaseReadiness: "good" | "watch" | "at_risk";
  };
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PageScanRecord = {
  id: string;
  scanRunId: string;
  pageId: string;
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
  source: ArtifactSource;
  confidenceScore: number;
  performanceScore: number | null;
  accessibilityScore: number | null;
  seoScore: number | null;
  bestPracticesScore: number | null;
  metrics: Record<string, unknown>;
  createdAt: string;
};

export type FindingRecord = {
  id: string;
  projectId: string;
  pageId: string;
  scanRunId: string;
  pageScanId: string;
  category: FindingCategory;
  title: string;
  description: string;
  severity: Severity;
  confidenceScore: number;
  source: ArtifactSource;
  recommendedAction: string;
  status: "suggested_test_case" | "automated_finding" | "draft_defect" | "confirmed_defect";
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type EvidenceRecord = {
  id: string;
  projectId: string;
  pageId: string;
  scanRunId: string;
  pageScanId: string;
  kind: "screenshot" | "raw_scan" | "axe_results";
  label: string;
  filePath: string;
  contentType: string;
  fileSize: number;
  source: ArtifactSource;
  createdAt: string;
};

export type ActivityLogRecord = {
  id: string;
  projectId: string;
  entityType: string;
  entityId: string;
  action: string;
  summary: string;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type ScanPersistence = {
  project: ProjectRecord;
  projectUrl: ProjectUrlRecord;
  page: PageRecord;
  scanRun: ScanRunRecord;
  pageScan: PageScanRecord;
  findings: FindingRecord[];
  evidence: EvidenceRecord[];
  activityLog: ActivityLogRecord;
};

export type ScanResponse = {
  project: ProjectRecord;
  projectUrl: ProjectUrlRecord;
  page: PageRecord;
  scanRun: ScanRunRecord;
  pageScan: PageScanRecord;
  findings: FindingRecord[];
  evidence: EvidenceRecord[];
};

export type RecentScanSummary = ScanResponse;

