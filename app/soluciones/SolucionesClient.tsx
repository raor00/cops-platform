"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";

type Key =
  | "VMS"
  | "ACCESO"
  | "ALARMAS"
  | "IA"
  | "BMS"
  | "ENERGIA";

type Solution = {
  key: Key;
  title: string;
  desc: string;
  bullets: string[];
  applies: string[];
  tags: string[];
};

const FILTERS: { key: "TODOS" | Key; label: string }[] = [
  { key: "TODOS", label: "Todas" },
  { key: "VMS", label: "VMS / CCTV" },
  { key: "ACCESO", label: "Control de acceso" },
  { key: "ALARMAS", label: "Alarmas" },
  { key: "IA", label: "Analíticas + IA" },
  { key: "BMS", label: "BMS" },
  { key: "ENERGIA", label: "Energía" },
];

// Opción A (orden)
const SOLUTIONS: Solution[] = [
  {
    key: "VMS",
    title: "VMS / Gestión de video (CCTV)",
    desc: "Estandarización, operación multi-sede, auditoría y control por roles para entornos enterprise.",
    bullets: [
      "Arquitectura de VMS escalable",
      "Políticas de acceso (roles/permisos)",
      "Estrategia de almacenamiento y retención",
      "Operación centralizada y trazabilidad",
    ],
    applies: ["Banca", "Industrial", "Comercial", "Gubernamental"],
    tags: ["Multi-sede", "Auditoría", "Retención"],
  },
  {
    key: "ACCESO",
    title: "Control de acceso e identidades",
    desc: "Gestión de accesos, visitantes y reportes para entornos regulados y operación crítica.",
    bullets: [
      "Zonificación y reglas por áreas",
      "Credenciales, perfiles y visitantes",
      "Reportes, alertas y auditoría",
      "Integración con video y eventos",
    ],
    applies: ["Banca", "Industrial", "Comercial", "Gubernamental"],
    tags: ["Visitantes", "Reglas", "Auditoría"],
  },
  {
    key: "ALARMAS",
    title: "Alarmas e intrusión",
    desc: "Diseño y operación de eventos para respuesta rápida, con integración y procedimientos.",
    bullets: [
      "Zonificación y sensores por riesgo",
      "Recepción de eventos y escalamiento",
      "Integración con CCTV y control de acceso",
      "Procedimientos y pruebas (QA) operativas",
    ],
    applies: ["Banca", "Industrial", "Comercial", "Gubernamental"],
    tags: ["Eventos", "Respuesta", "Integración"],
  },
  {
    key: "IA",
    title: "Analíticas + IA para operación",
    desc: "Analíticas alineadas al riesgo para detección y automatización en la operación diaria.",
    bullets: [
      "Analíticas por escenarios (no genéricas)",
      "Alarmas inteligentes y reducción de falsas alertas",
      "Evidencia y trazabilidad para auditoría",
      "Automatización de flujos operativos",
    ],
    applies: ["Banca", "Industrial", "Comercial", "Gubernamental"],
    tags: ["Detección", "Automatización", "Riesgo"],
  },
  {
    key: "BMS",
    title: "Edificios inteligentes (BMS)",
    desc: "Monitoreo y control para eficiencia operativa y continuidad en infraestructura.",
    bullets: [
      "Monitoreo y control de subsistemas",
      "Tableros de operación y alarmas",
      "Procedimientos y mantenimiento preventivo",
      "Optimización operativa y energética",
    ],
    applies: ["Industrial", "Comercial", "Gubernamental"],
    tags: ["Monitoreo", "Alarmas", "Eficiencia"],
  },
  {
    key: "ENERGIA",
    title: "Energía y respaldo",
    desc: "Continuidad operativa para infraestructura crítica: protección, respaldo y disponibilidad.",
    bullets: [
      "Evaluación de cargas y criticidad",
      "Diseño de protección y respaldo",
      "Pruebas y protocolos operativos",
      "Mantenimiento y continuidad",
    ],
    applies: ["Banca", "Industrial", "Comercial", "Gubernamental"],
    tags: ["Disponibilidad", "Protección", "Respaldo"],
  },
];

const PROCESS = [
  { n: "01", t: "Levantamiento", d: "Requerimientos, riesgos, alcance, criticidad y objetivos." },
  { n: "02", t: "Arquitectura", d: "Diseño, dimensionamiento, integración y escalabilidad." },
  { n: "03", t: "Implementación", d: "Instalación, integración, configuración y hardening." },
  { n: "04", t: "Puesta en marcha", d: "Pruebas, QA, actas, entrega y capacitación." },
  { n: "05", t: "Soporte", d: "Mantenimiento, mejoras, optimización y continuidad operativa." },
];

const DELIVERABLES = [
  "Levantamiento y alcance (matriz de requerimientos)",
  "Arquitectura (diagramas, zonificación, criterios de retención)",
  "Documentación técnica y operativa (runbooks, procedimientos)",
  "Plan de pruebas (QA) + actas de entrega",
  "Capacitación y acompañamiento post-implementación",
];

function Tag({ text }: { text: string }) {
  return (
    <span className="rounded-full border bg-white px-3 py-1 text-xs font-semibold text-slate-700">
      {text}
    </span>
  );
}

