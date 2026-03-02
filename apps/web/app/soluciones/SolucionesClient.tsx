"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Video, Fingerprint, Bell, BrainCircuit, Building2, Zap, Calendar, ExternalLink } from "lucide-react";

type Key = "VMS" | "ACCESO" | "ALARMAS" | "IA" | "BMS" | "ENERGIA";
type Solution = { key: Key; title: string; desc: string; bullets: string[]; applies: string[]; tags: string[]; iconName: string };

const FILTERS: { key: "TODOS" | Key; label: string }[] = [{ key: "TODOS", label: "Todas" }, { key: "VMS", label: "VMS / CCTV" }, { key: "ACCESO", label: "Control de acceso" }, { key: "ALARMAS", label: "Alarmas" }, { key: "IA", label: "Analíticas + IA" }, { key: "BMS", label: "BMS" }, { key: "ENERGIA", label: "Energía" }];

const SOLUTIONS: Solution[] = [
  { key: "VMS", title: "VMS / Gestión de video (CCTV)", desc: "Estandarización, operación multi-sede, auditoría y control por roles para entornos enterprise.", bullets: ["Arquitectura de VMS escalable", "Políticas de acceso (roles/permisos)", "Estrategia de almacenamiento y retención", "Operación centralizada y trazabilidad"], applies: ["Banca", "Industrial", "Comercial", "Gubernamental"], tags: ["Multi-sede", "Auditoría", "Retención"], iconName: "Video" },
  { key: "ACCESO", title: "Control de acceso e identidades", desc: "Gestión de accesos, visitantes y reportes para entornos regulados.", bullets: ["Zonificación y reglas por áreas", "Credenciales, perfiles y visitantes", "Reportes, alertas y auditoría", "Integración con video y eventos"], applies: ["Banca", "Industrial", "Comercial", "Gubernamental"], tags: ["Visitantes", "Reglas", "Auditoría"], iconName: "Fingerprint" },
  { key: "ALARMAS", title: "Alarmas e intrusión", desc: "Diseño y operación de eventos para respuesta rápida.", bullets: ["Zonificación y sensores por riesgo", "Recepción de eventos y escalamiento", "Integración con CCTV y control de acceso", "Procedimientos y pruebas (QA) operativas"], applies: ["Banca", "Industrial", "Comercial", "Gubernamental"], tags: ["Eventos", "Respuesta", "Integración"], iconName: "Bell" },
  { key: "IA", title: "Analíticas + IA para operación", desc: "Analíticas alineadas al riesgo para detección y automatización.", bullets: ["Analíticas por escenarios (no genéricas)", "Alarmas inteligentes", "Evidencia y trazabilidad para auditoría", "Automatización de flujos operativos"], applies: ["Banca", "Industrial", "Comercial", "Gubernamental"], tags: ["Detección", "Automatización", "Riesgo"], iconName: "BrainCircuit" },
  { key: "BMS", title: "Edificios inteligentes (BMS)", desc: "Monitoreo y control para eficiencia operativa y continuidad.", bullets: ["Monitoreo y control de subsistemas", "Tableros de operación y alarmas", "Procedimientos y mantenimiento preventivo", "Optimización operativa y energética"], applies: ["Industrial", "Comercial", "Gubernamental"], tags: ["Monitoreo", "Alarmas", "Eficiencia"], iconName: "Building2" },
  { key: "ENERGIA", title: "Energía y respaldo", desc: "Continuidad operativa: protección, respaldo y disponibilidad.", bullets: ["Evaluación de cargas y criticidad", "Diseño de protección y respaldo", "Pruebas y protocolos operativos", "Mantenimiento y continuidad"], applies: ["Banca", "Industrial", "Comercial", "Gubernamental"], tags: ["Disponibilidad", "Protección", "Respaldo"], iconName: "Zap" },
];

const ICONS: Record<string, any> = {
  Video, Fingerprint, Bell, BrainCircuit, Building2, Zap
};



const DELIVERABLES = ["Levantamiento y alcance (matriz de requerimientos)", "Arquitectura (diagramas, zonificación, criterios de retención)", "Documentación técnica y operativa (runbooks, procedimientos)", "Plan de pruebas (QA) + actas de entrega", "Capacitación y acompañamiento post-implementación"];

const fadeUp = { initial: { opacity: 0, y: 16 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.12 as const }, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } };

