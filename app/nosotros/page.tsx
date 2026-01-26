"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const STATS = [
  { k: "28+", v: "Años de trayectoria" },
  { k: "1500+", v: "Obras ejecutadas" },
  { k: "Enterprise", v: "Enfoque en operación crítica" },
  { k: "Multi-sede", v: "Arquitecturas escalables" },
];

const PILLARS = [
  {
    title: "Enfoque enterprise",
    desc: "Diseñamos soluciones para operación crítica: banca, industria y entornos con alta exigencia operativa.",
  },
  {
    title: "Arquitectura e integración",
    desc: "Integramos plataformas y fabricantes, estandarizando criterios para crecer sin rehacer la infraestructura.",
  },
  {
    title: "Puesta en marcha + soporte",
    desc: "Documentación, protocolos y acompañamiento técnico para operar con continuidad y control.",
  },
];

const AREAS = [
  {
    title: "Seguridad electrónica",
    bullets: ["CCTV", "Control de acceso", "Alarmas", "Analíticas e IA", "Perímetro"],
  },
  {
    title: "Automatización de procesos",
    bullets: ["BMS / Edificios inteligentes", "Monitoreo", "Integraciones", "Tableros y operación"],
  },
  {
    title: "Energía y continuidad",
    bullets: ["Respaldo eléctrico", "Protección", "Disponibilidad", "Operación crítica"],
  },
];

const METHOD = [
  {
    step: "01",
    title: "Levantamiento",
    desc: "Diagnóstico, criticidad, requerimientos, flujos operativos y riesgos.",
  },
  {
    step: "02",
    title: "Arquitectura",
    desc: "Diseño escalable, integración, estándares y planificación de crecimiento.",
  },
  {
    step: "03",
    title: "Implementación",
    desc: "Puesta en marcha, pruebas, validación, capacitación y documentación.",
  },
  {
    step: "04",
    title: "Soporte y mejora",
    desc: "Acompañamiento técnico, mantenimiento y optimización continua.",
  },
];

export default function NosotrosPage() {
  return (
    <main className="min-h-screen">
      <div className="h-20" />

      {/* HERO */}
      <section className="border-b bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-600">
            Nosotros
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-tight">
            28 años impulsando soluciones tecnológicas
          </h1>

          <p className="mt-4 max-w-3xl text-slate-700">
            COP’S ELECTRONICS, S.A. es una organización privada con trayectoria ininterrumpida,
            dedicada a la asesoría, diseño, implementación y mantenimiento de soluciones de alta gama
            en automatización, seguridad electrónica y continuidad operativa, orientadas a sectores
            bancarios, industriales, comerciales e instituciones.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/contacto"
              className="rounded-xl bg-slate-900 px-5 py-3 text-center text-sm font-semibold text-white hover:opacity-90"
            >
              Agendar reunión técnica
            </Link>
            <Link
              href="/proyectos"
              className="rounded-xl border px-5 py-3 text-center text-sm font-semibold hover:bg-white"
            >
              Ver proyectos
            </Link>
          </div>

          {/* STATS */}
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STATS.map((s) => (
              <div
                key={s.v}
                className="rounded-2xl border bg-white p-5 shadow-[0_20px_80px_rgba(0,0,0,0.06)]"
              >
                <p className="text-3xl font-semibold tracking-tight">{s.k}</p>
                <p className="mt-1 text-sm text-slate-600">{s.v}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PILLARS */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <motion.div
          className="grid gap-5 md:grid-cols-3"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.35 }}
        >
          {PILLARS.map((p) => (
            <div
              key={p.title}
              className="rounded-2xl border bg-white p-6 shadow-[0_20px_80px_rgba(0,0,0,0.06)] hover:bg-slate-50"
            >
              <h2 className="text-lg font-semibold">{p.title}</h2>
              <p className="mt-2 text-sm text-slate-700">{p.desc}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* AREAS */}
      <section className="border-t bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-600">
            Qué hacemos
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">
            Soluciones para operación crítica
          </h2>
          <p className="mt-4 max-w-3xl text-slate-700">
            Diseñamos e integramos soluciones con estándares enterprise, preparadas para escalar y
            operar de forma continua.
          </p>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {AREAS.map((a) => (
              <div
                key={a.title}
                className="rounded-2xl border bg-slate-50 p-6 hover:bg-white"
              >
                <h3 className="text-lg font-semibold">{a.title}</h3>
                <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-slate-700">
                  {a.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* METHOD */}
      <section className="border-t bg-slate-950">
        <div className="mx-auto max-w-6xl px-4 py-16 text-white">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/60">
            Cómo trabajamos
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">
            Método claro, documentación y control
          </h2>
          <p className="mt-4 max-w-3xl text-white/70">
            Nuestro enfoque prioriza arquitectura, integración y operación continua, con
            documentación y estándares que permiten crecer de forma ordenada.
          </p>

          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {METHOD.map((m) => (
              <div
                key={m.step}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/7"
              >
                <p className="text-xs font-semibold tracking-[0.2em] text-white/60">
                  {m.step}
                </p>
                <h3 className="mt-3 text-lg font-semibold">{m.title}</h3>
                <p className="mt-2 text-sm text-white/70">{m.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/contacto"
              className="rounded-xl bg-white px-5 py-3 text-center text-sm font-semibold text-slate-900 hover:opacity-90"
            >
              Solicitar consultoría
            </Link>
            <Link
              href="/partners"
              className="rounded-xl border border-white/15 bg-transparent px-5 py-3 text-center text-sm font-semibold text-white/85 hover:bg-white/10"
            >
              Ver partners
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
