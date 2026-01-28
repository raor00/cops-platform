"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const STATS = [
  { k: "28", v: "Años de trayectoria" },
  { k: "+1500", v: "Obras ejecutadas" },
  { k: "Enterprise", v: "Proyectos multi-sede" },
  { k: "Banca", v: "Operación crítica" },
];

const DIFFERENTIATORS = [
  {
    title: "Enfoque enterprise (no “instalación y ya”)",
    desc: "Arquitectura, estandarización, documentación y operación para entornos multi-sede.",
  },
  {
    title: "Integración real de plataformas",
    desc: "Unimos VMS, control de acceso, alarmas, BMS y energía bajo una operación coherente y auditable.",
  },
  {
    title: "Continuidad operativa",
    desc: "Diseñamos pensando en retención, respaldo, redundancia y respuesta ante incidentes.",
  },
  {
    title: "Implementación por fases",
    desc: "Planificación, ejecución, pruebas y puesta en marcha sin improvisación: control y avance medible.",
  },
];

const HOW_WE_WORK = [
  {
    step: "01",
    title: "Levantamiento y diagnóstico",
    desc: "Requerimientos, riesgos, puntos críticos, criterios de éxito y alcance real.",
  },
  {
    step: "02",
    title: "Arquitectura y diseño",
    desc: "Diagrama, zonificación, retención, red, roles y lineamientos para escalar.",
  },
  {
    step: "03",
    title: "Implementación por fases",
    desc: "Instalación, integración, configuración, pruebas y validación operacional.",
  },
  {
    step: "04",
    title: "Puesta en marcha + soporte",
    desc: "Arranque controlado, documentación final y acompañamiento para estabilizar operación.",
  },
];

const TIMELINE = [
  {
    tag: "Trayectoria",
    title: "28 años de trabajo ininterrumpido",
    desc: "Dos décadas (y más) construyendo confianza con enfoque técnico y ejecución sostenida.",
  },
  {
    tag: "Escala",
    title: "+1500 obras ejecutadas",
    desc: "Proyectos que fortalecen nuestra gestión técnica y comercial en seguridad, automatización y energía.",
  },
  {
    tag: "Banca nacional",
    title: "Operación crítica y altos estándares",
    desc: "Proyectos en banca con control, trazabilidad, auditoría, continuidad y multi-sede.",
  },
  {
    tag: "Hoy",
    title: "Soluciones tecnológicas integrales",
    desc: "Automatización de procesos, edificios inteligentes (BMS), VMS, control de acceso, alarmas y energía renovable.",
  },
];

const SECTORS = [
  {
    title: "Banca",
    desc: "Modernización de agencias, pilotos, control de acceso, CCTV, analíticas e IA con operación multi-sede.",
  },
  {
    title: "Industrial",
    desc: "Plantas y operaciones: VMS + control de acceso + integración + trazabilidad para reemplazos y upgrades.",
  },
  {
    title: "Comercial",
    desc: "Edificios inteligentes (BMS), seguridad integral, eficiencia operativa y mantenimiento planificado.",
  },
  {
    title: "Gubernamental",
    desc: "Instalaciones críticas: cobertura por riesgo, perímetro, operación y protocolos.",
  },
];

function Badge({ text }: { text: string }) {
  return (
    <span className="rounded-full border bg-white px-3 py-1 text-xs font-semibold text-slate-700">
      {text}
    </span>
  );
}

