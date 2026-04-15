"use client";

import { useLanguage } from "@/lib/i18n/context";

export default function SiteFooter() {
  const { t } = useLanguage();
  return (
    <footer className="bg-slate-950 border-t border-white/5 text-slate-300 relative z-20">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <span className="text-xl font-black tracking-tight text-white md:text-[1.4rem]">COP&apos;S <span className="text-blue-500">Electronics</span></span>
            <p className="mt-1.5 text-[12px] font-semibold uppercase tracking-[0.2em] text-slate-400 md:text-[13px]">
              {t.footer.tagline}
            </p>
          </div>

          <div className="text-center md:text-right text-[12px] font-semibold tracking-[0.08em] text-slate-400 md:text-[13px]">
            <p>© {new Date().getFullYear()} COP&apos;S Electronics, S.A. {t.footer.rights}</p>
            <p className="mt-1">{t.footer.city}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
