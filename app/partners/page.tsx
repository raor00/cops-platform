"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import PartnerModal from "../../components/PartnerModal";
import { PARTNERS, type Partner } from "../../data/partners";

export default function PartnersPage() {
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Partner | null>(null);
  const filtered = useMemo(() => { const s = q.trim().toLowerCase(); if (!s) return PARTNERS; return PARTNERS.filter((p) => `${p.name} ${p.subtitle} ${p.summary} ${p.tags.join(" ")}`.toLowerCase().includes(s)); }, [q]);

  return (
    <div>
      {/* HERO */}
      <section className="dark-section noise relative border-b border-white/[0.06]">
        <div className="relative mx-auto max-w-6xl px-4 py-16">
          <p className="text-[10px] font-bold tracking-[0.25em] text-brand-300">PARTNERS TECNOLÓGICOS</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-white">Ecosistema internacional para proyectos enterprise</h1>
          <p className="mt-4 max-w-3xl text-white/55">Seleccionamos tecnología con foco en operación crítica: integración, escalabilidad, continuidad y eficiencia.</p>
          <div className="mt-8">
            <label className="text-sm font-semibold text-white/70">Buscar partner</label>
            <div className="mt-2"><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ej: Milestone, BMS, Acceso, Energía..." className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/30 outline-none backdrop-blur-sm transition focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20" /></div>
          </div>
        </div>
      </section>

      {/* GRID */}
      <section className="relative border-t border-white/[0.06]">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <motion.div layout className="grid gap-5 md:grid-cols-2 lg:grid-cols-3" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            {filtered.map((p) => (
              <motion.article key={p.id} layout className="lg-card p-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                <div className="flex items-start gap-3">
                  <div className="h-16 w-16 shrink-0 rounded-2xl border border-white/10 bg-white/[0.06] p-2 md:h-20 md:w-20">
                    <Image src={p.logo} alt={p.name} width={180} height={180} className="h-full w-full object-contain brightness-125 contrast-110" />
                  </div>
                  <div className="min-w-0"><h2 className="truncate text-lg font-semibold text-white">{p.name}</h2><p className="mt-1 text-sm text-white/55">{p.subtitle}</p></div>
                </div>
                <p className="mt-4 line-clamp-3 text-sm text-white/50">{p.summary}</p>
                <div className="mt-4 flex flex-wrap gap-2">{(p.tags ?? []).slice(0, 3).map((t) => <span key={t} className="tag-glass">{t}</span>)}</div>
                <div className="mt-6 flex justify-end"><button onClick={() => setSelected(p)} className="btn-glass text-sm !px-4 !py-2">Ver más</button></div>
              </motion.article>
            ))}
          </motion.div>
          {filtered.length === 0 && <div className="mt-10 lg-card p-6 text-white/55">No se encontraron resultados.</div>}
        </div>
      </section>
      <PartnerModal partner={selected} open={!!selected} onClose={() => setSelected(null)} />
    </div>
  );
}
