"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Home, X, Menu } from "lucide-react";
import styles from "./NewHomeHeader.module.css";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/lib/i18n/context";

export default function NewHomeHeader() {
  const pathname = usePathname();
  const [isAtTop, setIsAtTop] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const lastScrollRef = useRef(0);
  const { t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsAtTop(currentScrollY < 50);
      lastScrollRef.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const navLinks = [
    { href: "/soluciones", label: t.nav.solutions },
    { href: "/proyectos", label: t.nav.projects },
    { href: "/partners", label: t.nav.partners },
    { href: "/nosotros", label: t.nav.about },
    { href: "/contacto", label: t.nav.contact },
  ];

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-[100] flex w-full justify-center transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none">
        <div
          className={`pointer-events-auto relative flex items-center transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${isAtTop
            ? "mt-0 w-full rounded-none border-b border-transparent bg-transparent px-6 py-4 lg:px-12 lg:py-5"
            : "mt-4 mx-auto w-[96%] max-w-5xl rounded-full border border-white/10 bg-[#0b1426]/80 px-4 py-2 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.8)] backdrop-blur-xl sm:px-5 lg:px-6"
            }`}
        >
          {/* Logo - fixed width */}
          <div className={`${styles.logoContainer} whitespace-nowrap flex-shrink-0`}>
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

          {/* Nav - centered with flex-1 (desktop only) */}
          <nav className={`${styles.mainNav} hidden lg:flex items-center justify-center flex-1 mx-4`}>
            <Link href="/" aria-label="Inicio" className={`flex items-center transition-colors ${pathname === "/" ? styles.active : ""}`}>
              <Home className="h-4 w-4" />
            </Link>
            <Link href="/soluciones" className={pathname === "/soluciones" ? styles.active : ""}>{t.nav.solutions}</Link>
            <Link href="/proyectos" className={pathname === "/proyectos" ? styles.active : ""}>{t.nav.projects}</Link>
            <Link href="/partners" className={pathname === "/partners" ? styles.active : ""}>{t.nav.partners}</Link>
            <Link href="/nosotros" className={pathname === "/nosotros" ? styles.active : ""}>{t.nav.about}</Link>
            <Link href="/contacto" className={pathname === "/contacto" ? styles.active : ""}>{t.nav.contact}</Link>
          </nav>

          {/* Auth actions + language switcher (desktop only) */}
          <div className={`${styles.authActions} hidden lg:flex items-center gap-2.5 flex-shrink-0`}>
            <LanguageSwitcher />
            <a
              href="/contacto"
              className="flex items-center justify-center whitespace-nowrap rounded-full border border-blue-500/50 bg-blue-600/30 px-4 py-1.5 text-[11px] font-semibold text-white shadow-[0_4px_14px_rgba(37,99,235,0.2)] transition-all hover:-translate-y-[1px] hover:bg-blue-600/50 hover:shadow-[0_6px_20px_rgba(37,99,235,0.3)]"
            >
              {t.nav.cta}
            </a>
            <a
              href="/login"
              className="flex items-center justify-center whitespace-nowrap rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-[11px] font-semibold text-white transition-all hover:-translate-y-[1px] hover:bg-white/10"
            >
              {t.nav.login}
            </a>
          </div>

          {/* Hamburger button (mobile only) */}
          <button
            className="ml-auto flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition-colors hover:bg-white/10 lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile menu overlay */}
      <div
        className={`fixed inset-0 z-[99] lg:hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!mobileOpen}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />

        {/* Drawer panel */}
        <div
          className={`absolute right-0 top-0 h-full w-[min(320px,90vw)] bg-[#080f1e]/95 backdrop-blur-2xl border-l border-white/10 shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col ${
            mobileOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Drawer header */}
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <span className="text-sm font-bold tracking-widest text-white/60 uppercase">Menú</span>
            <button
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition-colors hover:bg-white/10"
              onClick={() => setMobileOpen(false)}
              aria-label="Cerrar menú"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Nav links */}
          <nav className="flex flex-col gap-1 px-3 pt-4 flex-1">
            <Link
              href="/"
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                pathname === "/"
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
              onClick={() => setMobileOpen(false)}
            >
              <Home className="h-4 w-4 flex-shrink-0" />
              Inicio
            </Link>
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                  pathname === href
                    ? "bg-white/10 text-white"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
                onClick={() => setMobileOpen(false)}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Bottom actions */}
          <div className="border-t border-white/10 px-5 pb-8 pt-5 space-y-3">
            {/* Language switcher */}
            <div className="flex justify-center pb-1">
              <LanguageSwitcher />
            </div>

            {/* CTA button */}
            <a
              href="/contacto"
              className="flex w-full items-center justify-center rounded-full border border-blue-500/50 bg-blue-600/30 px-4 py-3 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(37,99,235,0.2)] transition-all hover:bg-blue-600/50"
              onClick={() => setMobileOpen(false)}
            >
              {t.nav.cta}
            </a>

            {/* Login button */}
            <a
              href="/login"
              className="flex w-full items-center justify-center rounded-full border border-white/20 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10"
              onClick={() => setMobileOpen(false)}
            >
              {t.nav.login}
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
