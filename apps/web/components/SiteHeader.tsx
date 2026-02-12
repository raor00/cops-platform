"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Glass } from "glass-refraction";
import { getCotizacionesClientUrl } from "../lib/moduleLinks";
import {
  MASTER_ROLE_COOKIE,
  MASTER_SESSION_COOKIE,
  MASTER_SESSION_VALUE,
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
  const [scrolled, setScrolled] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  const [open, setOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const lastScrollRef = useRef(0);

  const loggedIn = hasSession();
  const role = readCookie(MASTER_ROLE_COOKIE);

  const canSeeTickets = role === "admin" || role === "tickets";
  const canSeeCotizaciones = role === "admin" || role === "cotizaciones";
  const canSeeAdministracion = role === "admin";
  const cotizacionesHref = getCotizacionesClientUrl();

  const privateNav = [
    { href: "/panel", label: "Portal", enabled: true },
    { href: "/panel/tickets", label: "Tickets", enabled: canSeeTickets },
    { href: cotizacionesHref, label: "Cotizacion", enabled: canSeeCotizaciones },
    { href: "/panel/administracion", label: "Administracion", enabled: canSeeAdministracion },
  ].filter((item) => item.enabled);

  const isPanelRoute = pathname.startsWith("/panel");
  const navItems = loggedIn && isPanelRoute ? privateNav : PUBLIC_NAV;
  const activeNavHref = useMemo(() => {
    if (!loggedIn || !isPanelRoute) return pathname;

    if (
      pathname.startsWith("/panel/administracion") ||
      pathname.startsWith("/panel/perfiles") ||
      pathname.startsWith("/panel/autorizacion")
    ) {
      return "/panel/administracion";
    }

    if (pathname.startsWith("/panel/tickets") || pathname.startsWith("/panel/soporte")) {
      return "/panel/tickets";
    }

    if (pathname.startsWith("/panel/cotizaciones")) {
      return cotizacionesHref;
    }

    return "/panel";
  }, [cotizacionesHref, isPanelRoute, loggedIn, pathname]);

  const navContainerRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());
  const [pillRect, setPillRect] = useState<Rect | null>(null);
  const [isNavHovering, setIsNavHovering] = useState(false);

  const setPillForHref = useCallback((href: string) => {
    if (!navContainerRef.current) return;
    const el = linkRefs.current.get(href);
    if (!el) {
      setPillRect(null);
      return;
    }
    setPillRect(measureLink(el, navContainerRef.current));
  }, []);

  useEffect(() => {
    setPillForHref(activeNavHref);
  }, [activeNavHref, setPillForHref]);

  const handleNavMouseLeave = useCallback(() => {
    setIsNavHovering(false);
    setPillForHref(activeNavHref);
  }, [activeNavHref, setPillForHref]);

  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY;
      const delta = currentY - lastScrollRef.current;
      setScrolled(currentY > 16);

      if (currentY < 24) {
        setHeaderVisible(true);
      } else if (delta > 8 && !open && !panelOpen) {
        setHeaderVisible(false);
      } else if (delta < -8) {
        setHeaderVisible(true);
      }

      lastScrollRef.current = currentY;
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [open, panelOpen]);

  useEffect(() => {
    if (open || panelOpen) {
      setHeaderVisible(true);
    }
  }, [open, panelOpen]);

  const handleLogout = () => {
    setOpen(false);
    setPanelOpen(false);
    window.location.assign("/logout");
  };

  const showPill = pillRect !== null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 flex justify-center px-4 py-3 transition-transform duration-300 md:py-4 ${
        headerVisible ? "translate-y-0" : "-translate-y-[130%]"
      }`}
    >
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
          style={{
            background:
              "linear-gradient(90deg, transparent 5%, rgba(255,255,255,0.22) 20%, rgba(220,235,255,0.28) 50%, rgba(255,255,255,0.22) 80%, transparent 95%)",
          }}
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
                opacity: showPill ? (panelOpen || isPanelRoute ? 0 : isNavHovering ? 1 : 0.72) : 0,
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
                prefetch={false}
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
                  activeNavHref === n.href
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
                  <div className="capsule-dropdown absolute right-0 z-30 mt-3 w-56 p-1.5">
                    {canSeeAdministracion && (
                      <>
                        <Link href="/panel/perfiles" onClick={() => setPanelOpen(false)} className="panel-menu-item">Perfiles</Link>
                        <Link href="/panel/autorizacion" onClick={() => setPanelOpen(false)} className="panel-menu-item">Autorizacion</Link>
                      </>
                    )}
                    <button type="button" onClick={handleLogout} className="panel-menu-item panel-menu-item-danger text-left">Cerrar sesion</button>
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

        {(open || panelOpen) && (
          <button
            type="button"
            aria-label="Cerrar menu"
            onClick={() => {
              setOpen(false);
              setPanelOpen(false);
            }}
            className="fixed inset-0 z-[5] bg-[#081938]/48 backdrop-blur-[2px] md:hidden"
          />
        )}

        {open && (
          <div className="capsule-mobile-menu pointer-events-auto md:hidden">
            <div className="px-4 py-3">
              <div className="space-y-0.5">
                {navItems.map((n) => (
                  <Link key={n.href} href={n.href} prefetch={false} onClick={() => { setOpen(false); setPanelOpen(false); }} className="mobile-nav-item">{n.label}</Link>
                ))}
              </div>
              {!loggedIn && (
                <div className="mt-2 space-y-1.5 border-t border-white/[0.08] pt-3">
                  <Link href="/login" onClick={() => setOpen(false)} className="mobile-nav-item">Iniciar sesion</Link>
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
                  <Link href="/panel/perfiles" onClick={() => setPanelOpen(false)} className="panel-menu-item">Perfiles</Link>
                  <Link href="/panel/autorizacion" onClick={() => setPanelOpen(false)} className="panel-menu-item">Autorizacion</Link>
                </>
              )}
              <button type="button" onClick={handleLogout} className="panel-menu-item panel-menu-item-danger text-left">Cerrar sesion</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
