import { describe, expect, it } from "vitest";
import { smokeTestSchema } from "@/lib/validators/smoke-test";
import { normalizeTargetUrl, projectKeyFromUrl, slugify } from "@/lib/scan/utils";
import { defectInput, defectPatch } from "@/lib/defects/schema";
const valid = { title: "Synthetic checkout failure", description: "Fixture only", severity: "high", priority: "high" };
describe("URL parsing and validation", () => {
  it.each([["example.com","https://example.com/"],[" localhost:4173 ","http://localhost:4173/"],["127.0.0.1:4173","http://127.0.0.1:4173/"]])("normalises %s", (input, expected) => expect(normalizeTargetUrl(input)).toBe(expected));
  it.each(["", "   ", "http://[", "ftp://example.com", "https://user:password@example.com"])("rejects invalid URL %s", websiteUrl => expect(smokeTestSchema.safeParse({websiteUrl}).success).toBe(false));
  it("creates stable project keys", () => expect(projectKeyFromUrl("https://www.example.com")).toBe("EXAMPLEC"));
  it("sanitises filenames", () => expect(slugify("  A / B <script>  ")).toBe("a-b-script"));
});
describe("defect validation", () => {
  it("trims title and defaults status", () => expect(defectInput.parse({...valid,title:"  Synthetic failure  "})).toMatchObject({title:"Synthetic failure",status:"open"}));
  it.each([{title:" "},{severity:"urgent"},{title:"x".repeat(121)},{description:""},{owner:"unexpected"}])("rejects invalid field %j", input => expect(defectInput.safeParse({...valid,...input}).success).toBe(false));
  it("rejects empty patches", () => expect(defectPatch.safeParse({}).success).toBe(false));
  it("accepts a status-only patch without resetting other fields", () => expect(defectPatch.parse({status:"retest"})).toEqual({status:"retest"}));
});
