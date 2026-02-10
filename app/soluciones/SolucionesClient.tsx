"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";

type Key = "VMS" | "ACCESO" | "ALARMAS" | "IA" | "BMS" | "ENERGIA";
type Solution = { key: Key; title: string; desc: string; bullets: string[]; applies: string[]; tags: string[] };

const FILTERS: { key: "TODOS" | Key; label: string }[] = [{ key: "TODOS", label: "Todas" }, { key: "VMS", label: "VMS / CCTV" }, { key: "ACCESO", label: "Control de acceso" }, { key: "ALARMAS", label: "Alarmas" }, { key: "IA", label: "Analíticas + IA" }, { key: "BMS", label: "BMS" }, { key: "ENERGIA", label: "Energía" }];

const SOLUTIONS: Solution[] = [
  { key: "VMS", title: "VMS / Gestión de video (CCTV)", desc: "Estandarización, operación multi-sede, auditoría y control por roles para entornos enterprise.", bullets: ["Arquitectura de VMS escalable", "Políticas de acceso (roles/permisos)", "Estrategia de almacenamiento y retención", "Operación centralizada y trazabilidad"], applies: ["Banca", "Industrial", "Comercial", "Gubernamental"], tags: ["Multi-sede", "Auditoría", "Retención"] },
  { key: "ACCESO", title: "Control de acceso e identidades", desc: "Gestión de accesos, visitantes y reportes para entornos regulados.", bullets: ["Zonificación y reglas por áreas", "Credenciales, perfiles y visitantes", "Reportes, alertas y auditoría", "Integración con video y eventos"], applies: ["Banca", "Industrial", "Comercial", "Gubernamental"], tags: ["Visitantes", "Reglas", "Auditoría"] },
  { key: "ALARMAS", title: "Alarmas e intrusión", desc: "Diseño y operación de eventos para respuesta rápida.", bullets: ["Zonificación y sensores por riesgo", "Recepción de eventos y escalamiento", "Integración con CCTV y control de acceso", "Procedimientos y pruebas (QA) operativas"], applies: ["Banca", "Industrial", "Comercial", "Gubernamental"], tags: ["Eventos", "Respuesta", "Integración"] },
  { key: "IA", title: "Analíticas + IA para operación", desc: "Analíticas alineadas al riesgo para detección y automatización.", bullets: ["Analíticas por escenarios (no genéricas)", "Alarmas inteligentes", "Evidencia y trazabilidad para auditoría", "Automatización de flujos operativos"], applies: ["Banca", "Industrial", "Comercial", "Gubernamental"], tags: ["Detección", "Automatización", "Riesgo"] },
  { key: "BMS", title: "Edificios inteligentes (BMS)", desc: "Monitoreo y control para eficiencia operativa y continuidad.", bullets: ["Monitoreo y control de subsistemas", "Tableros de operación y alarmas", "Procedimientos y mantenimiento preventivo", "Optimización operativa y energética"], applies: ["Industrial", "Comercial", "Gubernamental"], tags: ["Monitoreo", "Alarmas", "Eficiencia"] },
  { key: "ENERGIA", title: "Energía y respaldo", desc: "Continuidad operativa: protección, respaldo y disponibilidad.", bullets: ["Evaluación de cargas y criticidad", "Diseño de protección y respaldo", "Pruebas y protocolos operativos", "Mantenimiento y continuidad"], applies: ["Banca", "Industrial", "Comercial", "Gubernamental"], tags: ["Disponibilidad", "Protección", "Respaldo"] },
];

const PROCESS = [{ n: "01", t: "Levantamiento", d: "Requerimientos, riesgos, alcance." }, { n: "02", t: "Arquitectura", d: "Diseño, dimensionamiento, integración." }, { n: "03", t: "Implementación", d: "Instalación, integración, hardening." }, { n: "04", t: "Puesta en marcha", d: "Pruebas, QA, actas, capacitación." }, { n: "05", t: "Soporte", d: "Mantenimiento, mejoras, continuidad." }];

const DELIVERABLES = ["Levantamiento y alcance (matriz de requerimientos)", "Arquitectura (diagramas, zonificación, criterios de retención)", "Documentación técnica y operativa (runbooks, procedimientos)", "Plan de pruebas (QA) + actas de entrega", "Capacitación y acompañamiento post-implementación"];

const fadeUp = { initial: { opacity: 0, y: 16 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.12 as const }, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } };

