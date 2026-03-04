import { createClient, type SupabaseClient } from "@supabase/supabase-js"

type AdminDb = Record<string, never>

function getSupabaseUrl(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || ""
}

function getServiceRoleKey(): string {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || ""
}

export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseUrl()) && Boolean(getServiceRoleKey())
}

export function createSupabaseAdminClient(): SupabaseClient<AdminDb> {
  const url = getSupabaseUrl()
  const key = getServiceRoleKey()
  if (!url || !key) {
    throw new Error("supabase_not_configured")
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

