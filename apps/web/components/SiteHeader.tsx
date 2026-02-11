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

  const headerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  /* ── Sliding glass pill ── */
  const navContainerRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());
  const [pillRect, setPillRect] = useState<Rect | null>(null);
  const [isNavHovering, setIsNavHovering] = useState(false);
  const rafRef = useRef<number>(0);

  // Measure active link on route change
  useEffect(() => {
    if (!navContainerRef.current) return;
    const activeEl = linkRefs.current.get(pathname);
    if (activeEl) {
      setPillRect(measureLink(activeEl, navContainerRef.current));
    } else {
      setPillRect(null);
    }
  }, [pathname, navItems]);

  // Track mouse over nav links — find the link under cursor
  const handleNavMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!navContainerRef.current) return;
    const containerRect = navContainerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - containerRect.left;

    // Find which link the mouse is closest to (horizontally centered)
    let closestHref: string | null = null;
    let closestDist = Infinity;

    linkRefs.current.forEach((el, href) => {
      const lr = el.getBoundingClientRect();
      const linkCenterX = lr.left - containerRect.left + lr.width / 2;
      const dist = Math.abs(mouseX - linkCenterX);
      if (dist < closestDist) {
        closestDist = dist;
        closestHref = href;
      }
    });

    if (closestHref) {
      const el = linkRefs.current.get(closestHref);
      if (el) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => {
          if (navContainerRef.current) {
            setPillRect(measureLink(el, navContainerRef.current));
          }
        });
      }
    }

    if (!isNavHovering) setIsNavHovering(true);
  }, [isNavHovering]);

  const handleNavMouseLeave = useCallback(() => {
    setIsNavHovering(false);
    cancelAnimationFrame(rafRef.current);
    // Snap back to active page
    if (navContainerRef.current) {
      const activeEl = linkRefs.current.get(pathname);
      if (activeEl) {
        setPillRect(measureLink(activeEl, navContainerRef.current));
      } else {
        setPillRect(null);
      }
    }
  }, [pathname]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!headerRef.current) return;
    const rect = headerRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

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
        ref={headerRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        className={`capsule-header pointer-events-auto relative w-full max-w-5xl transition-all duration-500 ease-[cubic-bezier(.16,1,.3,1)] ${
          scrolled ? "capsule-header--scrolled" : ""
        }`}
      >
        <Glass
          variant="glass"
          className="!absolute !inset-0 !rounded-[inherit] !border-0"
          style={{ borderRadius: "inherit" } as React.CSSProperties}
        />

        {/* Cursor spotlight */}
        <div
          className="pointer-events-none absolute inset-0 z-[1] overflow-hidden rounded-[inherit] transition-opacity duration-500"
          style={{ opacity: isHovering ? 1 : 0 }}
        >
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              left: mousePos.x, top: mousePos.y,
              width: 300, height: 300,
              background: "radial-gradient(circle, rgba(107,147,247,0.18) 0%, rgba(47,84,224,0.08) 35%, rgba(120,80,255,0.04) 55%, transparent 70%)",
              filter: "blur(1px)",
              transition: "left 0.12s ease-out, top 0.12s ease-out",
            }}
          />
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              left: mousePos.x + 40, top: mousePos.y - 20,
              width: 160, height: 160,
              background: "radial-gradient(circle, rgba(200,160,255,0.08) 0%, transparent 65%)",
              filter: "blur(6px)",
              transition: "left 0.18s ease-out, top 0.18s ease-out",
            }}
          />
        </div>

        {/* Specular top edge */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-[1px] rounded-[inherit]"
          style={{ background: "linear-gradient(90deg, transparent 5%, rgba(255,255,255,0.12) 20%, rgba(200,220,255,0.18) 50%, rgba(255,255,255,0.12) 80%, transparent 95%)" }}
        />

        {/* Content */}
        <nav className="relative z-10 flex items-center justify-between px-5 py-3 md:px-6">
          <Link
            href={loggedIn ? "/panel" : "/"}
            className="text-[15px] font-bold tracking-tight text-white/90 transition-colors hover:text-white sm:text-base"
          >
            COP&apos;S Electronics
          </Link>

          {/* Nav links with sliding glass pill */}
          <div
            ref={navContainerRef}
            className="hidden items-center gap-0.5 md:flex relative"
            onMouseMove={handleNavMouseMove}
            onMouseLeave={handleNavMouseLeave}
          >
            {/* Glass pill indicator */}
            <div
              className="nav-glass-indicator absolute z-0 pointer-events-none"
              style={{
                left: pillRect?.left ?? 0,
                top: pillRect?.top ?? 0,
                width: pillRect?.width ?? 0,
                height: pillRect?.height ?? 0,
                opacity: showPill ? (isNavHovering ? 1 : 0.6) : 0,
                transition: [
                  "left 0.4s cubic-bezier(.22,1,.36,1)",
                  "width 0.35s cubic-bezier(.22,1,.36,1)",
                  "top 0.4s cubic-bezier(.22,1,.36,1)",
                  "height 0.35s cubic-bezier(.22,1,.36,1)",
                  "opacity 0.3s ease",
                ].join(", "),
              }}
            />

            {navItems.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                ref={(el) => { if (el) linkRefs.current.set(n.href, el); }}
                onClick={() => { setOpen(false); setPanelOpen(false); }}
                className={`relative z-10 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors duration-200 ${
                  pathname === n.href
                    ? "text-white"
                    : "text-white/60 hover:text-white/90"
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
                  onClick={() => { setOpen(false); setPanelOpen(false); }}
                  className="capsule-btn-primary"
                >
                  Solicitar asesoria
                </Link>
                <Link
                  href="/login"
                  onClick={() => { setOpen(false); setPanelOpen(false); }}
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
                        <Link href="/panel/perfiles" onClick={() => setPanelOpen(false)} className="block rounded-xl px-3 py-2 text-sm font-semibold text-white/80 hover:bg-white/[0.06] hover:text-white">Perfiles</Link>
                        <Link href="/panel/autorizacion" onClick={() => setPanelOpen(false)} className="block rounded-xl px-3 py-2 text-sm font-semibold text-white/80 hover:bg-white/[0.06] hover:text-white">Autorizacion</Link>
                      </>
                    )}
                    <button type="button" onClick={handleLogout} className="mt-1 block w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-red-400 hover:bg-red-500/10">Cerrar sesion</button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <div className="flex items-center gap-2 md:hidden">
            {loggedIn && (
              <button
                type="button"
                onClick={() => { setPanelOpen((v) => !v); setOpen(false); }}
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

        {/* Mobile nav menu — rendered OUTSIDE the capsule as a dropdown */}
        {open && (
          <div className="capsule-mobile-menu pointer-events-auto md:hidden">
            <div className="px-4 py-3">
              <div className="space-y-0.5">
                {navItems.map((n) => (
                  <Link key={n.href} href={n.href} onClick={() => { setOpen(false); setPanelOpen(false); }} className="block rounded-xl px-4 py-2.5 text-sm font-semibold text-white/75 hover:bg-white/[0.06] hover:text-white">{n.label}</Link>
                ))}
              </div>
              {!loggedIn && (
                <div className="mt-2 space-y-1.5 border-t border-white/[0.06] pt-3">
                  <Link href="/login" onClick={() => setOpen(false)} className="block rounded-xl px-4 py-2.5 text-sm font-semibold text-white/75 hover:bg-white/[0.06] hover:text-white">Iniciar sesion</Link>
                  <Link href="/contacto" onClick={() => setOpen(false)} className="capsule-btn-primary mt-1 block w-full text-center">Solicitar consultoria gratuita</Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mobile panel dropdown (logged-in) */}
        {panelOpen && (
          <div className="capsule-mobile-menu pointer-events-auto md:hidden">
            <div className="px-4 py-3 space-y-0.5">
              {canSeeAdministracion && (
                <>
                  <Link href="/panel/perfiles" onClick={() => setPanelOpen(false)} className="block rounded-xl px-4 py-2.5 text-sm font-semibold text-white/75 hover:bg-white/[0.06] hover:text-white">Perfiles</Link>
                  <Link href="/panel/autorizacion" onClick={() => setPanelOpen(false)} className="block rounded-xl px-4 py-2.5 text-sm font-semibold text-white/75 hover:bg-white/[0.06] hover:text-white">Autorizacion</Link>
                </>
              )}
              <button type="button" onClick={handleLogout} className="block w-full rounded-xl px-4 py-2.5 text-left text-sm font-semibold text-red-400 hover:bg-red-500/10">Cerrar sesion</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

