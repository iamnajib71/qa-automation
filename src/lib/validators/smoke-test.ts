import { z } from "zod";

function shouldDefaultToHttp(value: string) {
  return /^(localhost|127\.0\.0\.1|0\.0\.0\.0|10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.)/i.test(value);
}

function normalizeWebsiteUrl(value: string) {
  const trimmed = value.trim();

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  const protocol = shouldDefaultToHttp(trimmed) ? "http://" : "https://";
  return `${protocol}${trimmed}`;
}

export const smokeTestSchema = z.object({
  websiteUrl: z
    .string()
    .min(1, "Enter a website URL.")
    .transform(normalizeWebsiteUrl)
    .pipe(
      z.string().url().refine((value) => /^https?:\/\//.test(value), {
        message: "Enter a valid website URL."
      })
    )
});

