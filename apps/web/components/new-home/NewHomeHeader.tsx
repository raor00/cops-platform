"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./NewHomeHeader.module.css";

export default function NewHomeHeader() {
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
        className={`pointer-events-auto flex items-center justify-between transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isAtTop
            ? "mt-0 w-full max-w-7xl rounded-none border-b border-transparent bg-transparent px-4 py-5 sm:px-6 lg:px-8 lg:py-8"
            : "mt-4 mx-auto w-[95%] max-w-4xl rounded-full border border-white/10 bg-[#0b1426]/70 px-6 py-3 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.8)] backdrop-blur-xl lg:px-8"
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

        <nav className={`${styles.mainNav} hidden md:flex`}>
          <a href="#homepage" className={styles.active}>Homepage</a>
          <a href="#soluciones">Soluciones</a>
          <a href="#sectores">Sectores</a>
          <a href="#contacto">Contacto</a>
        </nav>

        <div className={`${styles.authActions} hidden md:flex`}>
          <a href="/login" className={styles.loginBtn}>Log in</a>
          <a
            href="/contacto"
            className="rounded-full bg-white px-6 py-2.5 text-sm font-bold text-[#070f1e] shadow-[0_4px_14px_rgba(255,255,255,0.2)] transition-all hover:-translate-y-[1px] hover:bg-slate-200 hover:shadow-[0_6px_20px_rgba(255,255,255,0.3)]"
          >
            Agendar reunion
          </a>
        </div>
      </div>
    </header>
  );
}

