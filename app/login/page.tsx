"use client";

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
    <main className="relative mx-auto max-w-xl px-4 py-20">
      <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-brand-500/20 blur-[90px]" />

      <h1 className="text-3xl font-semibold text-white">Iniciar sesion</h1>
      <p className="mt-2 text-white/55">Acceso al portal de modulos internos.</p>

      <form onSubmit={onSubmit} className="mt-8 lg-card p-6">
        <label className="block text-sm font-semibold text-white/80" htmlFor="username">Usuario</label>
        <input id="username" type="text" value={username} onChange={(event) => setUsername(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none backdrop-blur-sm transition focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20" placeholder="Usuario" autoComplete="username" />

        <label className="mt-4 block text-sm font-semibold text-white/80" htmlFor="password">Contrasena</label>
        <input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none backdrop-blur-sm transition focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20" placeholder="Contrasena" autoComplete="current-password" />

        {error && <p className="mt-4 text-sm font-semibold text-red-400">{error}</p>}

        <button type="submit" className="btn-glass-primary mt-6 w-full">Entrar al portal</button>

        <p className="mt-4 text-xs text-white/45">Credenciales demo: usuario `admin` y clave `admin123`.</p>
      </form>
    </main>
  );
}
