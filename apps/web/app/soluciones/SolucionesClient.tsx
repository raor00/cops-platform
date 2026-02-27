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

const PROCESS = [{ n: "01", t: "Levantamiento", d: "Requerimientos, riesgos, alcance." }, { n: "02", t: "Arquitectura", d: "Diseño, dimensionamiento, integración." }, { n: "03", t: "Implementación", d: "Instalación, integración, hardening." }, { n: "04", t: "Puesta en marcha", d: "Pruebas, QA, actas, capacitación." }, { n: "05", t: "Soporte", d: "Mantenimiento, mejoras, continuidad." }];

const DELIVERABLES = ["Levantamiento y alcance (matriz de requerimientos)", "Arquitectura (diagramas, zonificación, criterios de retención)", "Documentación técnica y operativa (runbooks, procedimientos)", "Plan de pruebas (QA) + actas de entrega", "Capacitación y acompañamiento post-implementación"];

const fadeUp = { initial: { opacity: 0, y: 16 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.12 as const }, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } };

export default function SolucionesClient() {
  const [filter, setFilter] = useState<"TODOS" | Key>("TODOS");
  const filtered = useMemo(() => filter === "TODOS" ? SOLUTIONS : SOLUTIONS.filter((s) => s.key === filter), [filter]);

  return (
    <main className="bg-slate-50 min-h-screen">
      {/* HERO */}
      <section className="relative px-6 py-20 lg:px-12 bg-slate-50 pt-32 lg:pt-40 pb-32">
        <div className="mx-auto max-w-7xl">
          <motion.div {...fadeUp} className="max-w-4xl">
            <p className="text-[11px] font-black tracking-[0.2em] text-blue-600 uppercase mb-5">SOLUCIONES</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.1] mb-6">
              Arquitectura, integración y <br className="hidden lg:block" /> operación para entornos <br className="hidden lg:block" /> críticos
            </h1>
            <p className="mt-4 text-[17px] text-slate-500 font-medium max-w-2xl leading-relaxed">
              Soluciones enterprise en VMS/CCTV, control de acceso, alarmas, analíticas con IA, BMS y energía.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link href="/contacto" className="inline-flex justify-center items-center gap-2 rounded-lg bg-blue-700 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-blue-600/20 hover:bg-blue-800 transition-colors">
                Agendar reunión técnica <Calendar className="w-4 h-4" />
              </Link>
              <Link href="/proyectos" className="inline-flex justify-center items-center gap-2 rounded-lg bg-white border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-colors">
                Ver proyectos
              </Link>
            </div>
            <div className="mt-14 flex flex-wrap items-center gap-x-6 gap-y-3 text-[11px] font-semibold text-slate-400">
              {["Banca nacional", "Proyectos enterprise", "Partners internacionales", "Documentación y QA", "Operación multi-sede"].map((t) => (
                <span key={t} className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
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

      {/* Metodología */}
      <section id="metodologia" className="relative bg-white border-t border-slate-200">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-12">
          <motion.div {...fadeUp} className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Metodología</h2>
            <p className="mt-4 text-lg text-slate-500 font-medium">Estructura clara para resultados consistentes.</p>
          </motion.div>
          <div className="relative isolate">
            {/* Animated path connecting steps (Vertical on Mobile, Horizontal on Desktop) */}
            <motion.div
              initial={{ height: 0, width: 2 }}
              whileInView={{ height: "100%", width: 2 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="absolute left-6 top-0 -z-10 block rounded-full bg-gradient-to-b from-blue-100 via-blue-400 to-blue-100 lg:hidden"
            />
            <motion.div
              initial={{ width: 0, height: 2 }}
              whileInView={{ width: "100%", height: 2 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="absolute left-0 top-1/2 -z-10 hidden rounded-full bg-gradient-to-r from-blue-100 via-blue-400 to-blue-100 lg:block"
            />

            <div className="flex flex-col gap-6 lg:grid lg:grid-cols-5 lg:gap-6">
              {PROCESS.map((p, i) => (
                <motion.div
                  key={p.n}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: i * 0.15 }}
                  className="relative group flex items-start lg:block"
                >
                  {/* Glowing Node on the line */}
                  <div className="absolute left-6 lg:left-1/2 top-8 lg:top-1/2 -translate-x-1/2 -translate-y-1/2 z-0 h-4 w-4 rounded-full border-4 border-white bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)] transition-all duration-300 group-hover:scale-150" />

                  {/* Card Container mobile offset to align with node */}
                  <div className="ml-16 w-full lg:ml-0 lg:mt-8 min-h-[160px] bg-white rounded-2xl p-6 border border-slate-200/60 transition-all hover:border-blue-300 hover:shadow-lg hover:-translate-y-1 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="absolute -top-4 -right-3 text-7xl font-black text-slate-100 pointer-events-none select-none transition-transform group-hover:scale-110">{p.n}</span>
                    <p className="text-[11px] font-black tracking-wider uppercase text-blue-600 mb-4 relative z-10">Etapa {p.n}</p>
                    <h3 className="font-bold text-slate-900 text-[17px] mb-2 relative z-10">{p.t}</h3>
                    <p className="text-sm text-slate-600 font-medium leading-relaxed relative z-10">{p.d}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
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