export default function SolucionesClient() {
  const [filter, setFilter] = useState<"TODOS" | Key>("TODOS");

  const filtered = useMemo(() => {
    if (filter === "TODOS") return SOLUTIONS;
    return SOLUTIONS.filter((s) => s.key === filter);
  }, [filter]);

  return (
    <main>
      {/* HERO */}
      <section className="border-b bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.6 }}
            transition={{ duration: 0.45 }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-600">
              Soluciones
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight">
              Arquitectura, integración y operación para entornos críticos
            </h1>
            <p className="mt-4 max-w-3xl text-slate-700">
              Soluciones enterprise en VMS/CCTV, control de acceso, alarmas, analíticas con IA, BMS y energía. Integramos plataformas multi-marca y dejamos entregables claros: arquitectura, documentación, QA y puesta en marcha para operación crítica.
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

            <div className="mt-8 flex flex-wrap gap-2">
              <Tag text="Banca nacional" />
              <Tag text="Proyectos enterprise" />
              <Tag text="Partners internacionales" />
              <Tag text="Documentación y QA" />
              <Tag text="Operación multi-sede" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Áreas + filtros */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.25, margin: "-80px" }}
          transition={{ duration: 0.35 }}
        >
          <h2 className="text-3xl font-semibold tracking-tight">Áreas de servicio</h2>
          <p className="mt-2 max-w-3xl text-slate-700">
            Implementación, integración y soporte con foco en calidad, documentación y continuidad
            operativa. Filtra por categoría para ver el alcance.
          </p>

          {/* Filtros (tabs/chips) */}
          <div className="mt-8 flex flex-wrap gap-2">
            {FILTERS.map((f) => {
              const active = filter === f.key;
              return (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    active ? "bg-slate-900 text-white" : "bg-white hover:bg-slate-100"
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Cards */}
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {filtered.map((s, i) => (
            <motion.article
              key={s.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.25, margin: "-80px" }}
              transition={{ duration: 0.35, delay: i * 0.04 }}
              className="rounded-2xl border bg-white p-6 hover:bg-slate-50"
            >
              <h3 className="font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-slate-700">{s.desc}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                {s.tags.slice(0, 3).map((t) => (
                  <span
                    key={t}
                    className="rounded-full border bg-white px-3 py-1 text-xs font-semibold text-slate-700"
                  >
                    {t}
                  </span>
                ))}
              </div>

              <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-slate-600">
                {s.bullets.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>

              <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-slate-500">
                Aplica en
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {s.applies.map((a) => (
                  <span
                    key={a}
                    className="rounded-full border px-3 py-1 text-xs text-slate-600"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* Entregables (diferencial real) */}
      <section className="border-y bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.25, margin: "-80px" }}
            transition={{ duration: 0.35 }}
            className="grid gap-10 md:grid-cols-12 md:items-start"
          >
            <div className="md:col-span-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                Entregables
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                No es solo implementar: es dejar operación lista
              </h2>
              <p className="mt-3 text-slate-700">
                En proyectos enterprise, el valor está en la arquitectura, la trazabilidad y la
                documentación: eso reduce riesgos y asegura continuidad.
              </p>
            </div>

            <div className="md:col-span-7">
              <div className="rounded-2xl border bg-slate-50 p-6">
                <ul className="space-y-3">
                  {DELIVERABLES.map((d) => (
                    <li key={d} className="flex items-start gap-3">
                      <span className="mt-2 h-2 w-2 rounded-full bg-slate-900" />
                      <span className="text-sm text-slate-800">{d}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/contacto"
                    className="rounded-xl bg-slate-900 px-5 py-3 text-center text-sm font-semibold text-white hover:opacity-90"
                  >
                    Agendar reunión técnica
                  </Link>
                  <Link
                    href="/partners"
                    className="rounded-xl border px-5 py-3 text-center text-sm font-semibold hover:bg-white"
                  >
                    Ver partners
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Metodología */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.25, margin: "-80px" }}
          transition={{ duration: 0.35 }}
        >
          <h2 className="text-3xl font-semibold tracking-tight">Metodología</h2>
          <p className="mt-2 max-w-3xl text-slate-700">
            Estructura clara para asegurar resultados consistentes en proyectos enterprise.
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-5">
            {PROCESS.map((p, i) => (
              <motion.div
                key={p.n}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.25, margin: "-80px" }}
                transition={{ duration: 0.35, delay: i * 0.04 }}
                className="rounded-2xl border bg-white p-6 hover:bg-slate-50"
              >
                <p className="text-xs font-semibold text-slate-500">{p.n}</p>
                <h3 className="mt-2 font-semibold">{p.t}</h3>
                <p className="mt-2 text-sm text-slate-700">{p.d}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="bg-slate-950">
        <div className="mx-auto max-w-6xl px-4 py-16 text-white">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.25, margin: "-80px" }}
            transition={{ duration: 0.35 }}
            className="grid gap-8 md:grid-cols-12 md:items-center"
          >
            <div className="md:col-span-8">
              <h2 className="text-3xl font-semibold tracking-tight">
                ¿Buscas una solución enterprise con 28 años de respaldo?
              </h2>
              <p className="mt-3 text-white/75">
                Agendemos una reunión técnica para levantar requerimientos y definir arquitectura.
              </p>
            </div>
            <div className="md:col-span-4 md:text-right">
              <Link
                href="/contacto"
                className="inline-flex w-full justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 hover:opacity-90 md:w-auto"
              >
                Agendar reunión técnica
              </Link>
              <p className="mt-3 text-xs text-white/60">
                Banca nacional • Proyectos enterprise • Partners internacionales
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
