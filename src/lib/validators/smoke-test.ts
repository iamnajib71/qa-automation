import { z } from "zod";
import { normalizeTargetUrl } from "@/lib/scan/utils";
export const smokeTestSchema = z.object({
  websiteUrl: z.string().trim().min(1, "Enter a website URL.").transform((value, ctx) => {
    try { return normalizeTargetUrl(value); }
    catch {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Enter a valid HTTP or HTTPS URL without credentials." });
      return z.NEVER;
    }
  })
}).strict();