export default function SolucionesClient() {
  const [filter, setFilter] = useState<"TODOS" | Key>("TODOS");
  const filtered = useMemo(() => filter === "TODOS" ? SOLUTIONS : SOLUTIONS.filter((s) => s.key === filter), [filter]);

  return (
    <main>
      {/* HERO */}
      <section className="dark-section noise relative border-b border-white/[0.06]">
        <div className="relative mx-auto max-w-6xl px-4 py-20">
          <motion.div {...fadeUp}>
            <p className="text-[10px] font-bold tracking-[0.25em] text-brand-300">SOLUCIONES</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-white">Arquitectura, integración y operación para entornos críticos</h1>
            <p className="mt-4 max-w-3xl text-white/55">Soluciones enterprise en VMS/CCTV, control de acceso, alarmas, analíticas con IA, BMS y energía.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/contacto" className="btn-glass-primary">Agendar reunión técnica</Link>
              <Link href="/proyectos" className="btn-glass">Ver proyectos</Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              {["Banca nacional", "Proyectos enterprise", "Partners internacionales", "Documentación y QA", "Operación multi-sede"].map((t) => <span key={t} className="tag-glass">{t}</span>)}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Areas + filters */}
      <section className="relative border-t border-white/[0.06]">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <motion.div {...fadeUp}>
            <h2 className="text-3xl font-bold tracking-tight text-white">Áreas de servicio</h2>
            <p className="mt-2 max-w-3xl text-white/55">Implementación, integración y soporte con foco en calidad y continuidad.</p>
            <div className="mt-8 flex flex-wrap gap-2">
              {FILTERS.map((f) => { const active = filter === f.key; return (
                <button key={f.key} onClick={() => setFilter(f.key)} className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${active ? "border-brand-400 bg-brand-600 text-white shadow-md shadow-brand-600/25" : "border-white/10 bg-white/[0.04] text-white/65 hover:bg-white/[0.08] hover:text-white"}`}>{f.label}</button>
              ); })}
            </div>
          </motion.div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {filtered.map((s, i) => (
              <motion.article key={s.title} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.04 }} className="lg-card p-6">
                <h3 className="font-semibold text-white">{s.title}</h3>
                <p className="mt-2 text-sm text-white/55">{s.desc}</p>
                <div className="mt-4 flex flex-wrap gap-2">{s.tags.slice(0, 3).map((t) => <span key={t} className="tag-glass">{t}</span>)}</div>
                <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-white/55">{s.bullets.map((x) => <li key={x}>{x}</li>)}</ul>
                <p className="mt-4 text-[10px] font-bold tracking-[0.25em] text-brand-400">APLICA EN</p>
                <div className="mt-2 flex flex-wrap gap-2">{s.applies.map((a) => <span key={a} className="tag-glass">{a}</span>)}</div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Entregables */}
      <section className="dark-section noise relative border-y border-white/[0.06]">
        <div className="relative mx-auto max-w-6xl px-4 py-20">
          <motion.div {...fadeUp} className="grid gap-10 md:grid-cols-12 md:items-start">
            <div className="md:col-span-5">
              <p className="text-[10px] font-bold tracking-[0.25em] text-brand-300">ENTREGABLES</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-white">No es solo implementar: es dejar operación lista</h2>
              <p className="mt-3 text-white/55">En proyectos enterprise, el valor está en la arquitectura, trazabilidad y documentación.</p>
            </div>
            <div className="md:col-span-7">
              <div className="lg-card p-6">
                <ul className="space-y-3">{DELIVERABLES.map((d) => (<li key={d} className="flex items-start gap-3"><span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-brand-400" /><span className="text-sm text-white/70">{d}</span></li>))}</ul>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Link href="/contacto" className="btn-glass-primary">Agendar reunión técnica</Link>
                  <Link href="/partners" className="btn-glass">Ver partners</Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Metodología */}
      <section id="metodologia" className="relative border-t border-white/[0.06]">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <motion.div {...fadeUp}><h2 className="text-3xl font-bold tracking-tight text-white">Metodología</h2><p className="mt-2 max-w-3xl text-white/55">Estructura clara para resultados consistentes.</p></motion.div>
          <div className="mt-10 grid gap-4 md:grid-cols-5">
            {PROCESS.map((p, i) => (<motion.div key={p.n} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.04 }} className="lg-card p-6"><p className="text-xs font-bold text-brand-400">{p.n}</p><h3 className="mt-2 font-semibold text-white">{p.t}</h3><p className="mt-2 text-sm text-white/55">{p.d}</p></motion.div>))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="dark-section noise relative">
        <div className="relative mx-auto max-w-6xl px-4 py-20 text-white">
          <motion.div {...fadeUp} className="grid gap-8 md:grid-cols-12 md:items-center">
            <div className="md:col-span-8"><h2 className="text-3xl font-bold tracking-tight">¿Buscas una solución enterprise con 28 años de respaldo?</h2><p className="mt-3 text-white/55">Agendemos una reunión técnica para levantar requerimientos.</p></div>
            <div className="md:col-span-4 md:text-right">
              <Link href="/contacto" className="btn-glass-primary w-full md:w-auto">Agendar reunión técnica</Link>
              <p className="mt-3 text-xs text-white/35">Banca nacional &bull; Proyectos enterprise &bull; Partners internacionales</p>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
