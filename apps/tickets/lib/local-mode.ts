export const DEMO_SESSION_COOKIE = "tickets_demo_session"

export function isLocalMode(): boolean {
  const explicitFlag =
    process.env.TICKETS_LOCAL_MODE ?? process.env.NEXT_PUBLIC_TICKETS_LOCAL_MODE

  if (explicitFlag === "true") {
    return true
  }

  if (explicitFlag === "false") {
    return false
  }

  return (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}
