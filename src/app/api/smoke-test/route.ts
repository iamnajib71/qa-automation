import { NextResponse } from "next/server";
import { smokeTestSchema } from "@/lib/validators/smoke-test";

import { executeSinglePageScan, getRecentSinglePageScans } from "@/lib/scan/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get("limit") ?? "5");

  const scans = await getRecentSinglePageScans(Number.isFinite(limit) ? Math.max(1, Math.min(limit, 20)) : 5);
  return NextResponse.json({ scans });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }
  try {
    const parsed = smokeTestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request." }, { status: 400 });
    }

    const allowedOrigin = new URL(process.env.NEXT_PUBLIC_APP_URL || "http://127.0.0.1:4173").origin;
    if (new URL(parsed.data.websiteUrl).origin !== allowedOrigin) {
      return NextResponse.json({ error: "This portfolio scans its own portal origin only." }, { status: 400 });
    }

    const result = await executeSinglePageScan(parsed.data.websiteUrl);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to complete the automated scan."
      },
      { status: 500 }
    );
  }
}

