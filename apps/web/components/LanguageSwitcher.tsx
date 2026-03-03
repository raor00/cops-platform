"use client";

import { useLanguage } from "@/lib/i18n/context";

export function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();

  return (
    <div
      className="flex items-center rounded-full border border-white/15 bg-white/5 p-0.5 text-[10px] font-bold tracking-[0.12em]"
      role="group"
      aria-label="Language selector"
    >
      <button
        onClick={() => setLocale("es")}
        aria-pressed={locale === "es"}
        className={`rounded-full px-2.5 py-1 transition-all duration-200 ${
          locale === "es"
            ? "bg-white/20 text-white shadow-sm"
            : "text-white/45 hover:text-white/75"
        }`}
      >
        ES
      </button>
      <button
        onClick={() => setLocale("en")}
        aria-pressed={locale === "en"}
        className={`rounded-full px-2.5 py-1 transition-all duration-200 ${
          locale === "en"
            ? "bg-white/20 text-white shadow-sm"
            : "text-white/45 hover:text-white/75"
        }`}
      >
        EN
      </button>
    </div>
  );
}
