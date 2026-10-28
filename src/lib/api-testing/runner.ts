import Ajv from "ajv";
import addFormats from "ajv-formats";
import { boundedRequest } from "./network";
import { CheckInput, CheckReport, CaseResult, hasJsonPath } from "./schema";
import { validateSchemaBudget } from "./openapi";

export async function runApiChecks(input: CheckInput): Promise<CheckReport> {
  const startedAt = new Date().toISOString();
  const base = new URL(input.baseUrl);
  const results: CaseResult[] = await Promise.all(input.cases.map(async item => {
    const result: CaseResult = { name: item.name, method: item.method, path: item.path.split("?")[0], outcome: "error", assertions: [] };
    try {
      if (item.responseSchema) validateSchemaBudget(item.responseSchema);
      if (!["GET", "HEAD"].includes(item.method) && !input.allowWrites) throw new Error("Enable requests that change data before running this method.");
      const url = new URL(base.toString().replace(/\/$/, "") + item.path);
      if (url.origin !== base.origin) throw new Error("Every request must stay on the configured API origin.");
      const headers: Record<string, string> = {};
      if (input.token && item.authenticated) headers.Authorization = `Bearer ${input.token}`;
      const body = item.jsonBody === undefined ? undefined : JSON.stringify(item.jsonBody);
      if (body && Buffer.byteLength(body) > 16 * 1024) throw new Error("JSON request body exceeds 16 KiB.");
      if (body) headers["Content-Type"] = "application/json";
      const response = await boundedRequest(url, item.method, headers, body);
      result.status = response.status;
      result.elapsedMs = response.elapsedMs;
      result.assertions.push({ label: `HTTP ${item.expectedStatus}`, passed: response.status === item.expectedStatus });
      if (item.maxMs) result.assertions.push({ label: `Response within ${item.maxMs} ms`, passed: response.elapsedMs <= item.maxMs });
      if (item.jsonPaths.length || item.responseSchema) {
        let json: unknown;
        try { json = JSON.parse(response.text); } catch { throw new Error("Response is not valid JSON."); }
        for (const path of item.jsonPaths) result.assertions.push({ label: `JSON path ${path} exists`, passed: hasJsonPath(json, path) });
        if (item.responseSchema) {
          const ajv = new Ajv({ strict: false, allErrors: false, validateFormats: true });
          addFormats(ajv);
          // Remote references are never fetched; schema validation cannot make network requests.
          const validate = ajv.compile(item.responseSchema);
          result.assertions.push({ label: "Response matches JSON Schema", passed: Boolean(validate(json)) });
        }
      }
      result.outcome = result.assertions.every(check => check.passed) ? "passed" : "failed";
    } catch (error) {
      const message = error instanceof Error ? error.message : "Request failed.";
      result.error = input.token ? message.split(input.token).join("[redacted]") : message;
    }
    return result;
  }));
  return { startedAt, targetOrigin: base.origin, results,
    passed: results.filter(r => r.outcome === "passed").length, failed: results.filter(r => r.outcome === "failed").length,
    errors: results.filter(r => r.outcome === "error").length };
}
