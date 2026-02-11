"use client";

import Link from "next/link";
<<<<<<< HEAD
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
=======
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Glass } from "glass-refraction";
>>>>>>> d767d44c790a81da87a628ee26c740ecfe1fdfc4
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

export default function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
<<<<<<< HEAD
  const isHome = pathname === "/";
=======
>>>>>>> d767d44c790a81da87a628ee26c740ecfe1fdfc4
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const loggedIn = hasSession();
<<<<<<< HEAD
  const onDark = isHome && !scrolled;
=======

  const headerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!headerRef.current) return;
    const rect = headerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, []);
>>>>>>> d767d44c790a81da87a628ee26c740ecfe1fdfc4

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => {
    document.cookie = `${MASTER_SESSION_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
    setPanelOpen(false);
    router.push("/");
  };
<<<<<<< HEAD

  const glass = scrolled
    ? "bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,.04)]"
    : isHome
      ? "bg-slate-500/90 backdrop-blur-md border-b border-white/10"
      : "bg-white border-b border-slate-200";

  const linkCls = isHome && !scrolled
    ? "text-white/90 hover:text-white"
    : "text-slate-700 hover:text-brand-700";

  const logoCls = isHome && !scrolled ? "text-white" : "text-brand-900";

  return (
<<<<<<< Updated upstream
    <header className={`sticky top-0 z-50 transition-all duration-300 ${glass}`}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5">
        <Link href="/" className={`text-base font-bold tracking-tight sm:text-lg transition-colors ${logoCls}`}>
          COP&apos;S Electronics
        </Link>
=======
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none px-4 py-3 md:py-4">
=======

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none px-4 pt-4 md:pt-5">
>>>>>>> d767d44c790a81da87a628ee26c740ecfe1fdfc4
      <div
        ref={headerRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        className={`capsule-header pointer-events-auto relative w-full max-w-5xl transition-all duration-500 ease-[cubic-bezier(.16,1,.3,1)] ${
          scrolled ? "capsule-header--scrolled" : ""
        }`}
      >
        {/* Glass refraction layer */}
        <Glass
          variant="glass"
          className="!absolute !inset-0 !rounded-[inherit] !border-0"
          style={{ borderRadius: "inherit" } as React.CSSProperties}
        />
<<<<<<< HEAD
>>>>>>> Stashed changes

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
=======

        {/* Interactive liquid glass spotlight — follows cursor */}
        <div
          className="pointer-events-none absolute inset-0 z-[1] overflow-hidden rounded-[inherit] transition-opacity duration-500"
          style={{ opacity: isHovering ? 1 : 0 }}
        >
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              left: mousePos.x,
              top: mousePos.y,
              width: 300,
              height: 300,
              background:
                "radial-gradient(circle, rgba(107,147,247,0.18) 0%, rgba(47,84,224,0.08) 35%, rgba(120,80,255,0.04) 55%, transparent 70%)",
              filter: "blur(1px)",
              transition: "left 0.12s ease-out, top 0.12s ease-out",
            }}
          />
          {/* Secondary warm highlight for chromatic feel */}
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              left: mousePos.x + 40,
              top: mousePos.y - 20,
              width: 160,
              height: 160,
              background:
                "radial-gradient(circle, rgba(200,160,255,0.08) 0%, transparent 65%)",
              filter: "blur(6px)",
              transition: "left 0.18s ease-out, top 0.18s ease-out",
            }}
          />
        </div>

        {/* Specular edge highlight on top */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-[1px] rounded-[inherit]"
          style={{
            background:
              "linear-gradient(90deg, transparent 5%, rgba(255,255,255,0.12) 20%, rgba(200,220,255,0.18) 50%, rgba(255,255,255,0.12) 80%, transparent 95%)",
          }}
        />

        {/* Content */}
        <nav className="relative z-10 flex items-center justify-between px-5 py-3 md:px-6">
          <Link
            href="/"
            className="text-[15px] font-bold tracking-tight text-white/90 transition-colors hover:text-white sm:text-base"
>>>>>>> d767d44c790a81da87a628ee26c740ecfe1fdfc4
          >
            COP&apos;S Electronics
          </Link>

<<<<<<< HEAD
          {!loggedIn && (
            <Link
              href="/login"
=======
          <div className="hidden items-center gap-0.5 md:flex">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => {
                  setOpen(false);
                  setPanelOpen(false);
                }}
                className={`rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-all duration-200 ${
                  pathname === n.href
                    ? "bg-white/[0.1] text-white"
                    : "text-white/60 hover:text-white/90 hover:bg-white/[0.06]"
                }`}
              >
                {n.label}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <Link
              href="/contacto"
>>>>>>> d767d44c790a81da87a628ee26c740ecfe1fdfc4
              onClick={() => {
                setOpen(false);
                setPanelOpen(false);
              }}
<<<<<<< HEAD
              className={`ml-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                onDark
                  ? "text-white/80 hover:bg-white/10 hover:text-white"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              }`}
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
            Asesoría
          </Link>
          <button
            type="button"
            aria-label="Abrir menú"
            onClick={() => setOpen((v) => !v)}
            className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
              isHome && !scrolled
                ? "border-white/30 bg-white/10 text-white"
                : "border-slate-300 bg-white text-slate-900"
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
                  Solicitar consultoría gratuita
                </Link>
=======
              className="capsule-btn-primary"
            >
              Solicitar asesoría
            </Link>

            {!loggedIn && (
              <Link
                href="/login"
                onClick={() => {
                  setOpen(false);
                  setPanelOpen(false);
                }}
                className="capsule-btn"
              >
                Iniciar sesión
              </Link>
            )}

            {loggedIn && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setPanelOpen((v) => !v)}
                  className="capsule-btn"
                >
                  Panel
                </button>

                {panelOpen && (
                  <div className="capsule-dropdown absolute right-0 mt-3 w-52 p-1.5">
                    <Link
                      href="/panel/cotizaciones"
                      onClick={() => setPanelOpen(false)}
                      className="block rounded-xl px-3 py-2 text-sm font-semibold text-white/80 hover:bg-white/[0.06] hover:text-white"
                    >
                      Cotizaciones
                    </Link>
                    <Link
                      href="/panel/tickets"
                      onClick={() => setPanelOpen(false)}
                      className="block rounded-xl px-3 py-2 text-sm font-semibold text-white/80 hover:bg-white/[0.06] hover:text-white"
                    >
                      Tickets
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="mt-1 block w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-red-400 hover:bg-red-500/10"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile controls */}
          <div className="flex items-center gap-2 md:hidden">
            <Link href="/contacto" className="capsule-btn-primary text-xs !px-3 !py-1.5">
              Asesoría
            </Link>
            <button
              type="button"
              aria-label="Abrir menú"
              onClick={() => setOpen((v) => !v)}
              className="capsule-btn text-xs !px-3 !py-1.5"
            >
              {open ? "Cerrar" : "Menú"}
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        {open && (
          <div className="relative z-10 border-t border-white/[0.06] md:hidden">
            <div className="px-4 pb-4 pt-2">
              <div className="space-y-0.5">
                {NAV.map((n) => (
                  <Link
                    key={n.href}
                    href={n.href}
                    onClick={() => {
                      setOpen(false);
                      setPanelOpen(false);
                    }}
                    className="block rounded-xl px-4 py-2.5 text-sm font-semibold text-white/75 hover:bg-white/[0.06] hover:text-white"
                  >
                    {n.label}
                  </Link>
                ))}

                {loggedIn ? (
                  <>
                    <Link
                      href="/panel/cotizaciones"
                      onClick={() => setOpen(false)}
                      className="block rounded-xl px-4 py-2.5 text-sm font-semibold text-white/75 hover:bg-white/[0.06] hover:text-white"
                    >
                      Cotizaciones
                    </Link>
                    <Link
                      href="/panel/tickets"
                      onClick={() => setOpen(false)}
                      className="block rounded-xl px-4 py-2.5 text-sm font-semibold text-white/75 hover:bg-white/[0.06] hover:text-white"
                    >
                      Tickets
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="block w-full rounded-xl px-4 py-2.5 text-left text-sm font-semibold text-red-400 hover:bg-red-500/10"
                    >
                      Cerrar sesión
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="block rounded-xl px-4 py-2.5 text-sm font-semibold text-white/75 hover:bg-white/[0.06] hover:text-white"
                  >
                    Iniciar sesión
                  </Link>
                )}

                <div className="pt-2">
                  <Link
                    href="/contacto"
                    onClick={() => setOpen(false)}
                    className="capsule-btn-primary block w-full text-center"
                  >
                    Solicitar consultoría gratuita
                  </Link>
                </div>
>>>>>>> d767d44c790a81da87a628ee26c740ecfe1fdfc4
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
