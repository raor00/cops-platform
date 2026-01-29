"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Cierra el menú móvil al cambiar de página
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const headerClass = isHome
    ? scrolled
      ? "bg-slate-950/80 backdrop-blur border-b border-white/10"
      : "bg-slate-950/30 backdrop-blur border-b border-white/10"
    : "bg-white/90 backdrop-blur border-b border-slate-200";

  const linkClass = isHome
    ? "text-white/90 hover:text-white"
    : "text-slate-800 hover:text-slate-900";

  const mobileBtnClass = isHome
    ? "border-white/30 text-white bg-white/10"
    : "border-slate-300 text-slate-900 bg-white";

  return (
    <header className={`sticky top-0 z-50 transition-colors ${headerClass}`}>
      <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
        {/* Logo / Nombre */}
        <Link
  href="/"
  className={`font-semibold tracking-tight ${
    isHome ? "text-white" : "text-slate-900"
  } text-base sm:text-lg`}
>
  COP’S Electronics
</Link>


        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/soluciones" className={`text-sm font-semibold ${linkClass}`}>
            Soluciones
          </Link>
          <Link href="/proyectos" className={`text-sm font-semibold ${linkClass}`}>
            Proyectos
          </Link>
          <Link href="/partners" className={`text-sm font-semibold ${linkClass}`}>
            Partners
          </Link>
          <Link href="/nosotros" className={`text-sm font-semibold ${linkClass}`}>
            Nosotros
          </Link>
          <Link href="/contacto" className={`text-sm font-semibold ${linkClass}`}>
            Contacto
          </Link>

          <Link
            href="/contacto"
            className="ml-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            Solicitar asesoría
          </Link>

         <Link
  href="/login"
  className="hidden sm:inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
>
  Iniciar sesión
</Link>
 
        </nav>

     {/* Mobile actions (SIEMPRE visibles en móvil) */}
<div className="flex items-center gap-2 md:hidden">
  <Link
    href="/contacto"
    className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold tracking-tight text-white hover:opacity-90"
  >
    Asesoría
  </Link>

  <button
    type="button"
    aria-label="Abrir menú"
    onClick={() => setOpen((v) => !v)}
    className={`rounded-xl border px-3 py-2 text-xs font-semibold tracking-tight transition ${
  isHome
    ? "border-white/30 text-white bg-slate-900/70 hover:bg-slate-900"
    : "border-slate-300 text-slate-900 bg-white hover:bg-slate-50"
}`}

  >
    {open ? "Cerrar" : "Menú"}
  </button>
</div>


      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className={isHome ? "bg-slate-950/95" : "bg-white"}>
          <div className="mx-auto max-w-6xl px-4 pb-4">
            <div className={`rounded-2xl border p-2 ${isHome ? "border-white/10" : "border-slate-200"}`}>
              <Link
                href="/soluciones"
                className={`block rounded-xl px-4 py-3 text-sm font-semibold ${
                  isHome ? "text-white hover:bg-white/10" : "text-slate-900 hover:bg-slate-50"
                }`}
              >
                Soluciones
              </Link>
              <Link
                href="/proyectos"
                className={`block rounded-xl px-4 py-3 text-sm font-semibold ${
                  isHome ? "text-white hover:bg-white/10" : "text-slate-900 hover:bg-slate-50"
                }`}
              >
                Proyectos
              </Link>
              <Link
                href="/partners"
                className={`block rounded-xl px-4 py-3 text-sm font-semibold ${
                  isHome ? "text-white hover:bg-white/10" : "text-slate-900 hover:bg-slate-50"
                }`}
              >
                Partners
              </Link>
              <Link
                href="/nosotros"
                className={`block rounded-xl px-4 py-3 text-sm font-semibold ${
                  isHome ? "text-white hover:bg-white/10" : "text-slate-900 hover:bg-slate-50"
                }`}
              >
                Nosotros
              </Link>
              <Link
                href="/contacto"
                className={`block rounded-xl px-4 py-3 text-sm font-semibold ${
                  isHome ? "text-white hover:bg-white/10" : "text-slate-900 hover:bg-slate-50"
                }`}
              >
                Contacto
              </Link>

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
