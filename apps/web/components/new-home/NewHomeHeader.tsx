"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Home } from "lucide-react";
import styles from "./NewHomeHeader.module.css";

export default function NewHomeHeader() {
  const pathname = usePathname();
  const [isAtTop, setIsAtTop] = useState(true);
  const lastScrollRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsAtTop(currentScrollY < 50);
      lastScrollRef.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed left-0 right-0 top-0 z-[100] flex w-full justify-center transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none">
      <div
        className={`pointer-events-auto relative flex items-center justify-between transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${isAtTop
          ? "mt-0 w-full max-w-7xl rounded-none border-b border-transparent bg-transparent px-4 py-5 sm:px-6 lg:px-8 lg:py-8"
          : "mt-4 mx-auto w-[98%] max-w-5xl rounded-full border border-white/10 bg-[#0b1426]/80 px-5 py-2.5 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.8)] backdrop-blur-xl lg:px-8"
          }`}
      >
        <div className={`${styles.logoContainer} scale-90 md:scale-100 origin-left whitespace-nowrap flex-shrink-0`}>
          <div className={styles.atomLogo}>
            <div className={styles.electron} />
            <div className={styles.electron} />
            <div className={styles.electron} />
            <div className={styles.nucleus} />
          </div>
          <div className={styles.logoText}>
            <span className={styles.brand}>COP&apos;S</span>
            <span className={styles.subtitle}>ELECTRONICS</span>
          </div>
        </div>

        <nav className={`${styles.mainNav} hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 items-center`}>
          <Link href="/" aria-label="Inicio" className={`flex items-center transition-colors ${pathname === "/" ? styles.active : ""}`}>
            <Home className="h-4 w-4" />
          </Link>
          <Link href="/soluciones" className={pathname === "/soluciones" ? styles.active : ""}>Soluciones</Link>
          <Link href="/proyectos" className={pathname === "/proyectos" ? styles.active : ""}>Proyectos</Link>
          <Link href="/partners" className={pathname === "/partners" ? styles.active : ""}>Partners</Link>
          <Link href="/nosotros" className={pathname === "/nosotros" ? styles.active : ""}>Nosotros</Link>
          <Link href="/contacto" className={pathname === "/contacto" ? styles.active : ""}>Contacto</Link>
        </nav>

        <div className={`${styles.authActions} hidden md:flex`}>
          <a
            href="/contacto"
            className="flex items-center justify-center whitespace-nowrap rounded-full border border-blue-500/50 bg-blue-600/30 px-5 py-2 text-xs font-bold text-white shadow-[0_4px_14px_rgba(37,99,235,0.2)] transition-all hover:-translate-y-[1px] hover:bg-blue-600/50 hover:shadow-[0_6px_20px_rgba(37,99,235,0.3)]"
          >
            Solicitar asesoria
          </a>
          <a
            href="/login"
            className="flex items-center justify-center whitespace-nowrap rounded-full border border-white/20 bg-white/5 px-5 py-2 text-xs font-bold text-white shadow-[0_4px_14px_rgba(0,0,0,0.1)] transition-all hover:-translate-y-[1px] hover:bg-white/10"
          >
            Iniciar sesion
          </a>
        </div>
      </div>
    </header>
  );
}

