"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Building2, Factory, Landmark, Shield, Camera, KeyRound, Zap, Network } from "lucide-react";

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

const fadeUp = { initial: { opacity: 0, y: 16 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.12 as const }, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } };

export default function Proyectos() {
  const [filter, setFilter] = useState<"Todos" | Sector>("Todos");
  const filtered = useMemo(() => filter === "Todos" ? PROJECTS : PROJECTS.filter((p) => p.sector === filter), [filter]);

  return (
    <div>
      {/* HERO */}
      <section className="dark-section noise relative border-b border-white/[0.06]">
        <div className="relative mx-auto max-w-6xl px-4 py-16">
          <motion.div {...fadeUp}>
            <p className="text-[10px] font-bold tracking-[0.25em] text-brand-300">PROYECTOS Y EXPERIENCIA</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-white">Implementaciones para entornos enterprise</h1>
            <p className="mt-4 max-w-3xl text-white/55">Casos tipo (sin datos sensibles) en automatización, seguridad electrónica y energía.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/contacto" className="btn-glass-primary">Agendar reunión técnica</Link>
              <Link href="/soluciones" className="btn-glass">Ver soluciones</Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-2">{["Banca nacional", "Partners internacionales", "Proyectos enterprise", "+1500 obras", "28 años"].map((t) => <span key={t} className="tag-glass">{t}</span>)}</div>
            <div className="mt-10 flex flex-wrap gap-2">{FILTERS.map((f) => { const active = filter === f.key; return (<button key={f.key} onClick={() => setFilter(f.key)} className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${active ? "border-brand-400 bg-brand-600 text-white shadow-md shadow-brand-600/25" : "border-white/10 bg-white/[0.04] text-white/65 hover:bg-white/[0.08] hover:text-white"}`}>{f.icon}{f.label}</button>); })}</div>
          </motion.div>
        </div>
      </section>

      {/* GRID */}
      <section className="relative border-t border-white/[0.06]">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <motion.div layout className="grid gap-5 md:grid-cols-2" {...fadeUp}>
            {filtered.map((p) => (
              <motion.article key={p.title} layout className="lg-card p-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl border border-brand-400/20 bg-brand-500/10 p-2 text-brand-300">{p.icon}</div>
                    <div><h2 className="text-lg font-semibold text-white">{p.title}</h2><p className="mt-1 text-sm text-white/55">Sector: <span className="font-medium text-brand-300">{p.sector}</span></p></div>
                  </div>
                  <Link href="/contacto" className="btn-glass hidden text-sm !px-4 !py-2 md:inline-flex">Solicitar propuesta</Link>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">{p.scope.map((s) => <span key={s} className="tag-glass">{s}</span>)}</div>
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <div><p className="text-[10px] font-bold tracking-[0.25em] text-brand-400">ALCANCE</p><ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-white/55">{p.scope.slice(0,4).map((x) => <li key={x}>{x}</li>)}</ul></div>
                  <div><p className="text-[10px] font-bold tracking-[0.25em] text-brand-400">SOLUCIÓN</p><ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-white/55">{p.solution.map((x) => <li key={x}>{x}</li>)}</ul></div>
                  <div><p className="text-[10px] font-bold tracking-[0.25em] text-brand-400">RESULTADO</p><ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-white/55">{p.result.map((x) => <li key={x}>{x}</li>)}</ul></div>
                </div>
                <div className="mt-6 md:hidden"><Link href="/contacto" className="btn-glass w-full text-center text-sm">Solicitar propuesta</Link></div>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FEATURED */}
      <section className="dark-section noise relative overflow-hidden border-t border-white/[0.06]">
        <div className="liquid-orb liquid-orb-1 -top-24 left-1/2 h-72 w-[700px] -translate-x-1/2 bg-brand-500/8" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 text-white">
          <motion.div {...fadeUp} className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div><p className="text-[10px] font-bold tracking-[0.25em] text-brand-300">ÚLTIMAS IMPLEMENTACIONES</p><h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">Despliegues recientes en entornos enterprise</h2><p className="mt-4 max-w-3xl text-white/55">Resumen operativo (sin datos sensibles).</p></div>
            <Link href="/contacto" className="btn-glass-primary">Solicitar consultoría</Link>
          </motion.div>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {RECENT_PROJECTS.map((p) => (
              <article key={p.title + p.sector} className="lg-card p-7">
                <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-brand-400/30 to-transparent" />
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3 text-white">{p.icon}</div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="tag-glass !border-brand-400/25 !bg-brand-500/12 !text-brand-200">Reciente</span>
                      <span className="tag-glass">{p.sector}</span>
                      {p.client && <span className="tag-glass">{p.client}</span>}
                    </div>
                    <h3 className="mt-3 text-xl font-semibold leading-snug">{p.title}</h3>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">{p.tech.map((t) => <span key={t} className="tag-glass">{t}</span>)}</div>
                <div className="mt-6"><p className="text-[10px] font-bold tracking-[0.2em] text-white/40">RESUMEN</p><ul className="mt-3 space-y-2 text-sm text-white/60">{p.highlights.map((x) => <li key={x} className="flex gap-2"><span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400/50" /><span>{x}</span></li>)}</ul></div>
              </article>
            ))}
          </div>
          <p className="mt-8 text-xs text-white/30">*Algunos detalles se omiten para proteger información sensible.</p>
        </div>
      </section>

      {/* CTA */}
      <section className="dark-section noise relative border-t border-white/[0.06]">
        <div className="relative mx-auto max-w-6xl px-4 py-20 text-white">
          <motion.div {...fadeUp} className="grid gap-8 md:grid-cols-12 md:items-center">
            <div className="md:col-span-8"><h2 className="text-3xl font-bold tracking-tight">Conversemos sobre tu proyecto</h2><p className="mt-3 text-white/55">Coordinamos una reunión técnica para levantar requerimientos.</p></div>
            <div className="md:col-span-4 md:text-right">
              <Link href="/contacto" className="btn-glass-primary w-full md:w-auto">Agendar reunión técnica</Link>
              <p className="mt-3 text-xs text-white/35">Enfoque enterprise &bull; Documentación &bull; Puesta en marcha</p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
