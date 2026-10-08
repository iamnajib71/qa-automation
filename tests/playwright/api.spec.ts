import { test, expect } from "@playwright/test";
import { defectRecord } from "../../src/lib/defects/schema";

const synthetic = { title: "Synthetic Playwright API defect", description: "Created by automated tests; fictional data.", severity: "high", priority: "high", status: "open" };
const missing = "00000000-0000-4000-8000-000000000000";
let id: string;
test.describe.serial("REST contract and scanner regression", () => {
  test.afterAll(async ({ request }) => { if (id) await request.delete(`/api/defects/${id}`); });
  test("API-01 list schema", async ({ request }) => {
    const response = await request.get("/api/defects"); expect(response.status()).toBe(200);
    const data = await response.json(); expect(Array.isArray(data.defects)).toBe(true);
    data.defects.forEach((item: unknown) => expect(defectRecord.safeParse(item).success).toBe(true));
  });
  test("API-02 create schema and Location", async ({ request }) => {
    const response = await request.post("/api/defects", { data: synthetic }); expect(response.status()).toBe(201);
    const data = await response.json(); expect(defectRecord.safeParse(data.defect).success).toBe(true); id = data.defect.id;
    expect(data.defect).toMatchObject(synthetic); expect(response.headers().location).toBe(`/api/defects/${id}`);
  });
  test("API-03 read persisted record", async ({ request }) => {
    const response = await request.get(`/api/defects/${id}`); expect(response.status()).toBe(200);
    expect(defectRecord.safeParse((await response.json()).defect).success).toBe(true); expect((await response.json()).defect).toMatchObject(synthetic);
  });
  test("API-04 patch status preserves title", async ({ request }) => {
    const response = await request.patch(`/api/defects/${id}`, { data: { status: "retest" } }); expect(response.status()).toBe(200);
    const defect = (await response.json()).defect; expect(defectRecord.safeParse(defect).success).toBe(true); expect(defect).toMatchObject({ title: synthetic.title, status: "retest" });
  });
  for (const [code, input] of [["API-05", {title:" "}], ["API-06", {severity:"urgent"}], ["API-07", {owner:"unexpected"}]] as const) {
    test(`${code} invalid create returns 400`, async ({ request }) => {
      const response = await request.post("/api/defects", { data: {...synthetic,...input} }); expect(response.status()).toBe(400); expect(typeof (await response.json()).error).toBe("string");
    });
  }
  for (const [code, data] of [["API-08", {}], ["API-09", {status:"invalid"}]] as const) {
    test(`${code} invalid patch returns 400`, async ({ request }) => { const response = await request.patch(`/api/defects/${id}`, {data}); expect(response.status()).toBe(400); expect(typeof (await response.json()).error).toBe("string"); });
  }
  test("API-10 malformed defect JSON", async ({ request }) => { const response = await request.post("/api/defects", {data:'{"title":',headers:{"Content-Type":"application/json"}}); expect(response.status()).toBe(400); expect(typeof (await response.json()).error).toBe("string"); });
  for (const method of ["get", "patch", "delete"] as const) {
    const code = { get: "API-11", patch: "API-12", delete: "API-13" }[method];
    test(`${code} missing defect ${method} returns 404`, async ({ request }) => { const response = await request[method](`/api/defects/${missing}`, method === "patch" ? {data:{status:"closed"}} : {}); expect(response.status()).toBe(404); expect((await response.json()).error).toBe("Defect not found."); });
  }
  test("API-14 delete returns empty 204", async ({ request }) => { const response = await request.delete(`/api/defects/${id}`); expect(response.status()).toBe(204); expect(await response.text()).toBe(""); });
  test("API-15 deleted record returns 404", async ({ request }) => { expect((await request.get(`/api/defects/${id}`)).status()).toBe(404); });
  test("API-16 scan history schema", async ({ request }) => { const response = await request.get("/api/smoke-test?limit=2"); expect(response.status()).toBe(200); const data = await response.json(); expect(Array.isArray(data.scans)).toBe(true); expect(data.scans.length).toBeLessThanOrEqual(2); });
  test("API-17 BUG-001 malformed scanner JSON returns 400", async ({ request }) => { const response = await request.post("/api/smoke-test", {data:'{"websiteUrl":',headers:{"Content-Type":"application/json"}}); expect(response.status()).toBe(400); expect(typeof (await response.json()).error).toBe("string"); });
  test("API-18 BUG-002 invalid URL returns 400", async ({ request }) => { const response = await request.post("/api/smoke-test", {data:{websiteUrl:"http://["}}); expect(response.status()).toBe(400); expect(typeof (await response.json()).error).toBe("string"); });
  test("API-19 missing scanner URL returns 400", async ({ request }) => { expect((await request.post("/api/smoke-test", {data:{}})).status()).toBe(400); });
  test("API-20 real browser scan returns evidence", async ({ request, baseURL }) => {
    const response = await request.post("/api/smoke-test", {data:{websiteUrl:baseURL}}); expect(response.status()).toBe(200);
    const data = await response.json(); expect(data.pageScan.httpStatus).toBe(200); expect(data.scanRun.status).toBe("completed"); expect(data.pageScan.metrics.browserFallbackReason).toBeUndefined();
    expect(data.evidence.map((item: {kind:string})=>item.kind)).toEqual(["screenshot","raw_scan","axe_results"]);
    for (const item of data.evidence) expect((await request.get(item.filePath)).status()).toBe(200);
    expect((await request.get("/api/smoke-test?limit=1")).ok()).toBe(true);
  });
  test("API-21 BUG-003 unknown project returns 404", async ({ request }) => { const response = await request.get(`/projects/${missing}`); expect(response.status()).toBe(404); });
});

test("API-22 concurrent creates do not lose JSON records", async ({ request }) => {
  const ids: string[] = [];
  const title = `Synthetic concurrency ${Date.now()}`;
  try {
    const responses = await Promise.all(Array.from({length:8}, (_,i) => request.post("/api/defects",{data:{...synthetic,title:`${title} ${i}`}})));
    for (const response of responses) {
      expect(response.status()).toBe(201);
      ids.push((await response.json()).defect.id);
    }
    const records = (await (await request.get("/api/defects")).json()).defects;
    expect(records.filter((item:{id:string})=>ids.includes(item.id))).toHaveLength(8);
    expect(new Set(ids).size).toBe(8);
  } finally { await Promise.all(ids.map(id=>request.delete(`/api/defects/${id}`))); }
});
