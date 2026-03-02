"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { X, CheckCircle2, ArrowUpRight, ShieldCheck } from "lucide-react";
import type { Partner } from "../data/partners";

export default function PartnerModal({ partner, open, onClose }: { partner: Partner | null; open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && partner ? (
        <motion.div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true">
          <button aria-label="Cerrar modal" onClick={onClose} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
          <motion.div
            className="relative w-full max-w-4xl overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] flex flex-col max-h-[90vh] md:max-h-[85vh]"
            initial={{ y: 20, scale: 0.96, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 14, scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Header Pattern / Color Bar */}
            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-blue-50/80 to-white pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white border border-slate-200 shadow-sm text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all hover:scale-105"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Scrollable Content Container (less padding on top) */}
            <div className="relative px-6 pt-8 pb-8 md:px-10 md:pt-10 md:pb-8 z-10 overflow-y-auto scrollbar-hide flex-1">
              {/* Header Section */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 md:gap-8">
                <div className="w-24 shrink-0 md:w-32">
                  <div className="flex aspect-square items-center justify-center rounded-2xl border border-slate-200 bg-white p-4 mx-auto sm:mx-0 shadow-sm">
                    <Image src={partner.logo} alt={partner.name} width={200} height={200} className="h-full w-full object-contain" priority />
                  </div>
                </div>

                <div className="flex-1 text-center sm:text-left">
                  <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2 mb-2">
                    <p className="text-[10px] font-black tracking-[0.15em] text-blue-600 uppercase">
                      PARTNER TECNOLÓGICO
                    </p>
                    <span className="inline-flex items-center justify-center rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                      <ShieldCheck className="mr-1 h-3 w-3" /> Oficial
                    </span>
                  </div>
                  <h3 className="text-2xl font-black tracking-tight leading-tight md:text-3xl text-slate-900 mb-1">{partner.name}</h3>
                  <p className="text-lg font-bold text-slate-700 leading-snug mb-3">{partner.subtitle}</p>
                  <p className="text-slate-500 font-medium text-sm leading-relaxed max-w-2xl mx-auto sm:mx-0">{partner.description}</p>

                  <div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-1.5">
                    {partner.tags.map((t) => (
                      <span key={t} className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider rounded-md border border-slate-200">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="my-6 md:my-8 h-px w-full bg-slate-100" />

              {/* Bottom Section */}
              <div className="grid gap-6 md:grid-cols-12 md:gap-8 items-stretch">
                <div className="md:col-span-7 flex flex-col">
                  <h4 className="text-[11px] font-black tracking-[0.15em] text-slate-500 mb-4 uppercase flex items-center gap-3">
                    Capacidades Clave
                  </h4>
                  <ul className="grid gap-3 sm:grid-cols-1 lg:grid-cols-2 flex-1">
                    {partner.capabilities.map((c) => (
                      <li key={c} className="flex items-start gap-3 bg-white rounded-xl p-4 border border-slate-200 shadow-sm transition-all hover:border-blue-200">
                        <CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                        <span className="text-[13px] font-semibold text-slate-700 leading-snug">{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="md:col-span-5 flex flex-col">
                  <div className="bg-[#0b1426] rounded-[1.25rem] p-6 border border-slate-800 flex flex-col justify-center h-full relative overflow-hidden shadow-inner">
                    {/* Background decoration */}
                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-600 rounded-full blur-[50px] opacity-20 pointer-events-none"></div>
                    <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-indigo-600 rounded-full blur-[50px] opacity-20 pointer-events-none"></div>

                    <div className="relative z-10 flex flex-col h-full">
                      <h4 className="text-[10px] font-bold tracking-[0.2em] text-slate-400 mb-5 uppercase text-center">Acceso Directo</h4>

                      <div className="flex-1 flex flex-col justify-center gap-3">
                        {partner.website ? (
                          <a href={partner.website} target="_blank" rel="noreferrer" className="group relative w-full inline-flex justify-center items-center rounded-xl bg-blue-600/90 hover:bg-blue-600 px-5 py-3.5 text-[13px] font-bold text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all hover:-translate-y-0.5 border border-blue-500/50">
                            Sitio oficial
                            <ArrowUpRight className="ml-2 h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 opacity-80" />
                          </a>
                        ) : (
                          <div className="w-full inline-flex justify-center items-center rounded-xl bg-slate-800/80 px-5 py-3.5 text-[13px] font-bold text-slate-500 cursor-not-allowed border border-slate-700/50">
                            Sitio no disponible
                          </div>
                        )}
                        <p className="mt-2 text-center text-[11px] font-medium text-slate-400/80 leading-relaxed px-2">
                          Integramos tecnología de <span className="text-slate-200">{partner.name}</span> en proyectos enterprise.
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
