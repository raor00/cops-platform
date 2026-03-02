"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Target, Workflow, Map, History } from "lucide-react";

const STATS = [
  { k: "28", v: "Años de trayectoria" },
  { k: "+1500", v: "Obras ejecutadas" },
  { k: "Enterprise", v: "Proyectos multi-sede" },
  { k: "Banca", v: "Operación crítica" }
];

const DIFFERENTIATORS = [
  { title: "Enfoque enterprise (no \u201Cinstalación y ya\u201D)", desc: "Arquitectura, estandarización, documentación y operación para entornos multi-sede." },
  { title: "Integración real de plataformas", desc: "Unimos VMS, control de acceso, alarmas, BMS y energía bajo una operación coherente y auditable." },
  { title: "Continuidad operativa", desc: "Diseñamos pensando en retención, respaldo, redundancia y respuesta ante incidentes." },
  { title: "Implementación por fases", desc: "Planificación, ejecución, pruebas y puesta en marcha sin improvisación: control y avance medible." },
];

const HOW_WE_WORK = [
  { step: "01", title: "Levantamiento y alcance", desc: "Definición de requerimientos, matriz de riesgos, puntos críticos y validación de infraestructura existente." },
  { step: "02", title: "Arquitectura y diseño", desc: "Dimensionamiento escalable, diagramas de red, políticas de retención y esquemas de contingencia." },
  { step: "03", title: "Implementación", desc: "Instalación por fases, integración de plataformas (VMS/BMS) y configuración bajo estándares de ciberseguridad." },
  { step: "04", title: "Puesta en marcha", desc: "Plan de pruebas (QA), validación operacional, firmas de actas de entrega." },
  { step: "05", title: "Soporte", desc: "Mantenimiento preventivo, mejoras continuas, SLAs y acompañamiento para estabilizar operación." },
];

const TIMELINE = [
  { tag: "Trayectoria", title: "28 años de trabajo ininterrumpido", desc: "Dos décadas (y más) construyendo confianza con enfoque técnico y ejecución sostenida." },
  { tag: "Escala", title: "+1500 obras ejecutadas", desc: "Proyectos que fortalecen nuestra gestión técnica y comercial." },
  { tag: "Banca", title: "Operación crítica y altos estándares", desc: "Proyectos en banca con control, trazabilidad, auditoría, continuidad y multi-sede." },
  { tag: "Hoy", title: "Soluciones tecnológicas integrales", desc: "Automatización, BMS, VMS, control de acceso, alarmas y energía renovable." },
];

const SECTORS = [
  { title: "Banca", desc: "Modernización de agencias, pilotos, control de acceso, CCTV, analíticas e IA con operación multi-sede." },
  { title: "Industrial", desc: "Plantas y operaciones: VMS + control de acceso + integración + trazabilidad." },
  { title: "Comercial", desc: "Edificios inteligentes (BMS), seguridad integral, eficiencia operativa." },
  { title: "Gubernamental", desc: "Instalaciones críticas: cobertura por riesgo, perímetro, operación y protocolos." },
];

const fadeUp = {
  initial: { opacity: 0, y: 30, filter: "blur(5px)" },
  whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
  viewport: { once: true, amount: 0.15 as const },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }
};

