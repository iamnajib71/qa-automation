import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";

import type {
  ActivityLogRecord,
  EvidenceRecord,
  FindingRecord,
  PageRecord,
  PageScanRecord,
  ProjectRecord,
  ProjectUrlRecord,
  RecentScanSummary,
  ScanPersistence,
  ScanRunRecord
} from "@/lib/scan/types";
import { createId, nowIso, projectKeyFromUrl, projectNameFromUrl } from "@/lib/scan/utils";

type LocalDatabase = {
  projects: ProjectRecord[];
  projectUrls: ProjectUrlRecord[];
  pages: PageRecord[];
  scanRuns: ScanRunRecord[];
  pageScans: PageScanRecord[];
  findings: FindingRecord[];
  evidence: EvidenceRecord[];
  activityLogs: ActivityLogRecord[];
};

const isVercelRuntime = Boolean(process.env.VERCEL);
const dbPath = isVercelRuntime ? path.join(os.tmpdir(), "qa-platform.json") : path.join(process.cwd(), "data", "qa-platform.json");

const emptyDb: LocalDatabase = {
  projects: [],
  projectUrls: [],
  pages: [],
  scanRuns: [],
  pageScans: [],
  findings: [],
  evidence: [],
  activityLogs: []
};

async function ensureDb() {
  await fs.mkdir(path.dirname(dbPath), { recursive: true });
  try {
    await fs.access(dbPath);
  } catch {
    await fs.writeFile(dbPath, JSON.stringify(emptyDb, null, 2), "utf8");
  }
}

async function readDb() {
  await ensureDb();
  const content = await fs.readFile(dbPath, "utf8");
  return JSON.parse(content) as LocalDatabase;
}

async function writeDb(data: LocalDatabase) {
  await ensureDb();
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2), "utf8");
}

export async function ensureProject(baseUrl: string) {
  const db = await readDb();
  const now = nowIso();
  const existingProjectUrl = db.projectUrls.find((item) => item.baseUrl === baseUrl);

  if (existingProjectUrl) {
    const project = db.projects.find((item) => item.id === existingProjectUrl.projectId);
    if (project) {
      return { db, project, projectUrl: existingProjectUrl };
    }
  }

  const projectId = createId();
  const projectUrlId = createId();
  const projectName = `${projectNameFromUrl(baseUrl)} Website QA`;
  const projectKeyBase = projectKeyFromUrl(baseUrl);
  const projectKey = db.projects.some((item) => item.projectKey === projectKeyBase)
    ? `${projectKeyBase}${db.projects.length + 1}`.slice(0, 12)
    : projectKeyBase;

  const project: ProjectRecord = {
    id: projectId,
    projectKey,
    name: projectName,
    description: `Automated website QA workspace for ${new URL(baseUrl).hostname}.`,
    baseUrl,
    environment: "Production",
    status: "active",
    createdAt: now,
    updatedAt: now
  };

  const projectUrl: ProjectUrlRecord = {
    id: projectUrlId,
    projectId,
    label: "Primary",
    baseUrl,
    isPrimary: true,
    scanPreferences: {
      maxPages: 1,
      maxDepth: 0,
      sameOriginOnly: true,
      timeoutMs: 45000
    },
    createdAt: now,
    updatedAt: now
  };

  db.projects.unshift(project);
  db.projectUrls.unshift(projectUrl);
  await writeDb(db);

  return { db, project, projectUrl };
}

export async function saveScan(scan: ScanPersistence) {
  const db = await readDb();

  const projectIndex = db.projects.findIndex((item) => item.id === scan.project.id);
  if (projectIndex >= 0) {
    db.projects[projectIndex] = scan.project;
  } else {
    db.projects.unshift(scan.project);
  }

  const projectUrlIndex = db.projectUrls.findIndex((item) => item.id === scan.projectUrl.id);
  if (projectUrlIndex >= 0) {
    db.projectUrls[projectUrlIndex] = scan.projectUrl;
  } else {
    db.projectUrls.unshift(scan.projectUrl);
  }

  const pageIndex = db.pages.findIndex((item) => item.id === scan.page.id);
  if (pageIndex >= 0) {
    db.pages[pageIndex] = scan.page;
  } else {
    db.pages.unshift(scan.page);
  }

  db.scanRuns.unshift(scan.scanRun);
  db.pageScans.unshift(scan.pageScan);
  db.findings.unshift(...scan.findings);
  db.evidence.unshift(...scan.evidence);
  db.activityLogs.unshift(scan.activityLog);

  await writeDb(db);
}

