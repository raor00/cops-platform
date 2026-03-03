"use client";

import { useLanguage } from "@/lib/i18n/context";

export default function SiteFooter() {
  const { t } = useLanguage();
  return (
    <footer className="bg-slate-950 border-t border-white/5 text-slate-400 relative z-20">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <span className="text-lg font-black tracking-tight text-white">COP&apos;S <span className="text-blue-500">Electronics</span></span>
            <p className="mt-1 text-[11px] font-medium uppercase tracking-widest text-slate-500">
              {t.footer.tagline}
            </p>
          </div>

          <div className="text-center md:text-right text-[11px] font-semibold tracking-wider text-slate-500">
            <p>© {new Date().getFullYear()} COP&apos;S Electronics, S.A. {t.footer.rights}</p>
            <p className="mt-1">{t.footer.city}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
