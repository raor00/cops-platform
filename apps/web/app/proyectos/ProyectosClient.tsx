"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Factory, Landmark, Shield, Camera, KeyRound, Zap, Network, ArrowRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";

type Sector = "Banca" | "Industrial" | "Comercial" | "Gubernamental" | "Mixto";

const PROJECT_ICON_CMPS: React.ElementType[] = [Camera, KeyRound, Network, Shield, Building2, Zap];
const RECENT_ICON_CMPS: React.ElementType[] = [Landmark, Factory];
// Tech tags are product/brand names — not translated
const RECENT_TECH_DATA = [
  ["Hikvision", "CCTV", "Control de acceso", "Alarma", "Analíticas", "IA"],
  ["Milestone", "Invenzi", "Migración", "VMS", "Control de acceso", "Multi-sede"],
];

const fadeUp = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.1 as const }, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } };

export default function ProyectosClient() {
  const { t } = useLanguage();
  const tp = t.proyectos;

  const [filter, setFilter] = useState<"Todos" | Sector>("Todos");

  const filtered = useMemo(() => {
    const projs = Array.from(tp.projects).map((p, i) => ({ ...p, origIdx: i }));
    return filter === "Todos" ? projs : projs.filter((p) => (p.sector as Sector) === filter);
  }, [filter, tp]);

  const filtersList = [
    { key: "Todos" as const, label: tp.filterAll, icon: <Factory className="h-4 w-4" /> },
    { key: "Banca" as const, label: "Banca", icon: <Landmark className="h-4 w-4" /> },
    { key: "Industrial" as const, label: "Industrial", icon: <Factory className="h-4 w-4" /> },
    { key: "Comercial" as const, label: "Comercial", icon: <Building2 className="h-4 w-4" /> },
    { key: "Gubernamental" as const, label: "Gubernamental", icon: <Shield className="h-4 w-4" /> },
    { key: "Mixto" as const, label: "Mixto", icon: <Network className="h-4 w-4" /> },
  ];

  const sectorAccent: Record<Sector, string> = {
    Banca: "bg-blue-500",
    Industrial: "bg-amber-500",
    Gubernamental: "bg-violet-500",
    Comercial: "bg-teal-500",
    Mixto: "bg-rose-500",
  };

  const sectorIconColors: Record<Sector, string> = {
    Banca: "bg-blue-50 text-blue-600 border-blue-100",
    Industrial: "bg-amber-50 text-amber-600 border-amber-100",
    Gubernamental: "bg-violet-50 text-violet-600 border-violet-100",
    Comercial: "bg-teal-50 text-teal-600 border-teal-100",
    Mixto: "bg-rose-50 text-rose-600 border-rose-100",
  };

  const sectorBadgeColors: Record<Sector, string> = {
    Banca: "bg-blue-50 text-blue-700 border-blue-200/80",
    Industrial: "bg-amber-50 text-amber-700 border-amber-200/80",
    Gubernamental: "bg-violet-50 text-violet-700 border-violet-200/80",
    Comercial: "bg-teal-50 text-teal-700 border-teal-200/80",
    Mixto: "bg-rose-50 text-rose-700 border-rose-200/80",
  };

  const sectorHoverGlow: Record<Sector, string> = {
    Banca: "from-blue-50/70",
    Industrial: "from-amber-50/70",
    Gubernamental: "from-violet-50/70",
    Comercial: "from-teal-50/70",
    Mixto: "from-rose-50/70",
  };

  return (
    <div className="bg-white min-h-screen font-sans text-slate-950 relative overflow-hidden">

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

      {/* HEADER SECTION */}
      <section className="relative bg-white/60 backdrop-blur-xl border-b border-slate-200 pt-20 pb-20 md:pt-28 md:pb-28 z-10 shadow-sm">
        <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none"></div>
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center max-w-3xl mx-auto">
            <span className="inline-block py-1.5 px-4 rounded-full bg-blue-100 border border-blue-200 text-blue-700 text-[11px] font-black tracking-[0.2em] mb-6 shadow-sm">
              {tp.badge}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 mb-6 drop-shadow-sm">
              {tp.h1} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{tp.h1highlight}</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 mb-10 leading-relaxed font-medium">
              {tp.desc}
            </p>

            <div className="flex flex-wrap justify-center gap-3 mb-12 relative z-20">
              {tp.tags.map((tag) => (
                <span key={tag} className="px-4 py-1.5 bg-white/80 text-slate-950 text-xs font-medium rounded-full border border-slate-400/30 shadow-[0_2px_10px_rgba(0,0,0,0.05)] backdrop-blur-md">
                  {tag}
                </span>
              ))}
            </div>

            {/* FILTERS */}
            <div className="flex flex-wrap justify-center gap-3">
              {filtersList.map((f) => {
                const active = filter === f.key;
                return (
                  <button
                    key={f.key}
                    onClick={() => setFilter(f.key)}
                    className={`inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition-all duration-300 ${active
                      ? "border-blue-700 bg-blue-700 text-white shadow-[0_8px_20px_-4px_rgba(29,78,216,0.5)] scale-105"
                      : "border-slate-400/40 bg-white/90 text-slate-800 hover:bg-white hover:text-slate-950 hover:border-slate-500 hover:shadow-md"
                      }`}
                  >
                    {f.icon}
                    {f.label}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* GRID SECTION */}
      <section className="relative py-24 z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div layout="position" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout" initial={false}>
              {filtered.map((p, i) => {
                const Icon = PROJECT_ICON_CMPS[p.origIdx];
                const sector = p.sector as Sector;
                return (
                  <motion.article
                    key={`${p.origIdx}-${p.sector}`}
                    layout
                    initial={{ opacity: 0, scale: 0.9, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className="group relative bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.11)] hover:-translate-y-1.5 transition-all duration-500 flex flex-col overflow-hidden cursor-default"
                  >
                    <div className={`h-[3px] w-full shrink-0 ${sectorAccent[sector]}`} />
                    <div className={`absolute inset-0 bg-gradient-to-br ${sectorHoverGlow[sector]} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />

                    <div className="relative z-10 p-6 flex flex-col flex-1">
                      <div className="flex items-start gap-3.5 mb-5">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${sectorIconColors[sector]} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md border mb-1.5 ${sectorBadgeColors[sector]}`}>
                            {p.sector}
                          </span>
                          <h2 className="text-[15px] font-bold text-slate-900 leading-snug group-hover:text-blue-700 transition-colors duration-300">
                            {p.title}
                          </h2>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5 mb-5">
                        {p.scope.map((s) => (
                          <span key={s} className="px-2 py-1 bg-slate-50 text-slate-600 text-[10px] font-bold uppercase tracking-wider rounded-md border border-slate-200">
                            {s}
                          </span>
                        ))}
                      </div>

                      <div className="flex-1 mb-5">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.22em] mb-3">{tp.solutionLabel}</p>
                        <ul className="space-y-2.5">
                          {p.solution.map((x) => (
                            <li key={x} className="flex items-start gap-2.5 text-[13px] text-slate-700 font-medium leading-snug">
                              <span className="mt-[5px] w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                              {x}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="rounded-xl bg-emerald-50/80 border border-emerald-100 p-4">
                        <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-[0.22em] mb-2.5 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                          {tp.resultsLabel}
                        </p>
                        <ul className="space-y-1.5">
                          {p.result.map((x) => (
                            <li key={x} className="flex items-start gap-2 text-[12px] font-semibold text-emerald-900">
                              <span className="mt-[5px] w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                              {x}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* FEATURED / RECENT */}
      <section className="bg-slate-200/50 border-y border-slate-300 py-28 relative z-10 shadow-inner">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center mb-20">
            <span className="inline-block py-1.5 px-4 rounded-full bg-indigo-100 text-indigo-800 text-[11px] font-semibold tracking-[0.2em] mb-4 border border-indigo-200 shadow-sm">
              {tp.recentBadge}
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-slate-950 md:text-5xl">
              {tp.recentH2}
            </h2>
            <p className="mt-6 text-slate-700 max-w-2xl mx-auto text-lg font-medium">
              {tp.recentDesc}
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-2">
            {tp.recentProjects.map((p, idx) => {
              const Icon = RECENT_ICON_CMPS[idx];
              const sector = p.sector as Sector;
              return (
                <motion.article
                  key={p.title + p.sector}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.1 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="group relative bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_-6px_rgba(0,0,0,0.07)] hover:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.12)] hover:-translate-y-1.5 transition-all duration-500 flex flex-col overflow-hidden"
                >
                  <div className={`h-[3px] w-full shrink-0 ${sectorAccent[sector]}`} />
                  <div className={`absolute inset-0 bg-gradient-to-br ${sectorHoverGlow[sector]} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />

                  <div className="relative z-10 p-7 md:p-8 flex flex-col flex-1">
                    <div className="flex items-start gap-4 mb-7">
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${sectorIconColors[sector]} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2.5">
                          <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[10px] font-bold uppercase tracking-wider rounded-md">
                            {tp.recentLabel}
                          </span>
                          <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md border ${sectorBadgeColors[sector]}`}>
                            {p.sector}
                          </span>
                          {p.client && (
                            <span className="px-2.5 py-0.5 bg-slate-900 text-white text-[10px] font-bold tracking-wider rounded-md">
                              {p.client}
                            </span>
                          )}
                        </div>
                        <h3 className="text-[17px] font-bold text-slate-950 leading-snug group-hover:text-blue-700 transition-colors duration-300">
                          {p.title}
                        </h3>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-7">
                      {RECENT_TECH_DATA[idx]?.map((tech) => (
                        <span key={tech} className="px-3 py-1 bg-white text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 shadow-sm">
                          {tech}
                        </span>
                      ))}
                    </div>

                    <div className="mt-auto rounded-xl bg-slate-50 border border-slate-200/80 p-5">
                      <p className="text-[9px] font-bold tracking-[0.22em] text-slate-400 uppercase mb-4">
                        {tp.highlightsLabel}
                      </p>
                      <ul className="space-y-3">
                        {p.highlights.map((x) => (
                          <li key={x} className="flex gap-3 items-start text-[13px] text-slate-800 font-medium leading-snug">
                            <span className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.5)]" />
                            <span>{x}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white py-24 relative z-10 h-[50vh] flex flex-col justify-center items-center">
        <div className="relative mx-auto max-w-4xl px-4 text-center">
          <motion.div {...fadeUp}>
            <h2 className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tighter text-slate-950 mb-8 drop-shadow-sm">{tp.ctaH2}</h2>
            <p className="text-slate-700 mb-12 text-xl md:text-2xl font-bold max-w-3xl mx-auto leading-relaxed">
              {tp.ctaDesc}
            </p>
            <Link href="/contacto" className="inline-flex items-center justify-center rounded-full bg-blue-700 px-12 py-5 text-lg font-black text-white shadow-[0_20px_50px_-10px_rgba(29,78,216,0.5)] transition-all duration-300 hover:bg-blue-800 hover:shadow-[0_25px_60px_-10px_rgba(29,78,216,0.6)] hover:-translate-y-1.5 active:scale-95">
              {tp.ctaBtn}
              <ArrowRight className="ml-3 w-6 h-6" />
            </Link>
            <p className="mt-12 text-[10px] font-black text-slate-500 tracking-[0.25em] uppercase">
              {tp.ctaNote} &bull; {tp.ctaNote2} &bull; {tp.ctaNote3}
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