export async function upsertPage(projectId: string, projectUrlId: string, normalizedUrl: string, title: string | null, statusCode: number | null) {
  const db = await readDb();
  const now = nowIso();
  const existingPage = db.pages.find((item) => item.projectId === projectId && item.normalizedUrl === normalizedUrl);

  if (existingPage) {
    existingPage.url = normalizedUrl;
    existingPage.normalizedUrl = normalizedUrl;
    existingPage.title = title;
    existingPage.lastHttpStatus = statusCode;
    existingPage.lastScannedAt = now;
    existingPage.updatedAt = now;
    await writeDb(db);
    return existingPage;
  }

  const page: PageRecord = {
    id: createId(),
    projectId,
    projectUrlId,
    url: normalizedUrl,
    normalizedUrl,
    title,
    lastHttpStatus: statusCode,
    lastScannedAt: now,
    createdAt: now,
    updatedAt: now
  };

  db.pages.unshift(page);
  await writeDb(db);
  return page;
}

export async function listRecentScans(limit = 5): Promise<RecentScanSummary[]> {
  const db = await readDb();

  return db.scanRuns.slice(0, limit).map((scanRun) => {
    const project = db.projects.find((item) => item.id === scanRun.projectId)!;
    const projectUrl = db.projectUrls.find((item) => item.id === scanRun.projectUrlId)!;
    const pageScan = db.pageScans.find((item) => item.scanRunId === scanRun.id)!;
    const page = db.pages.find((item) => item.id === pageScan.pageId)!;
    const findings = db.findings.filter((item) => item.scanRunId === scanRun.id);
    const evidence = db.evidence.filter((item) => item.scanRunId === scanRun.id);

    return {
      project,
      projectUrl,
      page,
      scanRun,
      pageScan,
      findings,
      evidence
    };
  });
}

type ProjectSummary = {
  project: ProjectRecord;
  latestScan: ScanRunRecord | null;
  latestPage: PageRecord | null;
  findingCount: number;
};

export async function listProjectsWithSummary(): Promise<ProjectSummary[]> {
  const db = await readDb();

  return db.projects.map((project) => {
    const projectScans = db.scanRuns.filter((item) => item.projectId === project.id);
    const latestScan = projectScans[0] ?? null;
    const latestPageScan = latestScan ? db.pageScans.find((item) => item.scanRunId === latestScan.id) ?? null : null;
    const latestPage = latestPageScan ? db.pages.find((item) => item.id === latestPageScan.pageId) ?? null : null;
    const findingCount = db.findings.filter((item) => item.projectId === project.id).length;

    return {
      project,
      latestScan,
      latestPage,
      findingCount
    };
  });
}

export async function getProjectScanHistory(projectId: string): Promise<RecentScanSummary[]> {
  const db = await readDb();
  return db.scanRuns
    .filter((item) => item.projectId === projectId)
    .map((scanRun) => {
      const project = db.projects.find((item) => item.id === scanRun.projectId)!;
      const projectUrl = db.projectUrls.find((item) => item.id === scanRun.projectUrlId)!;
      const pageScan = db.pageScans.find((item) => item.scanRunId === scanRun.id)!;
      const page = db.pages.find((item) => item.id === pageScan.pageId)!;
      const findings = db.findings.filter((item) => item.scanRunId === scanRun.id);
      const evidence = db.evidence.filter((item) => item.scanRunId === scanRun.id);

      return {
        project,
        projectUrl,
        page,
        scanRun,
        pageScan,
        findings,
        evidence
      };
    });
}
