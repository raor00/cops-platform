"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { X, CheckCircle2, ArrowUpRight, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import type { Partner } from "../data/partners";

export default function PartnerModal({
  partner,
  open,
  onClose,
}: {
  partner: Partner | null;
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useLanguage();
  const copy = t.partnersPage.modal;

  return (
    <AnimatePresence>
      {open && partner ? (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
        >
          <button
            aria-label={copy.close}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div
            className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] md:max-h-[85vh]"
            initial={{ y: 20, scale: 0.96, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 14, scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="pointer-events-none absolute left-0 right-0 top-0 h-24 bg-gradient-to-b from-blue-50/80 to-white" />

            <button
              onClick={onClose}
              aria-label={copy.close}
              className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition-all hover:scale-105 hover:bg-slate-50 hover:text-slate-900"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="relative z-10 flex-1 overflow-y-auto px-6 pb-8 pt-8 scrollbar-hide md:px-10 md:pb-8 md:pt-10">
              <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start md:gap-8">
                <div className="w-24 shrink-0 md:w-32">
                  <div className="mx-auto flex aspect-square items-center justify-center rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:mx-0">
                    <Image
                      src={partner.logo}
                      alt={partner.name}
                      width={200}
                      height={200}
                      className="h-full w-full object-contain"
                      priority
                    />
                  </div>
                </div>

                <div className="flex-1 text-center sm:text-left">
                  <div className="mb-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-blue-600">
                      {copy.badge}
                    </p>
                    <span className="inline-flex items-center justify-center rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                      <ShieldCheck className="mr-1 h-3 w-3" />
                      {copy.official}
                    </span>
                  </div>
                  <h3 className="mb-1 text-2xl font-black leading-tight tracking-tight text-slate-900 md:text-3xl">
                    {partner.name}
                  </h3>
                  <p className="mb-3 text-lg font-bold leading-snug text-slate-700">
                    {partner.subtitle}
                  </p>
                  <p className="mx-auto max-w-2xl text-sm font-medium leading-relaxed text-slate-500 sm:mx-0">
                    {partner.description}
                  </p>

                  <div className="mt-4 flex flex-wrap justify-center gap-1.5 sm:justify-start">
                    {partner.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md border border-slate-200 bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="my-6 h-px w-full bg-slate-100 md:my-8" />

              <div className="grid items-stretch gap-6 md:grid-cols-12 md:gap-8">
                <div className="flex flex-col md:col-span-7">
                  <h4 className="mb-4 flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.15em] text-slate-500">
                    {copy.keyCapabilities}
                  </h4>
                  <ul className="grid flex-1 gap-3 sm:grid-cols-1 lg:grid-cols-2">
                    {partner.capabilities.map((capability) => (
                      <li
                        key={capability}
                        className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-blue-200"
                      >
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                        <span className="text-[13px] font-semibold leading-snug text-slate-700">
                          {capability}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-col md:col-span-5">
                  <div className="relative flex h-full flex-col justify-center overflow-hidden rounded-[1.25rem] border border-slate-800 bg-[#0b1426] p-6 shadow-inner">
                    <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-blue-600 opacity-20 blur-[50px]" />
                    <div className="pointer-events-none absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-indigo-600 opacity-20 blur-[50px]" />

                    <div className="relative z-10 flex h-full flex-col">
                      <h4 className="mb-5 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                        {copy.directAccess}
                      </h4>

                      <div className="flex flex-1 flex-col justify-center gap-3">
                        {partner.website ? (
                          <a
                            href={partner.website}
                            target="_blank"
                            rel="noreferrer"
                            className="group relative inline-flex w-full items-center justify-center rounded-xl border border-blue-500/50 bg-blue-600/90 px-5 py-3.5 text-[13px] font-bold text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all hover:-translate-y-0.5 hover:bg-blue-600"
                          >
                            {copy.officialSite}
                            <ArrowUpRight className="ml-2 h-3.5 w-3.5 opacity-80 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                          </a>
                        ) : (
                          <div className="inline-flex w-full cursor-not-allowed items-center justify-center rounded-xl border border-slate-700/50 bg-slate-800/80 px-5 py-3.5 text-[13px] font-bold text-slate-500">
                            {copy.siteUnavailable}
                          </div>
                        )}
                        <p className="mt-2 px-2 text-center text-[11px] font-medium leading-relaxed text-slate-400/80">
                          {copy.integrationBlurb.replace("{name}", partner.name)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
