import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { createServer, type Server } from "node:http";
import { isPublicAddress } from "@/lib/api-testing/network";
import { runApiChecks } from "@/lib/api-testing/runner";
import { checkInput } from "@/lib/api-testing/schema";
import { importOpenApi, validateSchemaBudget } from "@/lib/api-testing/openapi";
import { assessPhpVersion, phpAdvisory } from "@/lib/security/php";

describe("API network boundary", () => {
  it.each(["127.0.0.1", "10.1.2.3", "169.254.169.254", "172.16.1.1", "192.168.1.1", "0.0.0.0", "::1", "::ffff:127.0.0.1", "2001:0db8::1", "fe80::1", "fc00::1", "2001::1"]) ("blocks %s", address => expect(isPublicAddress(address)).toBe(false));
  it.each(["8.8.8.8", "1.1.1.1", "2606:4700:4700::1111"]) ("permits global address %s", address => expect(isPublicAddress(address)).toBe(true));
});

describe("real HTTP assertion runner", () => {
  let server: Server;
  let baseUrl: string;
  beforeAll(async () => {
    server = createServer((request, response) => {
      if (request.url === "/redirect") { response.writeHead(302, { Location: "http://169.254.169.254/" }); response.end(); return; }
      response.setHeader("Content-Type", "application/json");
      if (request.url === "/private" && request.headers.authorization !== "Bearer fixture-secret") response.writeHead(401);
      response.end(JSON.stringify({ id: 1, title: "Synthetic HTTP test fixture" }));
    });
    await new Promise<void>(resolve => server.listen(0, "127.0.0.1", resolve));
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("Fixture failed to listen.");
    baseUrl = `http://127.0.0.1:${address.port}`;
    vi.stubEnv("API_TEST_LOCAL_ORIGIN", baseUrl);
  });
  afterAll(async () => { await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve())); vi.unstubAllEnvs(); });
  it("records a pass, a failed contract and a real negative-auth result", async () => {
    const report = await runApiChecks(checkInput.parse({ baseUrl, token: "fixture-secret", cases: [
      { name: "Read", path: "/", expectedStatus: 200, jsonPaths: ["title"] },
      { name: "Wrong contract", path: "/", expectedStatus: 200, responseSchema: { type: "object", required: ["missing"] } },
      { name: "Auth denied", path: "/private", expectedStatus: 401, authenticated: false },
    ] }));
    expect([report.passed, report.failed, report.errors]).toEqual([2, 1, 0]);
    expect(JSON.stringify(report)).not.toContain("fixture-secret");
    expect(JSON.stringify(report)).not.toContain("Synthetic HTTP test fixture");
  });
  it("does not follow redirects to a private target", async () => {
    const report = await runApiChecks(checkInput.parse({ baseUrl, cases: [{ name: "Redirect", path: "/redirect", expectedStatus: 302 }] }));
    expect(report.results[0].status).toBe(302);
    expect(report.passed).toBe(1);
  });
  it("rejects writes without opt-in", async () => {
    const report = await runApiChecks(checkInput.parse({ baseUrl, cases: [{ name: "Write", method: "POST", path: "/", expectedStatus: 200 }] }));
    expect(report.errors).toBe(1);
    expect(report.results[0].status).toBeUndefined();
  });
});

describe("contract import and execution budgets", () => {
  it("inlines shared OpenAPI response schemas and skips parameterized paths", () => {
    const result = importOpenApi({ openapi: "3.0.3", servers: [{ url: "https://example.com/api" }], components: { schemas: { Item: { type: "object", required: ["id"] } } }, paths: {
      "/items": { get: { responses: { "200": { content: { "application/json": { schema: { $ref: "#/components/schemas/Item" } } } } } } },
      "/items/{id}": { get: { responses: { "200": {} } } },
    } });
    expect(result.baseUrl).toBe("https://example.com/api");
    expect(result.cases).toHaveLength(1);
    expect(result.cases[0].responseSchema).toEqual({ type: "object", required: ["id"] });
    expect(result.skipped).toBe(1);
  });
  it("rejects unsafe or costly schema features before validation", () => {
    expect(() => validateSchemaBudget({ pattern: "(a+)+$" })).toThrow();
    expect(() => validateSchemaBudget({ $ref: "https://example.com/schema" })).toThrow();
    expect(checkInput.safeParse({ baseUrl: "https://example.com", cases: Array(4).fill({ name: "case", path: "/", expectedStatus: 200 }) }).success).toBe(false);
  });
});

describe("PHP advisory assessment", () => {
  for (const fixed of Object.values(phpAdvisory.fixed)) {
    const parts = fixed.split(".");
    it(`classifies the release boundary for ${fixed}`, () => {
      expect(assessPhpVersion(`${parts[0]}.${parts[1]}.${Number(parts[2]) - 1}`).status).toBe("needs-update");
      expect(assessPhpVersion(fixed).status).toBe("upstream-fixed");
    });
  }
  it("keeps header, package and unknown evidence inconclusive", () => {
    expect(assessPhpVersion("8.4.27", "header").status).toBe("inconclusive");
    expect(assessPhpVersion("8.4.26-ubuntu1", "package").status).toBe("inconclusive");
    expect(assessPhpVersion("8.1.34").status).toBe("inconclusive");
    expect(assessPhpVersion("hidden").status).toBe("inconclusive");
  });
});
