import { NextResponse } from "next/server";
import { defectPatch } from "@/lib/defects/schema";
import { deleteDefect, findDefect, updateDefect } from "@/lib/defects/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ id: string }> };
const missing = () => NextResponse.json({ error: "Defect not found." }, { status: 404 });
export async function GET(_request: Request, context: Context) {
  const defect = await findDefect((await context.params).id);
  return defect ? NextResponse.json({ defect }) : missing();
}
export async function PATCH(request: Request, context: Context) {
  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 }); }
  const parsed = defectPatch.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  const defect = await updateDefect((await context.params).id, parsed.data);
  return defect ? NextResponse.json({ defect }) : missing();
}
export async function DELETE(_request: Request, context: Context) {
  return await deleteDefect((await context.params).id) ? new NextResponse(null, { status: 204 }) : missing();
}
