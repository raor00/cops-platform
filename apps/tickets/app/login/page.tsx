import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { DEMO_SESSION_COOKIE, isFirebaseMode } from "@/lib/local-mode"
import { verifyFirebaseSession } from "@/lib/firebase/session"
import FirebaseLoginForm from "./FirebaseLoginForm"

const WEB_APP_URL = (process.env.WEB_URL || "https://cops-platform-web.vercel.app").replace(/\/$/, "")

export default async function LoginPage() {
  // Firebase mode: show built-in login form
  if (isFirebaseMode()) {
    const uid = await verifyFirebaseSession()
    if (uid) redirect("/dashboard")

    return <FirebaseLoginForm />
  }

  // Local / demo mode: check demo cookie
  const cookieStore = await cookies()
  const hasDemoSession = cookieStore.get(DEMO_SESSION_COOKIE)?.value === "1"
  if (hasDemoSession) redirect("/dashboard")

  // Supabase mode: delegate to web app login
  redirect(`${WEB_APP_URL}/login`)
}
