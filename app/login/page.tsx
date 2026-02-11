<<<<<<< HEAD
﻿"use client";
=======
"use client";
>>>>>>> d767d44c790a81da87a628ee26c740ecfe1fdfc4

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  MASTER_PASSWORD,
  MASTER_SESSION_COOKIE,
  MASTER_SESSION_VALUE,
  MASTER_USERNAME,
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
      router.replace("/panel/cotizaciones");
    }
  }, [router]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validUser = username.trim() === MASTER_USERNAME;
    const validPassword = password === MASTER_PASSWORD;

    if (!validUser || !validPassword) {
      setError("Usuario o contraseña inválidos.");
      return;
    }

    document.cookie = `${MASTER_SESSION_COOKIE}=${MASTER_SESSION_VALUE}; Path=/; Max-Age=28800; SameSite=Lax`;
    router.push("/panel/cotizaciones");
  };

  return (
    <main className="mx-auto max-w-xl px-4 py-20">
<<<<<<< HEAD
      <h1 className="text-3xl font-semibold">Iniciar sesión</h1>
      <p className="mt-2 text-slate-700">Acceso al perfil maestro del sistema interno.</p>

      <form
        onSubmit={onSubmit}
        className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <label className="block text-sm font-semibold text-slate-700" htmlFor="username">
          Usuario
        </label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          placeholder="Usuario maestro"
          autoComplete="username"
        />

        <label className="mt-4 block text-sm font-semibold text-slate-700" htmlFor="password">
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          placeholder="Contraseña"
          autoComplete="current-password"
        />

        {error && <p className="mt-4 text-sm font-semibold text-red-600">{error}</p>}

        <button
          type="submit"
          className="mt-6 w-full rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          Entrar al panel
        </button>
=======
      <h1 className="text-3xl font-semibold text-white">Iniciar sesión</h1>
      <p className="mt-2 text-white/55">Acceso al perfil maestro del sistema interno.</p>

      <form onSubmit={onSubmit} className="mt-8 lg-card p-6">
        <label className="block text-sm font-semibold text-white/80" htmlFor="username">Usuario</label>
        <input id="username" type="text" value={username} onChange={(event) => setUsername(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none backdrop-blur-sm transition focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20" placeholder="Usuario maestro" autoComplete="username" />

        <label className="mt-4 block text-sm font-semibold text-white/80" htmlFor="password">Contraseña</label>
        <input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none backdrop-blur-sm transition focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20" placeholder="Contraseña" autoComplete="current-password" />

        {error && <p className="mt-4 text-sm font-semibold text-red-400">{error}</p>}

        <button type="submit" className="btn-glass-primary mt-6 w-full">Entrar al panel</button>
>>>>>>> d767d44c790a81da87a628ee26c740ecfe1fdfc4
      </form>
    </main>
  );
}
