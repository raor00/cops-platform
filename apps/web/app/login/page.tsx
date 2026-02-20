"use client";

import { Eye, EyeOff, Zap } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

  useEffect(() => {
    if (hasSession()) {
      router.replace("/panel");
    }
  }, [router]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const user = authenticateUser(username, password);

    if (!user) {
      setError("Usuario o contrasena invalidos.");
      return;
    }

    document.cookie = `${MASTER_SESSION_COOKIE}=${MASTER_SESSION_VALUE}; Path=/; Max-Age=28800; SameSite=Lax`;
    document.cookie = `${MASTER_ROLE_COOKIE}=${user.role}; Path=/; Max-Age=28800; SameSite=Lax`;
    document.cookie = `${MASTER_USER_COOKIE}=${user.username}; Path=/; Max-Age=28800; SameSite=Lax`;
    router.push("/panel");
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(59,130,246,.2),transparent_65%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#04142f_0%,#082247_45%,#0a2c58_100%)]" />
      <div className="pointer-events-none absolute left-1/2 top-10 h-72 w-72 -translate-x-1/2 rounded-full bg-sky-400/20 blur-[120px]" />

      <section className="relative z-10 w-full max-w-md text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-sky-300/30 bg-sky-500/20 backdrop-blur-xl">
          <Zap className="h-7 w-7 text-sky-300" />
        </div>

        <h1 className="mt-5 text-4xl font-bold tracking-tight text-white">COPS Electronics</h1>
        <p className="mt-2 text-lg text-slate-300">Sistema de Gestion de Servicios</p>

        <form
          onSubmit={onSubmit}
          className="mt-8 rounded-3xl border border-white/20 bg-white/[0.09] p-7 text-left shadow-[0_28px_80px_rgba(2,8,23,.5)] backdrop-blur-2xl"
        >
          <h2 className="text-center text-3xl font-semibold text-white">Iniciar Sesion</h2>
          <p className="mt-2 text-center text-base text-slate-300">Ingresa tus credenciales para continuar</p>

          <label className="mt-6 block text-lg font-semibold text-slate-100" htmlFor="username">
            Usuario
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-white/15 bg-slate-200/20 px-4 py-3 text-base text-white placeholder:text-slate-300/80 outline-none transition focus:border-sky-300/70 focus:ring-2 focus:ring-sky-400/30"
            placeholder="admin"
            autoComplete="username"
          />

          <label className="mt-5 block text-lg font-semibold text-slate-100" htmlFor="password">
            Contrasena
          </label>
          <div className="relative mt-2">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-2xl border border-white/15 bg-slate-200/20 px-4 py-3 pr-12 text-base text-white placeholder:text-slate-300/80 outline-none transition focus:border-sky-300/70 focus:ring-2 focus:ring-sky-400/30"
              placeholder="********"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 transition hover:text-white"
              aria-label={showPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          {error && <p className="mt-4 text-sm font-semibold text-rose-300">{error}</p>}

          <button
            type="submit"
            className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl border border-sky-300/40 bg-gradient-to-r from-sky-500 to-blue-500 px-4 py-3 text-xl font-semibold text-white transition hover:from-sky-400 hover:to-blue-400"
          >
            Iniciar Sesion
            <span aria-hidden>-&gt;</span>
          </button>

          <p className="mt-4 text-center text-sm text-slate-300/90">Problemas para acceder? Contacta al administrador</p>
          <p className="mt-2 text-center text-xs text-slate-300/70">Credenciales demo: admin / admin123</p>
        </form>

        <p className="mt-7 text-sm text-slate-300/70">(c) 2026 COP&apos;S Electronics, S.A. Todos los derechos reservados.</p>
      </section>
    </main>
  );
}
