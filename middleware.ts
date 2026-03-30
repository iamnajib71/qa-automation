import { type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/projects/:path*",
    "/releases/:path*",
    "/test-cases/:path*",
    "/test-runs/:path*",
    "/defects/:path*",
    "/reports/:path*"
  ]
};

