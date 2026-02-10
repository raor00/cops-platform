"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import type { Partner } from "../data/partners";

export default function PartnerModal({ partner, open, onClose }: { partner: Partner | null; open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && partner ? (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true">
          <button aria-label="Cerrar modal" onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
          <motion.div className="relative w-full max-w-5xl overflow-hidden rounded-3xl border border-white/[0.08] bg-[#060c1c]/95 text-white shadow-2xl backdrop-blur-2xl" initial={{ y: 14, scale: 0.98, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} exit={{ y: 10, scale: 0.98, opacity: 0 }} transition={{ duration: 0.22 }}>
            <div className="px-6 py-6 md:px-10 md:py-8">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-24 shrink-0 md:w-28">
                    <div className="rounded-2xl border border-white/10 bg-white/95 p-4 shadow-sm">
                      <Image src={partner.logo} alt={partner.name} width={220} height={220} className="h-12 w-full object-contain md:h-14" priority />
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold tracking-[0.25em] text-brand-300">PARTNER TECNOLÓGICO</p>
                    <h3 className="mt-2 text-2xl font-bold leading-tight md:text-3xl">{partner.subtitle}</h3>
                    <p className="mt-2 max-w-3xl text-white/60">{partner.description}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {partner.tags.map((t) => <span key={t} className="tag-glass">{t}</span>)}
                    </div>
                  </div>
                </div>
                <button onClick={onClose} className="btn-glass text-sm !px-4 !py-2">Cerrar</button>
              </div>
              <div className="mt-8 grid gap-6 md:grid-cols-12">
                <div className="md:col-span-8">
                  <p className="text-[10px] font-bold tracking-[0.25em] text-brand-300">CAPACIDADES</p>
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-white/60">{partner.capabilities.map((c) => <li key={c}>{c}</li>)}</ul>
                </div>
                <div className="md:col-span-4">
                  <div className="lg-card p-5">
                    <p className="text-[10px] font-bold tracking-[0.25em] text-brand-300">ACCIONES</p>
                    <div className="mt-4 grid gap-3">
                      {partner.website ? (
                        <a href={partner.website} target="_blank" rel="noreferrer" className="btn-glass-primary w-full text-center">Sitio oficial</a>
                      ) : (
                        <p className="text-sm text-white/45">Sitio oficial no disponible.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-8 border-t border-white/[0.06] pt-4 text-xs text-white/30">COP&apos;S Electronics, S.A. &bull; Partners internacionales &bull; Operación enterprise</div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
