import { describe, expect, it } from "vitest";
import { accessibilityScore, bestPracticesScore, scoreFromThreshold, seoScore } from "@/lib/scan/scoring";
import { clampScore } from "@/lib/scan/utils";

describe("score boundaries", () => {
  it.each([[0,100],[2500,100],[2501,70],[4500,70],[4501,35]])("latency %d yields %d", (value, expected) => expect(scoreFromThreshold(value,2500,4500)).toBe(expected));
  it.each([[-20,0],[101,100],[84.6,85]])("clamps and rounds %d to %d", (value, expected) => expect(clampScore(value)).toBe(expected));
  it("penalises serious accessibility violations", () => expect(accessibilityScore(2,1)).toBe(78));
  it("caps heavy accessibility penalties at zero", () => expect(accessibilityScore(50,20)).toBe(0));
  it("rewards a complete SEO baseline", () => expect(seoScore(true,true,1,0)).toBe(100));
  it("penalises missing metadata and broken requests", () => expect(seoScore(false,false,0,1)).toBe(0));
  it("gives a healthy secure page full best-practice score", () => expect(bestPracticesScore(true,0,0,0)).toBe(100));
  it("does not let runtime penalties reduce category weights below zero", () => expect(bestPracticesScore(false,9,9,9)).toBe(10));
});
