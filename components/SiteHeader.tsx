"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const headerClass = isHome
    ? scrolled
      ? "bg-slate-950/80 backdrop-blur border-b border-white/10"
      : "bg-transparent"
    : "bg-white border-b border-slate-300 shadow-sm";

const linkClass = isHome
  ? "text-white hover:text-white"
  : "text-slate-800 hover:text-slate-900";

  function setOpen(arg0: (v: any) => boolean): void {
    throw new Error("Function not implemented.");
  }

  return (
    <header className={`sticky top-0 z-50 transition-colors ${headerClass}`}>
      <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
       <Link
  href="/"
  className={`font-semibold text-lg ${
    isHome ? "text-white" : "text-slate-900"
  }`}
>
  COP’S Electronics
</Link>


        <nav className="hidden md:flex items-center gap-6">
          <Link href="/soluciones" className={linkClass}>Soluciones</Link>
          <Link href="/proyectos" className={linkClass}>Proyectos</Link>
          <Link href="/partners" className={linkClass}>Partners</Link>
          <Link href="/nosotros" className={linkClass}>Nosotros</Link>
          <Link href="/contacto" className={linkClass}>Contacto</Link>
          {/* Mobile menu button */}
  <div className="md:hidden">
  <button
    onClick={() => setOpen((v) => !v)}
    className={`rounded-lg px-3 py-2 text-sm font-semibold ${
      isHome
        ? "text-white border border-white/30"
        : "text-slate-900 border border-slate-300"
    }`}
  >
    {open() ? "Cerrar" : "Menú"}
  </button>
</div>

          <Link
            href="/contacto"
            className="ml-4 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            Solicitar consultoría gratuita
            
          </Link>
    
        </nav>
      </div>
    </header>
  );
}
