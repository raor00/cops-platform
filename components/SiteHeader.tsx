"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
const pathname = usePathname();
const isHome = pathname === "/";



const NAV = [
  { href: "/soluciones", label: "Soluciones" },
  { href: "/proyectos", label: "Proyectos" },
  { href: "/partners", label: "Partners" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/contacto", label: "Contacto" },
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-3">
  <img
    src="/branding/logo.png"
    alt="COP'S Electronics"
    className="h-8 w-auto"
  />
 <span
  className={`font-semibold tracking-tight ${
    isHome ? "text-white" : "text-slate-900"
  }`}
>
  COP’S Electronics
</span>

</Link>

        <nav className="hidden gap-6 text-sm md:flex">

        <div className="flex items-center gap-3">
          <Link
            href="/contacto"
            className="hidden rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:opacity-90 md:inline-flex"
          >
            Solicitar diagnóstico
          </Link>

          {/* Mobile button */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex rounded-xl border px-3 py-2 text-sm md:hidden"
            aria-label="Abrir menú"
          >
            {open ? "Cerrar" : "Menú"}
          </button>
        </div>
        </nav>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t bg-white md:hidden">
          <div className="mx-auto max-w-6xl px-4 py-3">
            <nav className="flex flex-col gap-3 text-sm">
              {NAV.map((i) => (
                <Link
                  key={i.href}
                  href={i.href}
                  className="rounded-xl px-3 py-2 hover:bg-slate-50"
                  onClick={() => setOpen(false)}
                >
                  {i.label}
                </Link>
              ))}

              <Link
                href="/contacto"
                className="mt-2 rounded-xl bg-slate-900 px-3 py-2 text-center text-sm font-medium text-white"
                onClick={() => setOpen(false)}
              >
                Solicitar diagnóstico
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
