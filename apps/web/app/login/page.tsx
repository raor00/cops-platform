"use client";

import { Eye, EyeOff, Zap, Loader2 } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import CircuitNetwork from "../../components/new-home/CircuitNetwork";
import {
  MASTER_ROLE_COOKIE,
  MASTER_SESSION_COOKIE,
  MASTER_SESSION_VALUE,
  MASTER_USER_COOKIE,
  authenticateUser,
} from "../../lib/masterAuth";

function hasSession() {
  if (typeof document === "undefined") return false;
  const entry = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(`${MASTER_SESSION_COOKIE}=`));

  return entry?.split("=")[1] === MASTER_SESSION_VALUE;
}

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Set a session storage flag to skip the long fusion intro of ParticleNetwork on login
    if (typeof window !== "undefined") {
      sessionStorage.setItem("cops-intro-seen", "true");
    }

    if (hasSession()) {
      router.replace("/panel");
    }
  }, [router]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError("");

    // Simulate minimal network delay for smooth animation presentation
    await new Promise(r => setTimeout(r, 600));

    const user = authenticateUser(username, password);

    if (!user) {
      setError("Usuario o contraseña inválidos.");
      setIsSubmitting(false);
      return;
    }

    document.cookie = `${MASTER_SESSION_COOKIE}=${MASTER_SESSION_VALUE}; Path=/; Max-Age=28800; SameSite=Lax`;
    document.cookie = `${MASTER_ROLE_COOKIE}=${user.role}; Path=/; Max-Age=28800; SameSite=Lax`;
    document.cookie = `${MASTER_USER_COOKIE}=${user.username}; Path=/; Max-Age=28800; SameSite=Lax`;

    // Give animation time to complete before redirect
    setTimeout(() => {
      router.push("/panel");
    }, 400);
  };

  return (
    <main className="relative flex min-h-[calc(100vh-80px)] items-center justify-center overflow-hidden px-4 py-16 bg-[#070f1e]">
      {/* Graphic Engine Background */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#0a192f] to-[#112240]">
        <CircuitNetwork />
      </div>

      {/* Overlay Gradients */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-t from-[#070f1e]/90 via-[#070f1e]/50 to-transparent" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-[120px]" />

      <AnimatePresence mode="wait">
        {!hasSession() && (
          <motion.section
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-md text-center"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/30 bg-[#0f1b2e]/60 shadow-[0_0_30px_rgba(0,163,196,0.2)] backdrop-blur-xl">
              <Zap className="h-7 w-7 text-cyan-400" />
            </div>

            <h1 className="mt-5 text-3xl font-black tracking-tight text-white drop-shadow-md">COP&apos;S Electronics</h1>
            <p className="mt-2 text-sm font-medium tracking-wide text-cyan-200/70 uppercase">Enterprise Service Portal</p>

            <form
              onSubmit={onSubmit}
              className="mt-8 rounded-3xl border border-white/10 bg-[#0b1426]/70 p-7 text-left shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] backdrop-blur-2xl transition-all duration-500 hover:border-cyan-500/30 hover:bg-[#0b1426]/80 lg-card"
            >
              <h2 className="text-center text-2xl font-bold text-white">Iniciar Sesión</h2>
              <p className="mt-2 text-center text-sm font-medium text-slate-400">Ingresa tus credenciales operativas</p>

              <div className="mt-8">
                <label className="block text-[11px] font-bold uppercase tracking-widest text-cyan-500" htmlFor="username">
                  Usuario
                </label>
                <div className="relative mt-2">
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    disabled={isSubmitting}
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-medium text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-500/50 focus:bg-black/40 focus:ring-1 focus:ring-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="ID Operador"
                    autoComplete="username"
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
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    disabled={isSubmitting}
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 pr-12 text-sm font-medium text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-500/50 focus:bg-black/40 focus:ring-1 focus:ring-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    disabled={isSubmitting}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-cyan-300 disabled:opacity-50"
                    aria-label={showPassword ? "Ocultar" : "Mostrar"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 rounded-lg bg-rose-500/10 px-3 py-2 text-center text-xs font-semibold border border-rose-500/20 text-rose-300"
                >
                  {error}
                </motion.p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-500/40 bg-gradient-to-r from-cyan-600/80 to-blue-600/80 px-4 py-3.5 text-sm font-bold uppercase tracking-widest text-white shadow-[0_0_20px_rgba(0,163,196,0.2)] transition-all hover:border-cyan-400 hover:from-cyan-500 hover:to-blue-500 hover:shadow-[0_0_30px_rgba(0,163,196,0.4)] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
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

              <div className="mt-6 flex flex-col items-center justify-center gap-2 border-t border-white/5 pt-5">
                <p className="text-[11px] font-medium text-slate-500">¿Problemas de acceso? Contacta a IT.</p>
                <div className="rounded-md border border-slate-700/50 bg-[#060c18] px-3 py-1.5 text-[10px] font-mono text-cyan-400/80">
                  DEMO: admin / admin123
                </div>
              </div>
            </form>

            <p className="mt-8 text-[10px] font-bold uppercase tracking-widest text-slate-500">
              © {new Date().getFullYear()} COP&apos;S Electronics.
            </p>
          </motion.section>
        )}
      </AnimatePresence>
    </main>
  );
}
