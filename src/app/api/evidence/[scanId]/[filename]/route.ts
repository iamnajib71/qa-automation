import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ scanId: string; filename: string }> };
export async function GET(_request: Request, context: Context) {
  const { scanId, filename } = await context.params;
  if (!z.string().uuid().safeParse(scanId).success || !/^[a-z0-9-]+-(page\.png|scan\.json|axe\.json)$/.test(filename)) {
    return NextResponse.json({ error: "Evidence not found." }, { status: 404 });
  }
  try {
    const content = await fs.readFile(path.join(process.cwd(), "public", "generated", "scans", scanId, filename));
    return new NextResponse(new Uint8Array(content), { headers: {
      "Content-Type": filename.endsWith(".png") ? "image/png" : "application/json",
      "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff"
    } });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return NextResponse.json({ error: "Evidence not found." }, { status: 404 });
    throw error;
  }
}
