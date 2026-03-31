import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { DEMO_SESSION_COOKIE, isFirebaseMode, isLocalMode } from "@/lib/local-mode"
import { verifyFirebaseSession } from "@/lib/firebase/session"
import FirebaseLoginForm from "./FirebaseLoginForm"
import LocalLoginForm from "./LocalLoginForm"

export default async function LoginPage() {
  // Firebase mode: show built-in login form
  if (isFirebaseMode()) {
    const uid = await verifyFirebaseSession()
    if (uid) redirect("/dashboard")

    return <FirebaseLoginForm />
  }

  // Local / demo mode: check demo cookie
  if (isLocalMode()) {
    const cookieStore = await cookies()
    const hasDemoSession = cookieStore.get(DEMO_SESSION_COOKIE)?.value === "1"
    if (hasDemoSession) redirect("/dashboard")

    return <LocalLoginForm />
  }

  return <LocalLoginForm />
}
