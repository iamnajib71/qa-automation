import { z } from "zod";

export const checkInput = z.object({
  baseUrl: z.string().url().max(2000),
  token: z.string().max(4096).optional(),
  allowWrites: z.boolean().default(false),
  cases: z.array(z.object({
    name: z.string().min(1).max(100),
    method: z.enum(["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE"]).default("GET"),
    path: z.string().max(2000).refine(value => value.startsWith("/") && !value.startsWith("//"), "Paths must start with one /.").default("/"),
    expectedStatus: z.number().int().min(100).max(599),
    maxMs: z.number().int().min(1).max(8000).optional(),
    jsonPaths: z.array(z.string().max(100)).max(15).default([]),
    jsonBody: z.unknown().optional(),
    authenticated: z.boolean().default(true),
    responseSchema: z.record(z.unknown()).optional(),
  })).min(1).max(3),
});

export type CheckInput = z.infer<typeof checkInput>;
export type CaseResult = { name: string; method: string; path: string; outcome: "passed" | "failed" | "error";
  status?: number; elapsedMs?: number; assertions: { label: string; passed: boolean }[]; error?: string };
export type CheckReport = { startedAt: string; targetOrigin: string; results: CaseResult[]; passed: number; failed: number; errors: number };

export function hasJsonPath(value: unknown, path: string): boolean {
  let current = value;
  for (const key of path.replace(/^\$\.?/, "").split(".").filter(Boolean)) {
    if (!current || typeof current !== "object" || !Object.prototype.hasOwnProperty.call(current, key)) return false;
    current = (current as Record<string, unknown>)[key];
  }
  return true;
}
