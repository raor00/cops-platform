"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Video, Fingerprint, Bell, BrainCircuit, Building2, Zap, Calendar, ExternalLink } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";

type Key = "VMS" | "ACCESO" | "ALARMAS" | "IA" | "BMS" | "ENERGIA";

const ICON_MAP: Record<string, React.ElementType> = {
  VMS: Video,
  ACCESO: Fingerprint,
  ALARMAS: Bell,
  IA: BrainCircuit,
  BMS: Building2,
  ENERGIA: Zap,
};

const fadeUp = { initial: { opacity: 0, y: 16 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.12 as const }, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } };

export default function SolucionesClient() {
  const { t } = useLanguage();
  const ts = t.soluciones;

  const [filter, setFilter] = useState<"TODOS" | Key>("TODOS");

  const filters: { key: "TODOS" | Key; label: string }[] = [
    { key: "TODOS", label: ts.filterAll },
    { key: "VMS", label: ts.filterVMS },
    { key: "ACCESO", label: ts.filterAcceso },
    { key: "ALARMAS", label: ts.filterAlarmas },
    { key: "IA", label: ts.filterIA },
    { key: "BMS", label: ts.filterBMS },
    { key: "ENERGIA", label: ts.filterEnergia },
  ];

  const filtered = useMemo(
    () => filter === "TODOS" ? [...ts.items] : ts.items.filter((s) => s.key === filter),
    [filter, ts]
  );

  return (
    <main className="bg-slate-50 min-h-screen">
      {/* HERO */}
      <section className="relative pt-20 pb-20 md:pt-28 md:pb-28 px-4 bg-white/60 backdrop-blur-3xl border-b border-slate-200 z-10">
        <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none"></div>
        <div className="mx-auto max-w-6xl text-center">
          <motion.div {...fadeUp} className="flex flex-col items-center">
            <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600 ring-1 ring-inset ring-blue-600/20 mb-6 uppercase tracking-widest shadow-sm">
              {ts.badge}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tight text-slate-900 mb-6 drop-shadow-sm leading-[1.1]">
              {ts.h1}
            </h1>
            <p className="max-w-3xl text-lg font-medium text-slate-600 leading-relaxed mx-auto mb-10">
              {ts.desc}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto mb-12">
              <Link href="/contacto" className="inline-flex justify-center items-center gap-2 rounded-full bg-blue-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all hover:-translate-y-0.5 hover:shadow-xl">
                {ts.ctaMeeting} <Calendar className="w-4 h-4 ml-1" />
              </Link>
              <Link href="/proyectos" className="inline-flex justify-center items-center gap-2 rounded-full bg-white border border-slate-200 px-8 py-3.5 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-all hover:text-slate-900">
                {ts.ctaProjects}
              </Link>
            </div>
            <div className="flex flex-wrap justify-center gap-2 relative z-20">
              {ts.tags.map((tag) => (
                <span key={tag} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-[11px] font-bold uppercase tracking-wider rounded-md shadow-sm">
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Areas + filters */}
      <section className="relative bg-white py-24 rounded-t-[3rem] shadow-[0_-15px_40px_-20px_rgba(0,0,0,0.05)] border-t border-slate-100 mt-[-4rem]">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <motion.div {...fadeUp}>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">{ts.areasH2}</h2>
            <p className="text-[15px] font-medium text-slate-500 mb-10 max-w-2xl">
              {ts.areasDesc}
            </p>
            <div className="flex flex-wrap gap-2.5 overflow-x-auto pb-4 scrollbar-hide">
              {filters.map((f) => {
                const active = filter === f.key;
                return (
                  <button key={f.key} onClick={() => setFilter(f.key)} className={`px-5 py-2.5 rounded-full text-[13px] font-bold tracking-wide transition-all whitespace-nowrap ${active ? "bg-blue-700 text-white shadow-md shadow-blue-500/20" : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-100"}`}>{f.label}</button>
                );
              })}
            </div>
          </motion.div>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((s, i) => {
              const IconComponent = ICON_MAP[s.key as string];
              return (
                <motion.article key={s.key} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.04 }} className="group relative bg-white rounded-3xl border border-slate-200 p-8 shadow-sm hover:shadow-[0_15px_30px_-5px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col h-full hover:-translate-y-1 overflow-hidden">
                  <div className="mb-8">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-5">
                      {IconComponent && <IconComponent className="h-5 w-5 stroke-[2.5px]" />}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-700 transition-colors">{s.title}</h3>
                    <p className="text-[14px] font-medium text-slate-500 leading-relaxed mb-6">
                      {s.desc}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-8">
                      {s.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="px-3 py-1.5 bg-slate-50 text-slate-500 text-[10px] uppercase tracking-wide rounded border border-slate-100 font-bold">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <ul className="space-y-3">
                      {s.bullets.map((b) => (
                        <li key={b} className="flex items-start gap-3 text-[13px] font-semibold text-slate-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 mt-1.5"></span>
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-auto pt-6 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 block">{ts.appliesLabel}</span>
                    <div className="flex flex-wrap gap-2">
                      {s.applies.map((a) => (
                        <span key={a} className="px-3 py-1 bg-blue-50/70 text-blue-700 text-[10px] font-bold rounded-full">
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Entregables */}
      <section className="bg-slate-50 relative border-t border-slate-200">
        <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-12">
          <motion.div {...fadeUp} className="grid gap-12 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-5">
              <p className="text-[10px] font-bold tracking-[0.25em] text-blue-600 mb-4 uppercase">{ts.deliverablesLabel}</p>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 leading-tight">{ts.deliverablesH2}</h2>
              <p className="mt-4 text-slate-500 font-medium text-lg leading-relaxed">{ts.deliverablesDesc}</p>
            </div>
            <div className="lg:col-span-7">
              <div className="bg-white rounded-3xl p-8 lg:p-10 border border-slate-200 shadow-sm">
                <ul className="space-y-4">
                  {ts.deliverables.map((d) => (
                    <li key={d} className="flex items-start gap-4">
                      <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                        <span className="h-2 w-2 rounded-full bg-blue-600" />
                      </div>
                      <span className="text-slate-700 font-medium">{d}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-10 flex flex-col gap-4 sm:flex-row border-t border-slate-100 pt-8">
                  <Link href="/contacto" className="inline-flex justify-center items-center rounded-lg bg-blue-700 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-600 transition-colors">{ts.ctaDelMeeting}</Link>
                  <Link href="/partners" className="inline-flex justify-center items-center rounded-lg bg-white border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors gap-2">
                    {ts.ctaDelPartners} <ExternalLink className="w-4 h-4 ml-1 text-slate-400" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative bg-[#0d1a31] overflow-hidden">
        <div className="absolute inset-0 bg-blue-900/10 mix-blend-overlay"></div>
        <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-12 text-white">
          <motion.div {...fadeUp} className="grid gap-8 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-8">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight mb-4">{ts.ctaBannerH2}</h2>
              <p className="text-lg text-blue-200 font-medium max-w-xl">{ts.ctaBannerDesc}</p>
            </div>
            <div className="lg:col-span-4 lg:text-right">
              <Link href="/contacto" className="inline-flex justify-center items-center rounded-lg bg-white px-8 py-4 text-sm font-bold text-slate-900 shadow-lg hover:bg-slate-50 transition-colors w-full sm:w-auto">
                {ts.ctaBannerBtn}
              </Link>
              <p className="mt-6 flex flex-wrap justify-center lg:justify-end gap-x-3 gap-y-1 text-[11px] text-blue-300 font-bold uppercase tracking-wider">
                {ts.ctaBannerTags.map((tag, i) => (
                  <span key={tag}>{i > 0 && <span className="mr-3">&bull;</span>}{tag}</span>
                ))}
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
