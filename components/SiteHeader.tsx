"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/soluciones", label: "Soluciones" },
  { href: "/proyectos", label: "Proyectos" },
  { href: "/partners", label: "Partners" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/contacto", label: "Contacto" },
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isHome = !pathname || pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Cierra el menú si cambias de ruta
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const headerBase =
    "sticky top-0 z-50 border-b transition-colors duration-200 backdrop-blur";
     const headerNotHome = "border-slate-200 bg-white/85";
  const headerHomeTop = "border-white/10 bg-transparent";
  const headerHomeScrolled = "border-white/10 bg-slate-950/70";
  const headerInner = "mx-auto max-w-6xl px-4";

  const headerClass = isHome
    ? `${headerBase} ${scrolled ? headerHomeScrolled : headerHomeTop}`
    : `${headerBase} ${headerNotHome}`;

  const textPrimary = isHome ? "text-white" : "text-slate-900";
  const textSecondary = isHome ? "text-white/70" : "text-slate-900";
  const linkColor = isHome ? "text-white/90" : "text-slate-700";

  return (
    <header className={headerClass}>
      <div className={`${headerInner} flex items-center justify-between py-3`}>
        {/* Marca */}
        <Link href="/" className="flex items-center gap-3">
          <img
            src="/branding/cops.png"
            alt="COP’S Electronics"
            className="h-8 w-auto"
          />
          <div className="leading-tight">
            <div className={`font-semibold tracking-tight ${textPrimary}`}>
              COP’S Electronics
            </div>
            <div className={`text-xs ${textSecondary}`}>28 años de trayectoria</div>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-semibold hover:underline ${linkColor}`}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/contacto"
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            Solicitar consultoría
          </Link>
        </nav>

        {/* Mobile actions */}
        <div className="flex items-center gap-2 md:hidden">
          {/* CTA móvil (si lo quieres aquí arriba). Si lo prefieres SOLO dentro del menú, lo movemos. */}
          <Link
            href="/contacto"
            className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:opacity-90"
          >
            Solicitar
          </Link>

          {/* Botón menú */}
          <button
            type="button"
            aria-label="Abrir menú"
            className={`rounded-xl border px-3 py-2 text-xs font-semibold ${
              isHome ? "border-white/20 text-white" : "border-slate-200 text-slate-900"
            }`}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "Cerrar" : "Menú"}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className={isHome ? "bg-slate-950/95" : "bg-white"}>
          <div className={`${headerInner} pb-4`}>
            <div className={`mt-2 rounded-2xl border p-2 ${isHome ? "border-white/10" : "border-slate-200"}`}>
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-xl px-4 py-3 text-sm font-semibold ${
                    isHome ? "text-white hover:bg-white/10" : "text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  {item.label}
                </Link>
              ))}

              <div className="mt-2 px-2 pb-2">
                <Link
                  href="/contacto"
                  className="block w-full rounded-xl bg-slate-900 px-4 py-3 text-center text-sm font-semibold text-white hover:opacity-90"
                >
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
