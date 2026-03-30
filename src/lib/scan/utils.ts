import path from "node:path";
import { randomUUID } from "node:crypto";

export function createId() {
  return randomUUID();
}

export function nowIso() {
  return new Date().toISOString();
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export function normalizeTargetUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error("Enter a website URL.");
  }

  const shouldUseHttp = /^(localhost|127\.0\.0\.1|0\.0\.0\.0|10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.)/i.test(trimmed);
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `${shouldUseHttp ? "http" : "https"}://${trimmed}`;
  const parsed = new URL(withProtocol);
  return parsed.toString();
}

export function projectNameFromUrl(url: string) {
  const hostname = new URL(url).hostname.replace(/^www\./, "");
  return hostname
    .split(".")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function projectKeyFromUrl(url: string) {
  const hostname = new URL(url).hostname.replace(/^www\./, "");
  return hostname.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8).toUpperCase() || "SCAN";
}

export function ensureDirPath(...segments: string[]) {
  return path.join(process.cwd(), ...segments);
}

export function publicFileUrl(...segments: string[]) {
  return `/${segments.join("/")}`;
}

export function safeFileStem(value: string) {
  return slugify(value) || "scan";
}

export function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

