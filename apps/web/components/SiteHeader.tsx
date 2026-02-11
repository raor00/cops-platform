"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Glass } from "glass-refraction";
import {
  MASTER_ROLE_COOKIE,
  MASTER_SESSION_COOKIE,
  MASTER_SESSION_VALUE,
  MASTER_USER_COOKIE,
} from "../lib/masterAuth";

const PUBLIC_NAV = [
  { href: "/soluciones", label: "Soluciones" },
  { href: "/proyectos", label: "Proyectos" },
  { href: "/partners", label: "Partners" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/contacto", label: "Contacto" },
];

function readCookie(name: string) {
  if (typeof document === "undefined") return "";
  const entry = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(`${name}=`));
  return entry?.split("=")[1] ?? "";
}

function hasSession() {
  return readCookie(MASTER_SESSION_COOKIE) === MASTER_SESSION_VALUE;
}

type Rect = { left: number; width: number; top: number; height: number };

function measureLink(el: HTMLElement, container: HTMLElement): Rect {
  const cr = container.getBoundingClientRect();
  const lr = el.getBoundingClientRect();
  return {
    left: lr.left - cr.left,
    width: lr.width,
    top: lr.top - cr.top,
    height: lr.height,
  };
}

export default function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);

  const loggedIn = hasSession();
  const role = readCookie(MASTER_ROLE_COOKIE);

  const canSeeTickets = role === "admin" || role === "tickets";
  const canSeeCotizaciones = role === "admin" || role === "cotizaciones";
  const canSeeAdministracion = role === "admin";

  const privateNav = [
    { href: "/panel", label: "Portal", enabled: true },
    { href: "/panel/tickets", label: "Tickets", enabled: canSeeTickets },
    { href: "/panel/cotizaciones", label: "Cotizacion", enabled: canSeeCotizaciones },
    { href: "/panel/administracion", label: "Administracion", enabled: canSeeAdministracion },
  ].filter((item) => item.enabled);

  const isPanelRoute = pathname.startsWith("/panel");
  const navItems = loggedIn && isPanelRoute ? privateNav : PUBLIC_NAV;

  const navContainerRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());
  const [pillRect, setPillRect] = useState<Rect | null>(null);
  const [isNavHovering, setIsNavHovering] = useState(false);

  const setPillForHref = useCallback((href: string) => {
    if (!navContainerRef.current) return;
    const el = linkRefs.current.get(href);
    if (!el) return;
    setPillRect(measureLink(el, navContainerRef.current));
  }, []);

  useEffect(() => {
    setPillForHref(pathname);
  }, [pathname, navItems, setPillForHref]);

  const handleNavMouseLeave = useCallback(() => {
    setIsNavHovering(false);
    setPillForHref(pathname);
  }, [pathname, setPillForHref]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => {
    document.cookie = `${MASTER_SESSION_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
    document.cookie = `${MASTER_ROLE_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
    document.cookie = `${MASTER_USER_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
    setPanelOpen(false);
    router.push("/");
  };

  const showPill = pillRect !== null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none px-4 py-3 md:py-4">
      <div
        className={`capsule-header pointer-events-auto relative w-full max-w-5xl transition-all duration-500 ease-[cubic-bezier(.16,1,.3,1)] ${
          scrolled ? "capsule-header--scrolled" : ""
        }`}
      >
        <Glass
          variant="glass"
          className="!absolute !inset-0 !rounded-[inherit]"
          style={{ borderRadius: "inherit" } as React.CSSProperties}
        />

        <div
          className="pointer-events-none absolute inset-0 z-[1] overflow-hidden rounded-[inherit]"
          style={{
            background:
              "radial-gradient(circle at 18% 20%, rgba(190,222,255,0.12), transparent 42%), radial-gradient(circle at 82% 0%, rgba(154,194,255,0.08), transparent 46%)",
          }}
        />

        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-[1px] rounded-[inherit]"
          style={{ background: "linear-gradient(90deg, transparent 5%, rgba(255,255,255,0.22) 20%, rgba(220,235,255,0.28) 50%, rgba(255,255,255,0.22) 80%, transparent 95%)" }}
        />

        <nav className="relative z-10 flex items-center justify-between px-5 py-3 md:px-6">
          <Link
            href={loggedIn ? "/panel" : "/"}
            className="text-[15px] font-bold tracking-tight text-white/95 transition-colors hover:text-white sm:text-base"
          >
            COP&apos;S Electronics
          </Link>

          <div
            ref={navContainerRef}
            className="hidden items-center gap-0.5 md:flex relative"
            onMouseLeave={handleNavMouseLeave}
          >
            <div
              className="nav-glass-indicator absolute z-0 pointer-events-none"
              style={{
                left: pillRect?.left ?? 0,
                top: pillRect?.top ?? 0,
                width: pillRect?.width ?? 0,
                height: pillRect?.height ?? 0,
                opacity: showPill ? (isNavHovering ? 1 : 0.72) : 0,
                transition: [
                  "left 0.24s cubic-bezier(.22,1,.36,1)",
                  "width 0.24s cubic-bezier(.22,1,.36,1)",
                  "top 0.24s cubic-bezier(.22,1,.36,1)",
                  "height 0.24s cubic-bezier(.22,1,.36,1)",
                  "opacity 0.2s ease",
                ].join(", "),
              }}
            />

            {navItems.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                ref={(el) => {
                  if (el) linkRefs.current.set(n.href, el);
                }}
                onMouseEnter={() => {
                  setIsNavHovering(true);
                  setPillForHref(n.href);
                }}
                onFocus={() => {
                  setIsNavHovering(true);
                  setPillForHref(n.href);
                }}
                onClick={() => {
                  setOpen(false);
                  setPanelOpen(false);
                }}
                className={`relative z-10 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors duration-150 ${
                  pathname === n.href
                    ? "text-white"
                    : "text-white/70 hover:text-white"
                }`}
              >
                {n.label}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-2 md:flex">
            {!loggedIn && (
              <>
                <Link
                  href="/contacto"
                  onClick={() => {
                    setOpen(false);
                    setPanelOpen(false);
                  }}
                  className="capsule-btn-primary"
                >
                  Solicitar asesoria
                </Link>
                <Link
                  href="/login"
                  onClick={() => {
                    setOpen(false);
                    setPanelOpen(false);
                  }}
                  className="capsule-btn"
                >
                  Iniciar sesion
                </Link>
              </>
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
                  <div className="capsule-dropdown absolute right-0 mt-3 w-56 p-1.5">
                    {canSeeAdministracion && (
                      <>
                        <Link href="/panel/perfiles" onClick={() => setPanelOpen(false)} className="block rounded-xl px-3 py-2 text-sm font-semibold text-white/90 hover:bg-white/[0.1] hover:text-white">Perfiles</Link>
                        <Link href="/panel/autorizacion" onClick={() => setPanelOpen(false)} className="block rounded-xl px-3 py-2 text-sm font-semibold text-white/90 hover:bg-white/[0.1] hover:text-white">Autorizacion</Link>
                      </>
                    )}
                    <button type="button" onClick={handleLogout} className="mt-1 block w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-red-200 hover:bg-red-500/15">Cerrar sesion</button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 md:hidden">
            {loggedIn && (
              <button
                type="button"
                onClick={() => {
                  setPanelOpen((v) => !v);
                  setOpen(false);
                }}
                className="capsule-btn text-xs !px-3 !py-1.5"
              >
                Panel
              </button>
            )}
            <button type="button" aria-label="Abrir menu" onClick={() => { setOpen((v) => !v); setPanelOpen(false); }} className="capsule-btn text-xs !px-3 !py-1.5">
              {open ? "Cerrar" : "Menu"}
            </button>
          </div>
        </nav>

        {open && (
          <div className="capsule-mobile-menu pointer-events-auto md:hidden">
            <div className="px-4 py-3">
              <div className="space-y-0.5">
                {navItems.map((n) => (
                  <Link key={n.href} href={n.href} onClick={() => { setOpen(false); setPanelOpen(false); }} className="block rounded-xl px-4 py-2.5 text-sm font-semibold text-white/85 hover:bg-white/[0.1] hover:text-white">{n.label}</Link>
                ))}
              </div>
              {!loggedIn && (
                <div className="mt-2 space-y-1.5 border-t border-white/[0.08] pt-3">
                  <Link href="/login" onClick={() => setOpen(false)} className="block rounded-xl px-4 py-2.5 text-sm font-semibold text-white/85 hover:bg-white/[0.1] hover:text-white">Iniciar sesion</Link>
                  <Link href="/contacto" onClick={() => setOpen(false)} className="capsule-btn-primary mt-1 block w-full text-center">Solicitar consultoria gratuita</Link>
                </div>
              )}
            </div>
          </div>
        )}

        {panelOpen && (
          <div className="capsule-mobile-menu pointer-events-auto md:hidden">
            <div className="px-4 py-3 space-y-0.5">
              {canSeeAdministracion && (
                <>
                  <Link href="/panel/perfiles" onClick={() => setPanelOpen(false)} className="block rounded-xl px-4 py-2.5 text-sm font-semibold text-white/85 hover:bg-white/[0.1] hover:text-white">Perfiles</Link>
                  <Link href="/panel/autorizacion" onClick={() => setPanelOpen(false)} className="block rounded-xl px-4 py-2.5 text-sm font-semibold text-white/85 hover:bg-white/[0.1] hover:text-white">Autorizacion</Link>
                </>
              )}
              <button type="button" onClick={handleLogout} className="block w-full rounded-xl px-4 py-2.5 text-left text-sm font-semibold text-red-200 hover:bg-red-500/15">Cerrar sesion</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


