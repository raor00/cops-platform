"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import PartnerModal from "../../components/PartnerModal";
import { PARTNERS, type Partner } from "../../data/partners";

function TagPill({ text }: { text: string }) {
  return (
    <span className="rounded-full border px-3 py-1 text-xs text-slate-600">
      {text}
    </span>
  );
}

export default function PartnersPage() {
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Partner | null>(null);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return PARTNERS;

    return PARTNERS.filter((p) => {
      const hay =
        `${p.name} ${p.subtitle} ${p.summary} ${p.tags.join(" ")}`.toLowerCase();
      return hay.includes(s);
    });
  }, [q]);

  return (
    <div>
      {/* HERO */}
      <section className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-600">
            Partners tecnológicos
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">
            Ecosistema internacional para proyectos enterprise
          </h1>
          <p className="mt-4 max-w-3xl text-slate-700">
            Seleccionamos tecnología con foco en operación crítica: integración,
            escalabilidad, continuidad y eficiencia.
          </p>

          {/* Search */}
          <div className="mt-8">
            <label className="text-sm font-semibold text-slate-700">
              Buscar partner
            </label>
            <div className="mt-2">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Ej: Milestone, BMS, Acceso, Energía..."
                className="w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>
          </div>
        </div>
      </section>

      {/* GRID */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <motion.div
          layout
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          {filtered.map((p) => (
            <motion.article
              key={p.id}
              layout
             className="rounded-3xl border border-slate-200 bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-lg"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              {/* Header */}
              <div className="flex items-start gap-3">
              <div className="h-16 w-16 shrink-0 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm md:h-20 md:w-20">
                <Image
                  src={p.logo}
    alt={p.name}
    width={180}
    height={180}
    className="h-full w-full object-contain contrast-125 saturate-125"
  />
</div>

                <div className="min-w-0">
                  <h2 className="truncate text-lg font-semibold">{p.name}</h2>
                  <p className="mt-1 text-sm text-slate-600">{p.subtitle}</p>
                </div>
              </div>

              {/* Summary */}
              <p className="mt-4 line-clamp-3 text-sm text-slate-700">
                {p.summary}
              </p>

              {/* Tags */}
              <div className="mt-4 flex flex-wrap gap-2">
                {(p.tags ?? []).slice(0, 3).map((t) => (
                  <TagPill key={t} text={t} />
                ))}
              </div>

              {/* CTA (UNO SOLO) */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelected(p)}
                  className="rounded-3xl border border-slate-200 bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-lg"

                >
                  Ver más
                </button>
              </div>
            </motion.article>
          ))}
        </motion.div>

        {filtered.length === 0 ? (
          <div className="mt-10 rounded-2xl border bg-white p-6 text-slate-700">
            No se encontraron resultados. Prueba con “Acceso”, “BMS”, “Energía”, “VMS”…
          </div>
        ) : null}
      </section>

      {/* MODAL */}
      <PartnerModal
        partner={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
