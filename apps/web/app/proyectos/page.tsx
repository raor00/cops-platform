"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Factory, Landmark, Shield, Camera, KeyRound, Zap, Network, ArrowRight } from "lucide-react";

type Sector = "Banca" | "Industrial" | "Comercial" | "Gubernamental" | "Mixto";
type Project = { title: string; sector: Sector; scope: string[]; solution: string[]; result: string[]; icon: ReactNode };

const PROJECTS: Project[] = [
  { title: "Estandarización de video y operación multi-sede", sector: "Banca", scope: ["Arquitectura", "Estandarización", "Control por roles", "Auditoría"], solution: ["Diseño de arquitectura escalable", "Integración con VMS y políticas de acceso", "Estrategia de almacenamiento y retención"], result: ["Operación centralizada y controlada", "Mejora de trazabilidad y auditoría", "Escalabilidad para nuevas sedes"], icon: <Camera className="h-5 w-5" /> },
  { title: "Control de acceso y trazabilidad de visitantes", sector: "Banca", scope: ["Accesos", "Visitantes", "Reportes", "Cumplimiento"], solution: ["Flujos de acceso por áreas y niveles", "Gestión de credenciales y visitantes", "Reportes operativos y auditoría"], result: ["Mayor control por zonas", "Registro confiable", "Mejor operación"], icon: <KeyRound className="h-5 w-5" /> },
  { title: "Automatización y monitoreo de infraestructura", sector: "Industrial", scope: ["Monitoreo", "Alarmas", "Integración", "Continuidad operativa"], solution: ["Levantamiento y definición de puntos críticos", "Integración de señales y alertas", "Tableros de monitoreo y procedimientos"], result: ["Respuesta más rápida", "Reducción de fallas", "Mejor visibilidad"], icon: <Network className="h-5 w-5" /> },
  { title: "Seguridad electrónica integral para instalación crítica", sector: "Gubernamental", scope: ["CCTV", "Analítica", "Perímetro", "Operación"], solution: ["Diseño de cobertura y zonificación", "Analítica alineada a riesgos", "Documentación y puesta en marcha"], result: ["Cobertura alineada", "Mejor detección", "Operación eficiente"], icon: <Shield className="h-5 w-5" /> },
  { title: "Edificios inteligentes y gestión de servicios", sector: "Comercial", scope: ["BMS", "Eficiencia", "Alarmas", "Mantenimiento"], solution: ["Integración de subsistemas", "Tableros de operación", "Mantenimiento preventivo"], result: ["Mayor control", "Optimización", "Planificación"], icon: <Building2 className="h-5 w-5" /> },
  { title: "Respaldo de energía para continuidad operativa", sector: "Mixto", scope: ["Energía", "Respaldo", "Protección", "Disponibilidad"], solution: ["Evaluación de cargas", "Diseño de respaldo", "Implementación y pruebas"], result: ["Mayor disponibilidad", "Protección eléctrica", "Continuidad"], icon: <Zap className="h-5 w-5" /> },
];

type RecentProject = { title: string; sector: Sector; client?: string; tech: string[]; highlights: string[]; icon: ReactNode };
const RECENT_PROJECTS: RecentProject[] = [
  { title: "Modernización de agencias (modelos piloto)", sector: "Banca", client: "Bancaribe", tech: ["Hikvision", "CCTV", "Control de acceso", "Alarma", "Analíticas", "IA"], highlights: ["CCTV, alarma y control de acceso con analíticas e IA", "Arquitectura preparada para replicar en nuevas sedes", "Estandarización operativa"], icon: <Landmark className="h-5 w-5" /> },
  { title: "Sustitución de plataforma VMS + Control de acceso", sector: "Industrial", client: "Cigarrera Bigott", tech: ["Milestone", "Invenzi", "Migración", "VMS", "Control de acceso", "Multi-sede"], highlights: ["Invenzi + Milestone en planta y sucursales", "Reemplazo de Lenel con enfoque enterprise", "Integración multi-sede"], icon: <Factory className="h-5 w-5" /> },
];

