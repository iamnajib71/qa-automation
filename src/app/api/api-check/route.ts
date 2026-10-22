import { NextResponse } from "next/server";
import { checkInput } from "@/lib/api-testing/schema";
import { runApiChecks } from "@/lib/api-testing/runner";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return NextResponse.json({ error: "Cross-origin submissions are not accepted." }, { status: 403 });
  const reader = request.body?.getReader();
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  if (reader) {
    for (;;) {
      const chunk = await reader.read();
      if (chunk.done) break;
      bytes += chunk.value.length;
      if (bytes > 64 * 1024) { await reader.cancel(); return NextResponse.json({ error: "Suite exceeds 64 KiB." }, { status: 413 }); }
      chunks.push(chunk.value);
    }
  }
  const text = Buffer.concat(chunks).toString("utf8");
  let body: unknown;
  try { body = JSON.parse(text); } catch { return NextResponse.json({ error: "Enter valid JSON." }, { status: 400 }); }
  const parsed = checkInput.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  return NextResponse.json(await runApiChecks(parsed.data), { headers: { "Cache-Control": "no-store" } });
}
