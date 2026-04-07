export const DEMO_SESSION_COOKIE = "tickets_demo_session"
export const FIREBASE_SESSION_COOKIE = "tickets_firebase_session"
export const BRIDGE_SESSION_COOKIE = "tickets_bridge_session"
// Short-lived (55 min) cookie set by /auth/firebase-bridge — stores raw Firebase idToken
// verified with auth.verifyIdToken() on each request. No shared secret needed.
export const FIREBASE_BRIDGE_ID_TOKEN_COOKIE = "tickets_firebase_id_token"

export type TicketsDataMode = "local" | "firebase"

type TicketsModeEnv = Record<string, string | undefined>

const FIREBASE_CLIENT_ENV_KEYS = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
] as const

const FIREBASE_ADMIN_ENV_KEYS = [
  "FIREBASE_PROJECT_ID",
  "FIREBASE_CLIENT_EMAIL",
  "FIREBASE_PRIVATE_KEY",
] as const

function envIsTrue(value: string | undefined): boolean {
  return value?.trim().toLowerCase() === "true"
}

function envIsFalse(value: string | undefined): boolean {
  return value?.trim().toLowerCase() === "false"
}

function isProductionRuntime(env: TicketsModeEnv = process.env): boolean {
  return env.NODE_ENV === "production" || env.VERCEL === "1"
}

export function hasFirebaseAdminConfig(env: TicketsModeEnv = process.env): boolean {
  return FIREBASE_ADMIN_ENV_KEYS.every((key) => Boolean(env[key]))
}

export function hasFirebaseClientConfig(env: TicketsModeEnv = process.env): boolean {
  return FIREBASE_CLIENT_ENV_KEYS.every((key) => Boolean(env[key]))
}

export function hasFirebaseConfig(env: TicketsModeEnv = process.env): boolean {
  return hasFirebaseAdminConfig(env) && hasFirebaseClientConfig(env)
}

export function getMissingFirebaseEnvKeys(env: TicketsModeEnv = process.env): string[] {
  return [...FIREBASE_CLIENT_ENV_KEYS, ...FIREBASE_ADMIN_ENV_KEYS].filter((key) => !env[key])
}

export function resolveTicketsDataMode(env: TicketsModeEnv = process.env): TicketsDataMode {
  const explicitFlag = env.TICKETS_LOCAL_MODE ?? env.NEXT_PUBLIC_TICKETS_LOCAL_MODE

  if (envIsTrue(explicitFlag)) {
    return "local"
  }

  if (hasFirebaseConfig(env)) return "firebase"

  if (envIsFalse(explicitFlag) || isProductionRuntime(env)) {
    return "firebase"
  }

  return "local"
}

export function isLocalMode(): boolean {
  return resolveTicketsDataMode() === "local"
}

/**
 * Returns true when Firebase credentials are configured and local mode is off.
 * In this mode all data is stored in Firestore / Firebase Auth.
 */
export function isFirebaseMode(): boolean {
  return resolveTicketsDataMode() === "firebase"
}
