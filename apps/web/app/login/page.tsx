"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { signInWithEmailAndPassword } from "firebase/auth"
import { getFirebaseClientAuth } from "../../lib/firebase/client"
import Image from "next/image"
import CircuitNetwork from "../../components/new-home/CircuitNetwork"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const auth = getFirebaseClientAuth()
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password)
      const idToken = await credential.user.getIdToken()

      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      })

      const data = await res.json()
      if (!data.success) {
        setError(data.error ?? "Error al iniciar sesión")
        return
      }

      router.push("/panel")
      router.refresh()
    } catch (err: unknown) {
      const code = (err as { code?: string }).code
      if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found") {
        setError("Credenciales inválidas")
      } else if (code === "auth/too-many-requests") {
        setError("Demasiados intentos. Intenta más tarde.")
      } else {
        setError("Error al iniciar sesión. Verifica tu conexión.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-16 bg-[#070f1e]">
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#0a192f] to-[#112240]">
        <CircuitNetwork />
      </div>
      <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-t from-[#070f1e]/90 via-[#070f1e]/50 to-transparent" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-[120px]" />

      <section className="relative z-10 w-full max-w-md text-center">
        <div className="mx-auto flex items-center justify-center">
          <Image
            src="/branding/cops.PNG"
            alt="COPS Electronics"
            width={120}
            height={120}
            className="drop-shadow-[0_0_20px_rgba(0,163,196,0.3)]"
            priority
          />
        </div>

        <h1 className="mt-4 text-3xl font-black tracking-tight text-white drop-shadow-md">
          COP&apos;S Electronics
        </h1>
        <p className="mt-2 text-sm font-medium tracking-wide text-cyan-200/70 uppercase">
          Enterprise Service Portal
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 rounded-3xl border border-white/10 bg-[#0b1426]/70 p-7 text-left shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] backdrop-blur-2xl transition-all duration-500 hover:border-cyan-500/30 hover:bg-[#0b1426]/80"
        >
          <h2 className="text-center text-2xl font-bold text-white">Iniciar Sesión</h2>
          <p className="mt-2 text-center text-sm font-medium text-slate-400">
            Ingresa tus credenciales operativas
          </p>

          <div className="mt-8">
            <label className="block text-[11px] font-bold uppercase tracking-widest text-cyan-500" htmlFor="email">
              Correo electrónico
            </label>
            <div className="relative mt-2">
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-medium text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-500/50 focus:bg-black/40 focus:ring-1 focus:ring-cyan-500/50 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="usuario@copselectronics.com"
              />
            </div>
          </div>

          <div className="mt-5">
            <label className="block text-[11px] font-bold uppercase tracking-widest text-cyan-500" htmlFor="password">
              Contraseña
            </label>
            <div className="relative mt-2">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 pr-12 text-sm font-medium text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-500/50 focus:bg-black/40 focus:ring-1 focus:ring-cyan-500/50 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                disabled={loading}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-cyan-300 disabled:opacity-50"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="mt-4 rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-center text-xs font-semibold text-rose-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-500/40 bg-gradient-to-r from-cyan-600/80 to-blue-600/80 px-4 py-3.5 text-sm font-bold uppercase tracking-widest text-white shadow-[0_0_20px_rgba(0,163,196,0.2)] transition-all hover:border-cyan-400 hover:from-cyan-500 hover:to-blue-500 hover:shadow-[0_0_30px_rgba(0,163,196,0.4)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                AUTENTICANDO...
              </>
            ) : (
              <>
                ACCEDER
                <span aria-hidden className="ml-1">→</span>
              </>
            )}
          </button>

          <div className="mt-6 border-t border-white/5 pt-5">
            <p className="text-center text-[11px] font-medium text-slate-500">¿Problemas de acceso? Contacta a IT.</p>
          </div>
        </form>

        <p className="mt-8 text-[10px] font-bold uppercase tracking-widest text-slate-500">
          © {new Date().getFullYear()} COP&apos;S Electronics.
        </p>
      </section>
    </main>
  )
}