const FILTERS: { key: "Todos" | Sector; label: string; icon: React.ReactNode }[] = [
  { key: "Todos", label: "Todos", icon: <Factory className="h-4 w-4" /> }, { key: "Banca", label: "Banca", icon: <Landmark className="h-4 w-4" /> }, { key: "Industrial", label: "Industrial", icon: <Factory className="h-4 w-4" /> }, { key: "Comercial", label: "Comercial", icon: <Building2 className="h-4 w-4" /> }, { key: "Gubernamental", label: "Gubernamental", icon: <Shield className="h-4 w-4" /> }, { key: "Mixto", label: "Mixto", icon: <Network className="h-4 w-4" /> },
];

const fadeUp = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.1 }, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } };
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
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
};

export default function Proyectos() {
  const [filter, setFilter] = useState<"Todos" | Sector>("Todos");
  const filtered = useMemo(() => filter === "Todos" ? PROJECTS : PROJECTS.filter((p) => p.sector === filter), [filter]);

  return (
    <div className="bg-[#f3f4f6] min-h-screen pt-24 font-sans text-slate-950 relative overflow-hidden">

      {/* Animated Background Elements - intensified for more depth */}
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
      <section className="relative bg-white/60 backdrop-blur-xl border-b border-slate-300 pt-20 pb-16 z-10 shadow-sm">
        <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none"></div>
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center max-w-3xl mx-auto">
            <span className="inline-block py-1.5 px-4 rounded-full bg-blue-100 border border-blue-200 text-blue-700 text-[11px] font-black tracking-[0.2em] mb-6 shadow-sm">
              PROYECTOS Y EXPERIENCIA
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 mb-6 drop-shadow-sm">
              Despliegues para <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">entornos enterprise</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 mb-10 leading-relaxed font-medium">
              Casos tipo en automatización, seguridad electrónica y energía. Garantizando continuidad operativa ininterrumpida.
            </p>

            <div className="flex flex-wrap justify-center gap-3 mb-12 relative z-20">
              {["Banca nacional", "Partners internacionales", "+1500 obras", "28 años trayectoria"].map((t) => (
                <span key={t} className="px-4 py-1.5 bg-white/80 text-slate-950 text-xs font-semibold rounded-full border border-slate-400/30 shadow-[0_2px_10px_rgba(0,0,0,0.05)] backdrop-blur-md">
                  {t}
                </span>
              ))}
            </div>

            {/* FILTERS */}
            <div className="flex flex-wrap justify-center gap-3">
              {FILTERS.map((f) => {
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
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="grid gap-8 md:grid-cols-2 lg:grid-cols-2"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((p) => (
                <motion.article
                  key={p.title}
                  variants={staggerItem}
                  layout
                  className="group relative bg-white rounded-2xl border border-slate-300/60 p-6 md:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-500 flex flex-col overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-blue-100/30 to-transparent rounded-bl-full opacity-60 group-hover:scale-125 transition-transform duration-700 pointer-events-none" />

                  <div className="flex items-start gap-5 mb-8 relative z-10">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 border border-blue-100 shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                      {p.icon}
                    </div>
                    <div>
                      <h2 className="text-xl md:text-2xl font-bold text-slate-950 leading-tight mb-2 group-hover:text-blue-700 transition-colors">{p.title}</h2>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-[0.15em]">SECTOR</span>
                        <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-[11px] font-semibold rounded-md border border-blue-200/50 shadow-sm">{p.sector}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-10 relative z-10">
                    {p.scope.map((s) => (
                      <span key={s} className="px-3 py-1 bg-slate-200/70 text-slate-900 text-[11px] font-semibold uppercase tracking-wider rounded-lg border border-slate-300 shadow-sm group-hover:bg-slate-200 group-hover:border-slate-400 transition-colors">
                        {s}
                      </span>
                    ))}
                  </div>

                  <div className="grid gap-6 sm:grid-cols-3 mt-auto pt-8 border-t border-slate-200 relative z-10">
                    <div>
                      <p className="text-[10px] font-bold tracking-[0.2em] text-blue-600 mb-3 bg-blue-50 inline-block px-2 py-0.5 rounded">ALCANCE</p>
                      <ul className="space-y-3 text-sm text-slate-700 font-medium">
                        {p.scope.slice(0, 3).map((x) => (
                          <li key={x} className="flex items-start gap-2.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                            <span className="leading-snug">{x}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold tracking-[0.2em] text-indigo-600 mb-3 bg-indigo-50 inline-block px-2 py-0.5 rounded">SOLUCION</p>
                      <ul className="space-y-3 text-sm text-slate-700 font-medium">
                        {p.solution.map((x) => (
                          <li key={x} className="flex items-start gap-2.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                            <span className="leading-snug">{x}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold tracking-[0.2em] text-emerald-700 mb-3 bg-emerald-100 inline-block px-2 py-0.5 rounded shadow-sm border border-emerald-200/50">RESULTADO</p>
                      <ul className="space-y-3 text-sm text-slate-900 font-bold">
                        {p.result.map((x) => (
                          <li key={x} className="flex items-start gap-2.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                            <span className="leading-snug">{x}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* FEATURED / RECENT */}
      <section className="bg-slate-200/50 border-y border-slate-300 py-28 relative z-10 shadow-inner">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center mb-20">
            <span className="inline-block py-1.5 px-4 rounded-full bg-indigo-100 text-indigo-800 text-[11px] font-semibold tracking-[0.2em] mb-4 border border-indigo-200 shadow-sm">
              ULTIMAS IMPLEMENTACIONES
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-slate-950 md:text-5xl">
              Despliegues recientes
            </h2>
            <p className="mt-6 text-slate-700 max-w-2xl mx-auto text-lg font-medium">
              Resumen operativo de proyectos recien entregados destacando topología y tecnologías implementadas.
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-2">
            {RECENT_PROJECTS.map((p) => (
              <motion.article
                key={p.title + p.sector}
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-2xl border border-slate-300 p-6 md:p-8 shadow-lg shadow-slate-200/50"
              >
                <div className="flex items-start gap-5 mb-8">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-950 border border-slate-300 shadow-sm transition-transform group-hover:scale-110">
                    {p.icon}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="px-2.5 py-1 bg-gradient-to-r from-blue-700 to-indigo-700 text-white text-[10px] font-semibold uppercase tracking-wider rounded shadow-md">Reciente</span>
                      <span className="px-2.5 py-1 bg-slate-200 text-slate-900 border border-slate-400/40 text-[10px] font-semibold uppercase tracking-wider rounded">{p.sector}</span>
                      {p.client && <span className="px-2.5 py-1 bg-slate-950 text-white text-[10px] font-semibold tracking-wider rounded shadow-md">{p.client}</span>}
                    </div>
                    <h3 className="text-xl font-bold text-slate-950 leading-snug">{p.title}</h3>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-8">
                  {p.tech.map((t) => (
                    <span key={t} className="px-3 py-1 bg-slate-200/50 text-slate-950 text-xs font-semibold rounded-lg border border-slate-400/30">
                      {t}
                    </span>
                  ))}
                </div>

                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                  <p className="text-[11px] font-bold tracking-[0.2em] text-slate-500 mb-4 flex items-center gap-2">
                    <ArrowRight className="w-3 h-3" />
                    HIGHLIGHTS
                  </p>
                  <ul className="space-y-4 text-sm text-slate-800 font-medium">
                    {p.highlights.map((x) => (
                      <li key={x} className="flex gap-3 items-start">
                        <span className="mt-[6px] h-2 w-2 shrink-0 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.6)]" />
                        <span className="leading-relaxed">{x}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white py-24 relative z-10 h-[50vh] flex flex-col justify-center items-center">
        <div className="relative mx-auto max-w-4xl px-4 text-center">
          <motion.div {...fadeUp}>
            <h2 className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tighter text-slate-950 mb-8 drop-shadow-sm">Conversemos sobre tu proyecto</h2>
            <p className="text-slate-700 mb-12 text-xl md:text-2xl font-bold max-w-3xl mx-auto leading-relaxed">
              Coordinamos una reunión técnica para levantar los requerimientos de tu instalación a medida con enfoque enterprise.
            </p>
            <Link href="/contacto" className="inline-flex items-center justify-center rounded-full bg-blue-700 px-12 py-5 text-lg font-black text-white shadow-[0_20px_50px_-10px_rgba(29,78,216,0.5)] transition-all duration-300 hover:bg-blue-800 hover:shadow-[0_25px_60px_-10px_rgba(29,78,216,0.6)] hover:-translate-y-1.5 active:scale-95">
              Agendar reunión técnica
              <ArrowRight className="ml-3 w-6 h-6" />
            </Link>
            <p className="mt-12 text-[10px] font-black text-slate-500 tracking-[0.25em] uppercase">
              Ingeniería &bull; Documentación QA &bull; Mantenimiento
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