export default function NosotrosClient() {
  return (
    <main>
      {/* HERO auténtico */}
      <section className="border-b bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <motion.div
  initial={{ opacity: 0, y: 10 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: false, amount: 0.6 }}
  transition={{ duration: 0.45 }}
>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-600">
              Nosotros
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight">
              COP’S ELECTRONICS, S.A.
            </h1>

            {/* TU TEXTO REAL (autenticidad) */}
            <p className="mt-4 max-w-4xl text-slate-700">
              Somos una organización privada con <span className="font-semibold">28 años</span> de
              trayectoria ininterrumpida dedicada a la asesoría de proyectos tecnológicos de alta
              gama en sistemas de automatización, energía renovable, seguridad y protección.
              Dirigidos hacia los sectores industriales, bancarios, comercial e instituciones
              gubernamentales.
            </p>

            <p className="mt-4 max-w-4xl text-slate-700">
              Hemos ejecutado <span className="font-semibold">más de 1500 obras</span> que afianzan
              nuestra gestión técnica y comercial en relación a la promoción, instalación y
              mantenimiento de sistemas de seguridad integrales, automatización de procesos,
              edificios inteligentes y energía renovable, brindando atención personalizada y
              soluciones ante cualquier situación, con miras a optimizar la operación y la seguridad.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/proyectos"
                className="rounded-xl bg-slate-900 px-5 py-3 text-center text-sm font-semibold text-white hover:opacity-90"
              >
                Ver proyectos
              </Link>
              <Link
                href="/contacto"
                className="rounded-xl border px-5 py-3 text-center text-sm font-semibold hover:bg-white"
              >
                Agendar reunión técnica
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              <Badge text="Banca nacional" />
              <Badge text="Proyectos enterprise" />
              <Badge text="Automatización + Seguridad" />
              <Badge text="Energía y continuidad" />
              <Badge text="+1500 obras" />
              <Badge text="28 años" />
            </div>

            {/* Stats */}
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {STATS.map((s) => (
                <div key={s.v} className="rounded-2xl border bg-white p-5">
                  <p className="text-2xl font-semibold">{s.k}</p>
                  <p className="mt-1 text-sm text-slate-600">{s.v}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Diferenciadores (no genérico) */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Por qué COP’S
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">
              Diferenciación técnica real
            </h2>
            <p className="mt-3 text-slate-700">
              Lo que nos distingue no es solo “instalar”, sino dejar una operación lista para
              auditar, escalar y sostener.
            </p>
          </div>

          <div className="lg:col-span-8 grid gap-4 sm:grid-cols-2">
            {DIFFERENTIATORS.map((d, i) => (
              <motion.div
                key={d.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.25, margin: "-80px" }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
                className="rounded-2xl border bg-white p-6"
              >
                <h3 className="text-lg font-semibold">{d.title}</h3>
                <p className="mt-2 text-sm text-slate-700">{d.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Cómo trabajamos (playbook) */}
      <section className="border-y bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Metodología
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">
            Proceso claro, avance medible
          </h2>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {HOW_WE_WORK.map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.25, margin: "-80px" }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
                className="rounded-2xl border bg-white p-6"
              >
                <p className="text-xs font-semibold text-slate-500">{s.step}</p>
                <h3 className="mt-2 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-slate-700">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Sectores */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          Sectores
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight">
          Experiencia multi-sector
        </h2>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {SECTORS.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.25, margin: "-80px" }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
              className="rounded-2xl border bg-white p-6"
            >
              <h3 className="text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-slate-700">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Timeline (trayectoria REAL, no genérica) */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Trayectoria
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">
            28 años: evolución + consistencia
          </h2>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {TIMELINE.map((t, i) => (
              <motion.div
                key={t.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.25, margin: "-80px" }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
                className="rounded-2xl border bg-white p-6"
              >
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                  {t.tag}
                </p>
                <h3 className="mt-2 text-lg font-semibold">{t.title}</h3>
                <p className="mt-2 text-sm text-slate-700">{t.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* CTA final */}
          <div className="mt-10 rounded-2xl bg-slate-950 p-8 text-white">
            <div className="grid gap-6 md:grid-cols-12 md:items-center">
              <div className="md:col-span-8">
                <h3 className="text-2xl font-semibold">
                  ¿Listo para avanzar con tu proyecto?
                </h3>
                <p className="mt-2 text-white/75">
                  Coordinamos una reunión técnica para levantar requerimientos y definir arquitectura,
                  alcance y cronograma.
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
                  Enfoque enterprise • Documentación • Puesta en marcha
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
