"use client";

import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/types/database";
import { hasSupabaseEnv, supabaseAnonKey, supabaseUrl } from "@/lib/supabase/config";

export function createClient() {
  if (!hasSupabaseEnv()) {
    return null;
  }

  return createBrowserClient<Database>(supabaseUrl!, supabaseAnonKey!);
}
