"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const STATS = [{ k: "28", v: "Años de trayectoria" }, { k: "+1500", v: "Obras ejecutadas" }, { k: "Enterprise", v: "Proyectos multi-sede" }, { k: "Banca", v: "Operación crítica" }];

const DIFFERENTIATORS = [
  { title: "Enfoque enterprise (no \u201Cinstalación y ya\u201D)", desc: "Arquitectura, estandarización, documentación y operación para entornos multi-sede." },
  { title: "Integración real de plataformas", desc: "Unimos VMS, control de acceso, alarmas, BMS y energía bajo una operación coherente y auditable." },
  { title: "Continuidad operativa", desc: "Diseñamos pensando en retención, respaldo, redundancia y respuesta ante incidentes." },
  { title: "Implementación por fases", desc: "Planificación, ejecución, pruebas y puesta en marcha sin improvisación: control y avance medible." },
];

const HOW_WE_WORK = [
  { step: "01", title: "Levantamiento y diagnóstico", desc: "Requerimientos, riesgos, puntos críticos, criterios de éxito y alcance real." },
  { step: "02", title: "Arquitectura y diseño", desc: "Diagrama, zonificación, retención, red, roles y lineamientos para escalar." },
  { step: "03", title: "Implementación por fases", desc: "Instalación, integración, configuración, pruebas y validación operacional." },
  { step: "04", title: "Puesta en marcha + soporte", desc: "Arranque controlado, documentación final y acompañamiento para estabilizar operación." },
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

const fadeUp = { initial: { opacity: 0, y: 16 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.15 as const }, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } };

export default function NosotrosClient() {
  return (
    <main>
      {/* HERO */}
      <section className="dark-section noise relative border-b border-white/[0.06]">
        <div className="relative mx-auto max-w-6xl px-4 py-16">
          <motion.div {...fadeUp}>
            <p className="text-[10px] font-bold tracking-[0.25em] text-brand-300">NOSOTROS</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-white">COP&apos;S ELECTRONICS, S.A.</h1>
            <p className="mt-4 max-w-4xl text-white/60">Somos una organización privada con <span className="font-semibold text-brand-300">28 años</span> de trayectoria ininterrumpida dedicada a la asesoría de proyectos tecnológicos de alta gama en sistemas de automatización, energía renovable, seguridad y protección.</p>
            <p className="mt-4 max-w-4xl text-white/60">Hemos ejecutado <span className="font-semibold text-brand-300">más de 1500 obras</span> que afianzan nuestra gestión técnica y comercial.</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/proyectos" className="btn-glass-primary">Ver proyectos</Link>
              <Link href="/contacto" className="btn-glass">Agendar reunión técnica</Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              {["Banca nacional", "Proyectos enterprise", "Automatización + Seguridad", "Energía y continuidad", "+1500 obras", "28 años"].map((t) => <span key={t} className="tag-glass">{t}</span>)}
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {STATS.map((s) => (
                <div key={s.v} className="lg-card card-lift-dark p-5">
                  <p className="text-2xl font-bold text-brand-300">{s.k}</p>
                  <p className="mt-1 text-sm text-white/50">{s.v}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Diferenciadores */}
      <section className="relative border-t border-white/[0.06]">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-4">
              <motion.div {...fadeUp}>
                <p className="text-[10px] font-bold tracking-[0.25em] text-brand-400">POR QUÉ COP&apos;S</p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-white">Diferenciación técnica real</h2>
                <p className="mt-3 text-white/55">Lo que nos distingue no es solo &quot;instalar&quot;, sino dejar una operación lista para auditar, escalar y sostener.</p>
              </motion.div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:col-span-8">
              {DIFFERENTIATORS.map((d, i) => (
                <motion.div key={d.title} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.06 }} className="lg-card p-6">
                  <h3 className="text-lg font-semibold text-white">{d.title}</h3>
                  <p className="mt-2 text-sm text-white/55">{d.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Cómo trabajamos */}
      <section className="dark-section noise relative border-y border-white/[0.06]">
        <div className="relative mx-auto max-w-6xl px-4 py-20">
          <motion.div {...fadeUp}><p className="text-[10px] font-bold tracking-[0.25em] text-brand-300">METODOLOGÍA</p><h2 className="mt-3 text-3xl font-bold tracking-tight text-white">Proceso claro, avance medible</h2></motion.div>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {HOW_WE_WORK.map((s, i) => (
              <motion.div key={s.step} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.06 }} className="lg-card card-lift-dark p-6">
                <p className="text-xs font-bold text-brand-400">{s.step}</p>
                <h3 className="mt-2 text-lg font-semibold text-white">{s.title}</h3>
                <p className="mt-2 text-sm text-white/55">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Sectores */}
      <section className="relative border-t border-white/[0.06]">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <motion.div {...fadeUp}><p className="text-[10px] font-bold tracking-[0.25em] text-brand-400">SECTORES</p><h2 className="mt-3 text-3xl font-bold tracking-tight text-white">Experiencia multi-sector</h2></motion.div>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {SECTORS.map((s, i) => (
              <motion.div key={s.title} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.06 }} className="lg-card p-6">
                <h3 className="text-lg font-semibold text-brand-300">{s.title}</h3>
                <p className="mt-2 text-sm text-white/55">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="dark-section noise relative">
        <div className="relative mx-auto max-w-6xl px-4 py-20">
          <motion.div {...fadeUp}><p className="text-[10px] font-bold tracking-[0.25em] text-brand-300">TRAYECTORIA</p><h2 className="mt-3 text-3xl font-bold tracking-tight text-white">28 años: evolución + consistencia</h2></motion.div>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {TIMELINE.map((t, i) => (
              <motion.div key={t.title} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.06 }} className="lg-card card-lift-dark p-6">
                <p className="text-[10px] font-bold tracking-[0.25em] text-brand-400">{t.tag.toUpperCase()}</p>
                <h3 className="mt-2 text-lg font-semibold text-white">{t.title}</h3>
                <p className="mt-2 text-sm text-white/55">{t.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div {...fadeUp} className="mt-12 lg-card p-8">
            <div className="grid gap-6 md:grid-cols-12 md:items-center">
              <div className="md:col-span-8">
                <h3 className="text-2xl font-bold text-white">¿Listo para avanzar con tu proyecto?</h3>
                <p className="mt-2 text-white/55">Coordinamos una reunión técnica para levantar requerimientos y definir arquitectura, alcance y cronograma.</p>
              </div>
              <div className="md:col-span-4 md:text-right">
                <Link href="/contacto" className="btn-glass-primary w-full md:w-auto">Agendar reunión técnica</Link>
                <p className="mt-3 text-xs text-white/35">Enfoque enterprise &bull; Documentación &bull; Puesta en marcha</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
