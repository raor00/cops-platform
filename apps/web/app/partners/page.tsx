"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import PartnerModal from "../../components/PartnerModal";
import { PARTNERS, type Partner } from "../../data/partners";

const fadeUp = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.1 as const }, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } };
const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};
const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
};


export default function PartnersPage() {
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Partner | null>(null);
  const filtered = useMemo(() => { const s = q.trim().toLowerCase(); if (!s) return PARTNERS; return PARTNERS.filter((p) => `${p.name} ${p.subtitle} ${p.summary} ${p.tags.join(" ")}`.toLowerCase().includes(s)); }, [q]);

  return (
    <div className="bg-[#f3f4f6] min-h-screen font-sans text-slate-950 relative overflow-hidden">

      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden h-full w-full">
        <motion.div
          animate={{ x: ["0%", "-10%", "0%"], y: ["0%", "8%", "0%"], scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 25, ease: "easeInOut" }}
          className="absolute top-[-15%] left-[-15%] w-[60vw] h-[60vw] rounded-full bg-blue-500/15 blur-[120px]"
        />
        <motion.div
          animate={{ x: ["0%", "10%", "0%"], y: ["0%", "-8%", "0%"], scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 20, ease: "easeInOut" }}
          className="absolute top-[15%] right-[-15%] w-[50vw] h-[50vw] rounded-full bg-indigo-500/15 blur-[120px]"
        />
      </div>

      {/* HEADER */}
      <section className="relative bg-white/60 backdrop-blur-xl border-b border-slate-300 pt-20 pb-20 md:pt-28 md:pb-28 z-10 shadow-sm">
        <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none"></div>
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center max-w-3xl mx-auto">
            <span className="inline-block py-1.5 px-4 rounded-full bg-blue-100 border border-blue-200 text-blue-700 text-[11px] font-black tracking-[0.2em] mb-6 shadow-sm">
              PARTNERS TECNOLÓGICOS
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 mb-6 drop-shadow-sm">
              Ecosistema internacional para <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">proyectos enterprise</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 mb-10 leading-relaxed font-medium">
              Seleccionamos tecnología con foco en operación crítica: integración, escalabilidad, continuidad y eficiencia.
            </p>
            <div className="mx-auto max-w-xl relative z-20">
              <label className="text-sm font-semibold text-slate-600 sr-only">Buscar partner</label>
              <div className="relative">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Buscar partners (ej: Milestone, BMS, Acceso...)"
                  className="w-full rounded-full border border-slate-300 bg-white/90 px-6 py-4 text-[15px] font-medium text-slate-800 placeholder-slate-400 outline-none shadow-sm transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* GRID */}
      <section className="relative py-24 z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((p) => (
                <motion.article
                  key={p.id}
                  variants={staggerItem}
                  layout
                  onClick={() => setSelected(p)}
                  whileTap={{ scale: 0.97 }}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelected(p);
                    }
                  }}
                  className="group relative bg-white rounded-2xl border border-slate-200 p-6 shadow-[0_4px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1.5 hover:border-blue-300 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer focus:outline-none focus:ring-4 focus:ring-blue-500/20"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />

                  <div className="flex items-start gap-4 mb-5 relative z-10">
                    <div className="flex h-16 w-16 md:h-20 md:w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-200 shadow-sm p-2 group-hover:shadow-md transition-all duration-500 group-hover:scale-105 group-hover:-rotate-2">
                      <Image
                        src={p.logo}
                        alt={p.name}
                        width={180}
                        height={180}
                        className="h-full w-full object-contain filter grayscale opacity-80 group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-500"
                      />
                    </div>
                    <div className="min-w-0 mt-1 flex-1">
                      <h2 className="truncate text-xl font-bold text-slate-900 group-hover:text-blue-700 transition-colors duration-300">{p.name}</h2>
                      <p className="mt-1 text-sm font-medium text-slate-500 group-hover:text-slate-600 transition-colors duration-300">{p.subtitle}</p>
                    </div>
                  </div>

                  <p className="mt-2 text-[14px] text-slate-600 font-medium leading-relaxed relative z-10 line-clamp-3">
                    {p.summary}
                  </p>

                  <div className="mt-6 flex flex-wrap gap-1.5 relative z-10">
                    {(p.tags ?? []).slice(0, 3).map((t) => (
                      <span key={t} className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider rounded border border-slate-200 group-hover:bg-blue-100/50 group-hover:text-blue-700 group-hover:border-blue-200 transition-colors duration-300">
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="mt-auto pt-6 flex items-center justify-between relative z-10">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] group-hover:text-blue-400 transition-colors duration-300">
                      Enterprise
                    </span>
                    <div className="inline-flex items-center justify-center rounded-lg bg-slate-50 border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 transition-all duration-300 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 group-hover:shadow-[0_4px_12px_rgba(37,99,235,0.3)]">
                      Ver detalles
                      <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-4 w-4 opacity-70 transition-transform duration-300 group-hover:translate-x-1 group-hover:opacity-100" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </motion.div>

          {filtered.length === 0 && (
            <div className="mt-10 bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
              <p className="text-lg font-medium text-slate-500">No se encontraron partners que coincidan con la búsqueda.</p>
            </div>
          )}
        </div>
      </section>

      <PartnerModal partner={selected} open={!!selected} onClose={() => setSelected(null)} />
    </div>
  );
}
