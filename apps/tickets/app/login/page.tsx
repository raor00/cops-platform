import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import {
  DEMO_SESSION_COOKIE,
  getMissingFirebaseEnvKeys,
  hasFirebaseConfig,
  isFirebaseMode,
  isLocalMode,
} from "@/lib/local-mode"
import { verifyFirebaseSession } from "@/lib/firebase/session"
import FirebaseLoginForm from "./FirebaseLoginForm"
import LocalLoginForm from "./LocalLoginForm"

export default async function LoginPage() {
  // Firebase mode: show built-in login form
  if (isFirebaseMode()) {
    if (!hasFirebaseConfig()) {
      const missingVars = getMissingFirebaseEnvKeys()

      return (
        <div className="flex min-h-screen items-center justify-center bg-[#0a0f1e] px-6">
          <div className="w-full max-w-2xl rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-white backdrop-blur-sm">
            <h1 className="text-2xl font-bold">Configuración incompleta de Firebase</h1>
            <p className="mt-3 text-sm text-red-100">
              El módulo de tickets está corriendo en entorno real y YA NO debe caer a datos mock.
              Para iniciar sesión y crear técnicos necesitas completar las variables de entorno de Firebase en Vercel.
            </p>
            <div className="mt-6 rounded-xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-wide text-red-200">Variables faltantes</p>
              <ul className="mt-3 space-y-2 text-sm text-red-50">
                {missingVars.map((key) => (
                  <li key={key} className="font-mono">
                    - {key}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )
    }

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
