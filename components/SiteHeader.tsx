"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MASTER_SESSION_COOKIE, MASTER_SESSION_VALUE } from "../lib/masterAuth";

const NAV = [
  { href: "/soluciones", label: "Soluciones" },
  { href: "/proyectos", label: "Proyectos" },
  { href: "/partners", label: "Partners" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/contacto", label: "Contacto" },
];

function hasSession() {
  if (typeof document === "undefined") return false;
  const entry = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(`${MASTER_SESSION_COOKIE}=`));

  return entry?.split("=")[1] === MASTER_SESSION_VALUE;
}

const NAV = [
  { href: "/soluciones", label: "Soluciones" },
  { href: "/proyectos",  label: "Proyectos" },
  { href: "/partners",   label: "Partners" },
  { href: "/nosotros",   label: "Nosotros" },
  { href: "/contacto",   label: "Contacto" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const loggedIn = hasSession();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

<<<<<<< HEAD
  useEffect(() => { setOpen(false); }, [pathname]);

  const onDark = isHome && !scrolled;

  const headerBg = scrolled
    ? "bg-white/85 backdrop-blur-xl border-b border-slate-200/60 shadow-[0_1px_4px_rgba(0,0,0,.06)]"
    : isHome
      ? "bg-brand-950/60 backdrop-blur-md border-b border-white/8"
      : "bg-white border-b border-slate-200";

  const linkCls = onDark
    ? "text-white/85 hover:text-white hover:bg-white/10"
    : "text-slate-700 hover:text-brand-700 hover:bg-brand-50";

  const logoCls = onDark ? "text-white" : "text-brand-950";

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${headerBg}`}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className={`text-base font-bold tracking-tight transition-colors sm:text-lg ${logoCls}`}>
          COP&apos;S Electronics
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-0.5 md:flex">
          {NAV.map((n) => {
            const isActive = pathname === n.href;
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${linkCls} ${
                  isActive
                    ? onDark ? "bg-white/15 text-white" : "bg-brand-50 text-brand-700"
                    : ""
                }`}
              >
                {n.label}
              </Link>
            );
          })}

          <Link
            href="/contacto"
            className="ml-3 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-brand-600/25 transition hover:bg-brand-500 hover:shadow-lg"
=======
  const handleLogout = () => {
    document.cookie = `${MASTER_SESSION_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
    setPanelOpen(false);
    router.push("/");
  };

  const glass = scrolled
    ? "bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,.04)]"
    : isHome
      ? "bg-transparent border-b border-white/10"
      : "bg-white border-b border-slate-200";

  const linkCls = isHome && !scrolled
    ? "text-white/90 hover:text-white"
    : "text-slate-700 hover:text-brand-700";

  const logoCls = isHome && !scrolled ? "text-white" : "text-brand-900";

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${glass}`}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5">
        <Link href="/" className={`text-base font-bold tracking-tight sm:text-lg transition-colors ${logoCls}`}>
          COP&apos;S Electronics
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => {
                setOpen(false);
                setPanelOpen(false);
              }}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${linkCls} ${
                pathname === n.href
                  ? isHome && !scrolled
                    ? "bg-white/15 text-white"
                    : "bg-brand-50 text-brand-700"
                  : ""
              }`}
            >
              {n.label}
            </Link>
          ))}

          <Link
            href="/contacto"
            onClick={() => {
              setOpen(false);
              setPanelOpen(false);
            }}
            className="ml-3 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-brand-600/20 transition hover:bg-brand-700 hover:shadow-lg hover:shadow-brand-700/25"
>>>>>>> 79ae6ec (Update version)
          >
            Solicitar asesoría
          </Link>

<<<<<<< HEAD
          <Link
            href="/login"
            className={`ml-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
              onDark
                ? "text-white/70 hover:text-white hover:bg-white/10"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
            }`}
          >
            Iniciar sesión
          </Link>
        </nav>

        {/* Mobile */}
        <div className="flex items-center gap-2 md:hidden">
          <Link href="/contacto" className="rounded-xl bg-brand-600 px-3 py-2 text-xs font-semibold text-white shadow-sm">
=======
          {!loggedIn && (
            <Link
              href="/login"
              onClick={() => {
                setOpen(false);
                setPanelOpen(false);
              }}
              className="ml-2 rounded-xl px-4 py-2 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            >
              Iniciar sesión
            </Link>
          )}

          {loggedIn && (
            <div className="relative ml-2">
              <button
                type="button"
                onClick={() => setPanelOpen((v) => !v)}
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Panel
              </button>

              {panelOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-xl border border-slate-200 bg-white p-1 shadow-xl">
                  <Link
                    href="/panel/cotizaciones"
                    onClick={() => setPanelOpen(false)}
                    className="block rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-brand-50"
                  >
                    Cotizaciones
                  </Link>
                  <Link
                    href="/panel/tickets"
                    onClick={() => setPanelOpen(false)}
                    className="block rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-brand-50"
                  >
                    Tickets
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-1 block w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          )}
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <Link
            href="/contacto"
            className="rounded-xl bg-brand-600 px-3 py-2 text-xs font-semibold text-white shadow-sm"
          >
>>>>>>> 79ae6ec (Update version)
            Asesoría
          </Link>
          <button
            type="button"
            aria-label="Abrir menú"
            onClick={() => setOpen((v) => !v)}
            className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
<<<<<<< HEAD
              onDark
                ? "border-white/25 bg-white/10 text-white hover:bg-white/20"
                : "border-slate-300 bg-white text-slate-900 hover:bg-slate-50"
=======
              isHome && !scrolled
                ? "border-white/30 bg-white/10 text-white"
                : "border-slate-300 bg-white text-slate-900"
>>>>>>> 79ae6ec (Update version)
            }`}
          >
            {open ? "Cerrar" : "Menú"}
          </button>
        </div>
      </div>

      {open && (
        <div className="bg-white/95 backdrop-blur-xl md:hidden">
          <div className="mx-auto max-w-6xl px-4 pb-4">
            <div className="rounded-2xl border border-slate-200 p-2">
              {NAV.map((n) => (
<<<<<<< HEAD
                <Link key={n.href} href={n.href} className="block rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-brand-50">
                  {n.label}
                </Link>
              ))}
              <div className="mt-2 px-2 pb-2">
                <Link href="/contacto" className="block w-full rounded-xl bg-brand-600 px-4 py-3 text-center text-sm font-semibold text-white">
=======
                <Link
                  key={n.href}
                  href={n.href}
                  onClick={() => {
                    setOpen(false);
                    setPanelOpen(false);
                  }}
                  className="block rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-brand-50"
                >
                  {n.label}
                </Link>
              ))}

              {loggedIn ? (
                <>
                  <Link
                    href="/panel/cotizaciones"
                    onClick={() => setOpen(false)}
                    className="mt-1 block rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-brand-50"
                  >
                    Cotizaciones
                  </Link>
                  <Link
                    href="/panel/tickets"
                    onClick={() => setOpen(false)}
                    className="block rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-brand-50"
                  >
                    Tickets
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="block w-full rounded-xl px-4 py-3 text-left text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="mt-1 block rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-brand-50"
                >
                  Iniciar sesión
                </Link>
              )}

              <div className="mt-2 px-2 pb-2">
                <Link
                  href="/contacto"
                  onClick={() => setOpen(false)}
                  className="block w-full rounded-xl bg-brand-600 px-4 py-3 text-center text-sm font-semibold text-white"
                >
>>>>>>> 79ae6ec (Update version)
                  Solicitar consultoría gratuita
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
