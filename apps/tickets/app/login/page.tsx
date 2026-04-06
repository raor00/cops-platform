import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import {
  DEMO_SESSION_COOKIE,
  isFirebaseMode,
  isLocalMode,
} from "@/lib/local-mode"
import { verifyFirebaseSession } from "@/lib/firebase/session"
import LocalLoginForm from "./LocalLoginForm"

const WEB_URL = (process.env.WEB_URL || "https://cops-platform-web.vercel.app").replace(/\/$/, "")

export default async function LoginPage() {
  // Firebase mode (production): tickets has no standalone login.
  // If already authenticated go to dashboard, otherwise redirect to web platform.
  if (isFirebaseMode()) {
    const uid = await verifyFirebaseSession()
    if (uid) redirect("/dashboard")
    redirect(WEB_URL + "/login")
  }

  // Local / demo mode (development only): show local login form
  if (isLocalMode()) {
    const cookieStore = await cookies()
    const hasDemoSession = cookieStore.get(DEMO_SESSION_COOKIE)?.value === "1"
    if (hasDemoSession) redirect("/dashboard")
    return <LocalLoginForm />
  }

  return <LocalLoginForm />
}
