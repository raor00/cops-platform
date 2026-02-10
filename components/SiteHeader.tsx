"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Glass } from "glass-refraction";
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
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const loggedIn = hasSession();

  const headerRef = useRef<HTMLElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (!headerRef.current) return;
    const rect = headerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, []);

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

  return (
    <Glass
      as="header"
      variant="glass"
      ref={headerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={`site-header sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "site-header--scrolled" : ""
      }`}
    >
      {/* Interactive liquid glass spotlight */}
      <div
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[inherit] transition-opacity duration-500"
        style={{ opacity: isHovering ? 1 : 0 }}
      >
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            left: mousePos.x,
            top: mousePos.y,
            width: 350,
            height: 350,
            background: "radial-gradient(circle, rgba(107,147,247,0.12) 0%, rgba(47,84,224,0.05) 40%, transparent 70%)",
            filter: "blur(2px)",
            transition: "left 0.15s ease-out, top 0.15s ease-out",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5">
        <Link href="/" className="text-base font-bold tracking-tight text-white sm:text-lg transition-colors hover:text-brand-300">
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
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-200 text-white/70 hover:text-white hover:bg-white/[0.06] ${
                pathname === n.href
                  ? "bg-white/[0.08] text-white"
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
            className="btn-glass-primary ml-3"
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
              className="btn-glass ml-2"
            >
              Iniciar sesión
            </Link>
          )}

          {loggedIn && (
            <div className="relative ml-2">
              <button
                type="button"
                onClick={() => setPanelOpen((v) => !v)}
                className="btn-glass"
              >
                Panel
              </button>

              {panelOpen && (
                <Glass variant="glass-card" className="absolute right-0 mt-2 w-52 p-1 shadow-xl shadow-black/30">
                  <Link
                    href="/panel/cotizaciones"
                    onClick={() => setPanelOpen(false)}
                    className="block rounded-lg px-3 py-2 text-sm font-semibold text-white/80 hover:bg-white/[0.06] hover:text-white"
                  >
                    Cotizaciones
                  </Link>
                  <Link
                    href="/panel/tickets"
                    onClick={() => setPanelOpen(false)}
                    className="block rounded-lg px-3 py-2 text-sm font-semibold text-white/80 hover:bg-white/[0.06] hover:text-white"
                  >
                    Tickets
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-1 block w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-red-400 hover:bg-red-500/10"
                  >
                    Cerrar sesión
                  </button>
                </Glass>
              )}
            </div>
          )}
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <Link href="/contacto" className="btn-glass-primary text-xs !px-3 !py-2">
            Asesoría
          </Link>
          <button
            type="button"
            aria-label="Abrir menú"
            onClick={() => setOpen((v) => !v)}
            className="btn-glass text-xs !px-3 !py-2"
          >
            {open ? "Cerrar" : "Menú"}
          </button>
        </div>
      </div>

      {open && (
        <Glass variant="glass-card" className="relative z-10 md:hidden">
          <div className="mx-auto max-w-6xl px-4 pb-4">
            <div className="rounded-2xl border border-white/[0.06] p-2">
              {NAV.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  onClick={() => {
                    setOpen(false);
                    setPanelOpen(false);
                  }}
                  className="block rounded-xl px-4 py-3 text-sm font-semibold text-white/80 hover:bg-white/[0.06] hover:text-white"
                >
                  {n.label}
                </Link>
              ))}

              {loggedIn ? (
                <>
                  <Link
                    href="/panel/cotizaciones"
                    onClick={() => setOpen(false)}
                    className="mt-1 block rounded-xl px-4 py-3 text-sm font-semibold text-white/80 hover:bg-white/[0.06] hover:text-white"
                  >
                    Cotizaciones
                  </Link>
                  <Link
                    href="/panel/tickets"
                    onClick={() => setOpen(false)}
                    className="block rounded-xl px-4 py-3 text-sm font-semibold text-white/80 hover:bg-white/[0.06] hover:text-white"
                  >
                    Tickets
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="block w-full rounded-xl px-4 py-3 text-left text-sm font-semibold text-red-400 hover:bg-red-500/10"
                  >
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="mt-1 block rounded-xl px-4 py-3 text-sm font-semibold text-white/80 hover:bg-white/[0.06] hover:text-white"
                >
                  Iniciar sesión
                </Link>
              )}

              <div className="mt-2 px-2 pb-2">
                <Link
                  href="/contacto"
                  onClick={() => setOpen(false)}
                  className="btn-glass-primary block w-full text-center"
                >
                  Solicitar consultoría gratuita
                </Link>
              </div>
            </div>
          </div>
        </Glass>
      )}
    </Glass>
  );
}
