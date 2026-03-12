"use server"

import { cookies } from "next/headers"
import { getAdminAuth } from "./admin"

const SESSION_COOKIE_NAME = "tickets_firebase_session"
const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 days in seconds

/**
 * Creates a Firebase session cookie from a client ID token.
 * Called by the login server action after the client signs in.
 */
export async function createFirebaseSession(idToken: string): Promise<void> {
  const auth = getAdminAuth()

  const sessionCookie = await auth.createSessionCookie(idToken, {
    expiresIn: SESSION_MAX_AGE * 1000, // ms
  })

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  })
}

/**
 * Verifies the Firebase session cookie and returns the UID.
 * Returns null if no valid session exists.
 */
export async function verifyFirebaseSession(): Promise<string | null> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value

    if (!sessionCookie) return null

    const auth = getAdminAuth()
    const decoded = await auth.verifySessionCookie(sessionCookie, true)
    return decoded.uid
  } catch {
    return null
  }
}

/**
 * Clears the Firebase session cookie.
 */
export async function clearFirebaseSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

/**
 * Returns true if there is an active Firebase session cookie.
 */
export async function hasFirebaseSession(): Promise<boolean> {
  const uid = await verifyFirebaseSession()
  return uid !== null
}
