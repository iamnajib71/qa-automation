import { z } from "zod";

export const defectInput = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().min(1).max(2000),
  severity: z.enum(["low", "medium", "high", "critical"]),
  priority: z.enum(["low", "medium", "high"]),
  status: z.enum(["open", "in_progress", "retest", "closed"]).default("open")
}).strict();
export const defectPatch = defectInput.partial().refine((value) => Object.keys(value).length > 0, "Provide at least one field.");
export const defectRecord = defectInput.extend({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});
export type Defect = z.infer<typeof defectRecord>;