export default function SolucionesClient() {
  const [filter, setFilter] = useState<"TODOS" | Key>("TODOS");
  const filtered = useMemo(() => filter === "TODOS" ? SOLUTIONS : SOLUTIONS.filter((s) => s.key === filter), [filter]);

  return (
    <main className="bg-slate-50 min-h-screen">
      {/* HERO */}
      <section className="relative pt-20 pb-20 md:pt-28 md:pb-28 px-4 bg-white/60 backdrop-blur-3xl border-b border-slate-200 z-10">
        <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none"></div>
        <div className="mx-auto max-w-6xl text-center">
          <motion.div {...fadeUp} className="flex flex-col items-center">
            <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600 ring-1 ring-inset ring-blue-600/20 mb-6 uppercase tracking-widest shadow-sm">
              SOLUCIONES
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tight text-slate-900 mb-6 drop-shadow-sm leading-[1.1]">
              Arquitectura, integración y <br className="hidden lg:block" /> operación para entornos <br className="hidden lg:block" /> críticos
            </h1>
            <p className="max-w-3xl text-lg font-medium text-slate-600 leading-relaxed mx-auto mb-10">
              Soluciones enterprise en VMS/CCTV, control de acceso, alarmas, analíticas con IA, BMS y energía.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto mb-12">
              <Link href="/contacto" className="inline-flex justify-center items-center gap-2 rounded-full bg-blue-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all hover:-translate-y-0.5 hover:shadow-xl">
                Agendar reunión técnica <Calendar className="w-4 h-4 ml-1" />
              </Link>
              <Link href="/proyectos" className="inline-flex justify-center items-center gap-2 rounded-full bg-white border border-slate-200 px-8 py-3.5 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-all hover:text-slate-900">
                Ver proyectos
              </Link>
            </div>
            <div className="flex flex-wrap justify-center gap-2 relative z-20">
              {["Banca nacional", "Proyectos enterprise", "Partners internacionales", "Documentación y QA", "Operación multi-sede"].map((t) => (
                <span key={t} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-[11px] font-bold uppercase tracking-wider rounded-md shadow-sm">
                  {t}
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
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Áreas de servicio</h2>
            <p className="text-[15px] font-medium text-slate-500 mb-10 max-w-2xl">
              Implementación, integración y soporte con foco en calidad y continuidad operativa.
            </p>
            <div className="flex flex-wrap gap-2.5 overflow-x-auto pb-4 scrollbar-hide">
              {FILTERS.map((f) => {
                const active = filter === f.key;
                return (
                  <button key={f.key} onClick={() => setFilter(f.key)} className={`px-5 py-2.5 rounded-full text-[13px] font-bold tracking-wide transition-all whitespace-nowrap ${active ? "bg-blue-700 text-white shadow-md shadow-blue-500/20" : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-100"}`}>{f.label}</button>
                );
              })}
            </div>
          </motion.div>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((s, i) => {
              const IconComponent = ICONS[s.iconName];
              return (
                <motion.article key={s.title} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.04 }} className="group relative bg-white rounded-3xl border border-slate-200 p-8 shadow-sm hover:shadow-[0_15px_30px_-5px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col h-full hover:-translate-y-1 overflow-hidden">
                  <div className="mb-8">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-5">
                      <IconComponent className="h-5 w-5 stroke-[2.5px]" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-700 transition-colors">{s.title}</h3>
                    <p className="text-[14px] font-medium text-slate-500 leading-relaxed mb-6">
                      {s.desc}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-8">
                      {s.tags.slice(0, 3).map((t) => (
                        <span key={t} className="px-3 py-1.5 bg-slate-50 text-slate-500 text-[10px] uppercase tracking-wide rounded border border-slate-100 font-bold">
                          {t}
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
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 block">Aplica En</span>
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
              <p className="text-[10px] font-bold tracking-[0.25em] text-blue-600 mb-4 uppercase">ENTREGABLES</p>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 leading-tight">No es solo implementar: es dejar operación lista</h2>
              <p className="mt-4 text-slate-500 font-medium text-lg leading-relaxed">En proyectos enterprise, el valor está en la arquitectura, trazabilidad y documentación.</p>
            </div>
            <div className="lg:col-span-7">
              <div className="bg-white rounded-3xl p-8 lg:p-10 border border-slate-200 shadow-sm">
                <ul className="space-y-4">
                  {DELIVERABLES.map((d) => (
                    <li key={d} className="flex items-start gap-4">
                      <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                        <span className="h-2 w-2 rounded-full bg-blue-600" />
                      </div>
                      <span className="text-slate-700 font-medium">{d}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-10 flex flex-col gap-4 sm:flex-row border-t border-slate-100 pt-8">
                  <Link href="/contacto" className="inline-flex justify-center items-center rounded-lg bg-blue-700 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-600 transition-colors">Agendar reunión</Link>
                  <Link href="/partners" className="inline-flex justify-center items-center rounded-lg bg-white border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors gap-2">
                    Ver partners <ExternalLink className="w-4 h-4 ml-1 text-slate-400" />
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
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight mb-4">¿Buscas una solución enterprise con 28 años de respaldo?</h2>
              <p className="text-lg text-blue-200 font-medium max-w-xl">Agendemos una reunión técnica para levantar requerimientos.</p>
            </div>
            <div className="lg:col-span-4 lg:text-right">
              <Link href="/contacto" className="inline-flex justify-center items-center rounded-lg bg-white px-8 py-4 text-sm font-bold text-slate-900 shadow-lg hover:bg-slate-50 transition-colors w-full sm:w-auto">
                Agendar reunión
              </Link>
              <p className="mt-6 flex flex-wrap justify-center lg:justify-end gap-x-3 gap-y-1 text-[11px] text-blue-300 font-bold uppercase tracking-wider">
                <span>Banca nacional</span>
                <span>&bull;</span>
                <span>Operación continua</span>
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
