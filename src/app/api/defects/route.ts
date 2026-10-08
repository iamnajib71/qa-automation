import { NextResponse } from "next/server";
import { defectInput } from "@/lib/defects/schema";
import { createDefect, listDefects } from "@/lib/defects/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() { return NextResponse.json({ defects: await listDefects() }); }
export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 }); }
  const parsed = defectInput.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  const defect = await createDefect(parsed.data);
  return NextResponse.json({ defect }, { status: 201, headers: { Location: `/api/defects/${defect.id}` } });
}