export default function NosotrosClient() {
  return (
    <main className="bg-[#f3f4f6] min-h-screen font-sans text-slate-800 overflow-hidden">

      {/* Background Blobs corresponding to the new theme */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <motion.div
          className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full mix-blend-multiply opacity-[0.15] blur-[100px] bg-sky-300"
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute top-[20%] -right-[20%] w-[60vw] h-[60vw] rounded-full mix-blend-multiply opacity-[0.15] blur-[100px] bg-blue-400"
          animate={{
            x: [0, -40, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      {/* HERO */}
      <section className="relative z-10 pt-20 pb-20 md:pt-28 md:pb-28 px-4 border-b border-slate-200 bg-white/60 backdrop-blur-3xl">
        <div className="mx-auto max-w-6xl text-center">
          <motion.div {...fadeUp} className="flex flex-col items-center">
            <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600 ring-1 ring-inset ring-blue-600/20 mb-6 uppercase tracking-widest">
              NOSOTROS
            </span>
            <h1 className="text-5xl font-black tracking-tight text-slate-900 md:text-7xl lg:text-[5rem] leading-[1.1] mb-6">
              La confianza de <span className="bg-gradient-to-br from-blue-600 to-cyan-500 bg-clip-text text-transparent">28 años</span> <br className="hidden md:block" /> construyendo país.
            </h1>
            <p className="max-w-3xl text-lg font-medium text-slate-600 leading-relaxed md:text-xl mb-8 mx-auto">
              Somos una organización dedicada a la asesoría e implementación de soluciones tecnológicas de alta gama en automatización, energía renovable y seguridad enterprise.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto mb-12">
              <Link href="/proyectos" className="inline-flex items-center justify-center rounded-full bg-blue-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/20">
                Ver proyectos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link href="/contacto" className="inline-flex items-center justify-center rounded-full bg-white border border-slate-200 px-8 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900">
                Agendar reunión técnica
              </Link>
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              {["Banca nacional", "Proyectos enterprise", "Automatización + Seguridad", "Energía y continuidad", "+1500 obras"].map((t) => (
                <span key={t} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-[11px] font-bold uppercase tracking-wider rounded-md shadow-sm">
                  {t}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* STATS grid seamlessly blending */}
      <section className="relative z-10 -mt-10 mx-auto max-w-6xl px-4 mb-20">
        <motion.div
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          {STATS.map((s, idx) => (
            <motion.div
              key={s.v}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + (idx * 0.1), duration: 0.5 }}
              className="bg-white/80 backdrop-blur-xl border border-white rounded-[1.5rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-center items-center text-center transition-all hover:-translate-y-1 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)]"
            >
              <p className="text-4xl font-black bg-gradient-to-br from-blue-600 to-cyan-500 bg-clip-text text-transparent mb-2">{s.k}</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{s.v}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Diferenciadores */}
      <section className="relative z-10 py-24 bg-white border-y border-slate-200">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-col gap-12 lg:flex-row lg:items-start">
            <div className="lg:w-1/3">
              <motion.div {...fadeUp} className="sticky top-32">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="h-5 w-5 text-blue-600" />
                  <p className="text-[11px] font-black tracking-[0.2em] text-blue-600 uppercase">DIFERENCIACIÓN</p>
                </div>
                <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 mb-4">No solo instalamos, orquestamos.</h2>
                <p className="text-slate-500 text-lg font-medium leading-relaxed">Dejamos una operación lista para auditar, escalar y sostener a nivel enterprise.</p>
              </motion.div>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:w-2/3">
              {DIFFERENTIATORS.map((d, i) => (
                <motion.div
                  key={d.title}
                  {...fadeUp}
                  transition={{ ...fadeUp.transition, delay: i * 0.1 }}
                  className="bg-slate-50 rounded-2xl p-8 border border-slate-100 hover:border-blue-200 transition-colors group"
                >
                  <h3 className="text-base font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">{d.title}</h3>
                  <p className="text-sm font-medium text-slate-500 leading-relaxed">{d.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Cómo trabajamos */}
      <section className="relative z-10 py-24">
        <div className="mx-auto max-w-6xl px-4">
          <motion.div {...fadeUp} className="mb-16 md:text-center flex flex-col md:items-center">
            <div className="flex items-center gap-2 mb-4">
              <Workflow className="h-5 w-5 text-cyan-600" />
              <p className="text-[11px] font-black tracking-[0.2em] text-cyan-600 uppercase">METODOLOGÍA</p>
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900">Proceso claro, avance medible</h2>
          </motion.div>
          <div className="flex flex-nowrap overflow-x-auto pb-8 snap-x snap-mandatory gap-6 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {HOW_WE_WORK.map((s, i) => (
              <motion.div
                key={s.step}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: i * 0.1 }}
                className="shrink-0 w-[85vw] sm:w-[320px] lg:flex-1 snap-center relative bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 overflow-hidden group"
              >
                {/* Decorative number background */}
                <div className="absolute -right-4 -top-8 text-9xl font-black text-slate-50 opacity-50 pointer-events-none transition-transform group-hover:scale-110 group-hover:text-blue-50">{s.step}</div>

                <div className="relative z-10">
                  <p className="text-sm font-black text-blue-600 tracking-wider mb-4">PASO {s.step}</p>
                  <h3 className="text-lg font-bold text-slate-900 mb-3 leading-tight">{s.title}</h3>
                  <p className="text-sm font-medium text-slate-500 leading-relaxed">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Sectores */}
      <section className="relative z-10 py-24 bg-white border-y border-slate-200">
        <div className="mx-auto max-w-6xl px-4">
          <motion.div {...fadeUp} className="mb-16 md:flex md:items-end justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-4">
                <Map className="h-5 w-5 text-indigo-600" />
                <p className="text-[11px] font-black tracking-[0.2em] text-indigo-600 uppercase">SECTORES</p>
              </div>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900">Experiencia multi-sector</h2>
            </div>
          </motion.div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {SECTORS.map((s, i) => (
              <motion.div
                key={s.title}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: i * 0.1 }}
                className="group border-b-2 border-slate-100 pb-8 hover:border-indigo-500 transition-colors"
              >
                <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-indigo-600 transition-colors">{s.title}</h3>
                <p className="text-sm font-medium text-slate-500 leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="relative z-10 py-24 pb-32">
        <div className="mx-auto max-w-6xl px-4">
          <motion.div {...fadeUp} className="mb-16 text-center flex flex-col items-center">
            <div className="flex items-center gap-2 mb-4">
              <History className="h-5 w-5 text-emerald-600" />
              <p className="text-[11px] font-black tracking-[0.2em] text-emerald-600 uppercase">TRAYECTORIA</p>
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900">28 años evolucionando</h2>
          </motion.div>
          <div className="grid gap-6 md:grid-cols-4 max-w-5xl mx-auto">
            {TIMELINE.map((t, i) => (
              <motion.div
                key={t.title}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: i * 0.1 }}
                className="bg-white/60 backdrop-blur-md rounded-2xl p-6 text-center border border-slate-200 shadow-sm"
              >
                <div className="mx-auto w-12 h-1 bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-full mb-6"></div>
                <h3 className="text-sm font-bold text-slate-900 mb-2 uppercase tracking-wide">{t.title}</h3>
                <p className="text-xs font-medium text-slate-500 leading-relaxed">{t.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div {...fadeUp} className="mt-24 relative overflow-hidden rounded-[2.5rem] bg-[#0a1428] border border-slate-800 p-10 md:p-14 shadow-2xl group">
            {/* Abstract internal glow */}
            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-blue-900/40 via-transparent to-transparent opacity-50" />
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-cyan-600 rounded-full blur-[100px] opacity-30 group-hover:opacity-50 transition-opacity duration-700" />

            <div className="relative z-10 grid gap-8 md:grid-cols-12 md:items-center">
              <div className="md:col-span-7">
                <h3 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">¿Listo para escalar la seguridad de tu empresa?</h3>
                <p className="text-lg text-slate-400 font-medium">Coordinemos una reunión técnica para levantar requerimientos y definir arquitectura, alcance y cronograma exacto.</p>
              </div>
              <div className="md:col-span-5 md:flex md:flex-col md:items-end">
                <Link href="/contacto" className="inline-flex w-full md:w-auto items-center justify-center rounded-full bg-white px-8 py-4 text-sm font-bold text-slate-900 shadow-lg transition-all hover:scale-105 hover:shadow-cyan-500/25">
                  Agendar reunión
                </Link>
                <p className="mt-4 text-[11px] font-semibold tracking-widest uppercase text-slate-500 text-center md:text-right">
                  Enfoque enterprise <br className="hidden md:block" /> Documentación &bull; Puesta en marcha
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
