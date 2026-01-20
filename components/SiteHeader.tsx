"use client";

import Link from "next/link";
import { useState } from "react";
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
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <header
      className={`sticky top-0 z-50 border-b backdrop-blur ${
        isHome ? "border-white/10 bg-transparent" : "border-slate-200 bg-white/80"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Marca */}
        <Link href="/" className="flex items-center gap-3">
          <img
            src="/branding/logo.png"
            alt="COP’S Electronics"
            className="h-8 w-auto"
          />
          <div className="flex flex-col leading-tight">
            <span className={`font-semibold tracking-tight ${isHome ? "text-white" : "text-slate-900"}`}>
              COP’S Electronics
            </span>
            <span className={`text-xs ${isHome ? "text-white/70" : "text-slate-600"}`}>
              28 años de trayectoria
            </span>
          </div>
        </Link>

        {/* Menú desktop */}
        <nav className="hidden items-center gap-6 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-semibold hover:underline ${
                isHome ? "text-white/90" : "text-slate-700"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Botón móvil */}
        <button
          type="button"
          aria-label="Abrir menú"
          className={`inline-flex items-center justify-center rounded-xl border px-3 py-2 text-sm font-semibold md:hidden ${
            isHome ? "border-white/20 text-white" : "border-slate-200 text-slate-800"
          }`}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Cerrar" : "Menú"}
        </button>
      </div>

      {/* Menú desplegable móvil */}
      {open && (
        <div className={`${isHome ? "bg-slate-950/95" : "bg-white"} md:hidden`}>
          <div className="mx-auto max-w-6xl px-4 pb-4">
            <div className={`mt-2 rounded-2xl border p-2 ${isHome ? "border-white/10" : "border-slate-200"}`}>
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`block rounded-xl px-4 py-3 text-sm font-semibold ${
                    isHome ? "text-white hover:bg-white/10" : "text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
