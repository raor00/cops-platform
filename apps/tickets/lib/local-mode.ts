export const DEMO_SESSION_COOKIE = "tickets_demo_session"
export const FIREBASE_SESSION_COOKIE = "tickets_firebase_session"
export const BRIDGE_SESSION_COOKIE = "tickets_bridge_session"

export type TicketsDataMode = "local" | "firebase"

type TicketsModeEnv = Record<string, string | undefined>

function envIsTrue(value: string | undefined): boolean {
  return value?.trim().toLowerCase() === "true"
}

function envIsFalse(value: string | undefined): boolean {
  return value?.trim().toLowerCase() === "false"
}

export function hasFirebaseAdminConfig(env: TicketsModeEnv = process.env): boolean {
  return Boolean(
    env.FIREBASE_PROJECT_ID &&
      env.FIREBASE_CLIENT_EMAIL &&
      env.FIREBASE_PRIVATE_KEY
  )
}

export function hasFirebaseClientConfig(env: TicketsModeEnv = process.env): boolean {
  return Boolean(
    env.NEXT_PUBLIC_FIREBASE_API_KEY &&
      env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
      env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
      env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET &&
      env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID &&
      env.NEXT_PUBLIC_FIREBASE_APP_ID
  )
}

export function hasFirebaseConfig(env: TicketsModeEnv = process.env): boolean {
  return hasFirebaseAdminConfig(env) && hasFirebaseClientConfig(env)
}

export function resolveTicketsDataMode(env: TicketsModeEnv = process.env): TicketsDataMode {
  const explicitFlag = env.TICKETS_LOCAL_MODE ?? env.NEXT_PUBLIC_TICKETS_LOCAL_MODE

  if (envIsTrue(explicitFlag)) {
    return "local"
  }

  if (envIsFalse(explicitFlag)) {
    return hasFirebaseConfig(env) ? "firebase" : "local"
  }

  return hasFirebaseConfig(env) ? "firebase" : "local"
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
