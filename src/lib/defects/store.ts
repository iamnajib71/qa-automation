import { randomUUID } from "node:crypto";
import { mutateDatabase, readDatabase } from "@/lib/scan/local-store";
import type { Defect } from "./schema";

export async function listDefects() { return (await readDatabase()).defects; }
export async function findDefect(id: string) { return (await listDefects()).find((item) => item.id === id) ?? null; }
export async function createDefect(input: Omit<Defect, "id" | "createdAt" | "updatedAt">) {
  return mutateDatabase((db) => {
    const now = new Date().toISOString();
    const defect = { ...input, id: randomUUID(), createdAt: now, updatedAt: now };
    db.defects.unshift(defect);
    return defect;
  });
}
export async function updateDefect(id: string, input: Partial<Omit<Defect, "id" | "createdAt" | "updatedAt">>) {
  return mutateDatabase((db) => {
    const defect = db.defects.find((item) => item.id === id);
    if (!defect) return null;
    Object.assign(defect, input, { updatedAt: new Date().toISOString() });
    return defect;
  });
}
export async function deleteDefect(id: string) {
  return mutateDatabase((db) => {
    const index = db.defects.findIndex((item) => item.id === id);
    if (index < 0) return false;
    db.defects.splice(index, 1);
    return true;
  });
}
