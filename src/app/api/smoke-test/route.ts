import { NextResponse } from "next/server";
import { z } from "zod";

import { executeSinglePageScan, getRecentSinglePageScans } from "@/lib/scan/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const requestSchema = z.object({
  websiteUrl: z.string().min(1, "Enter a website URL.")
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get("limit") ?? "5");

  const scans = await getRecentSinglePageScans(Number.isFinite(limit) ? Math.max(1, Math.min(limit, 20)) : 5);
  return NextResponse.json({ scans });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request." }, { status: 400 });
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

