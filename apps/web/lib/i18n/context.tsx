"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  startTransition,
  type ReactNode,
} from "react";
import { translations, type Locale, type Translations } from "./translations";

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = "cops-lang";

function detectLocale(): Locale {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (saved === "en" || saved === "es") return saved;
    const lang = (navigator.language || "").toLowerCase();
    if (lang.startsWith("en")) return "en";
  } catch {
    // SSR or restricted environments
  }
  return "es";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Default to "es" for SSR; updated on client after hydration
  const [locale, setLocaleState] = useState<Locale>("es");

  useEffect(() => {
    const detected = detectLocale();
    setLocaleState(detected);
    document.documentElement.lang = detected;
  }, []);

  function setLocale(newLocale: Locale) {
    if (newLocale === locale) return;

    document.documentElement.lang = newLocale;

    startTransition(() => {
      setLocaleState(newLocale);
    });

    try {
      localStorage.setItem(STORAGE_KEY, newLocale);
    } catch {
      // storage not available
    }
  }

  // Memoized so `t` reference only changes when locale changes, not on every provider render
  const t = useMemo(() => translations[locale], [locale]);

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
