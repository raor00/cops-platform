"use client";

import Link from "next/link";
import { motion } from "framer-motion";

type Partner = {
  name: string;
  logo: string; // ruta en /public/partners/
  tagline: string;
  bullets: string[];
  tags: string[];
};

const PARTNERS: Partner[] = [
  {
    name: "Milestone",
    logo: "/partners/milestone.png",
    tagline: "VMS abierto para gestión de video a nivel enterprise.",
    bullets: [
      "Centralización y escalabilidad multi-sede",
      "Integración con múltiples fabricantes",
      "Operación robusta para entornos críticos",
    ],
    tags: ["VMS", "Enterprise", "Multi-sede", "Integraciones"],
  },
  {
    name: "Winsted",
    logo: "/partners/winsted.png",
    tagline: "Consolas y mobiliario para centros de control 24/7.",
    bullets: [
      "Diseño ergonómico y operación continua",
      "Integración con salas de monitoreo",
      "Implementación profesional y ordenamiento",
    ],
    tags: ["NOC/SOC", "Control room", "24/7", "Ergonomía"],
  },
  {
    name: "Invenzi",
    logo: "/partners/invenzi.png",
    tagline: "Control de acceso y gestión de identidades para enterprise.",
    bullets: [
      "Políticas de acceso por roles y zonas",
      "Trazabilidad y auditoría operativa",
      "Escalabilidad para múltiples sedes",
    ],
    tags: ["Control de acceso", "Identidades", "Auditoría", "Enterprise"],
  },
  {
    name: "Altronix",
    logo: "/partners/altronix.png",
    tagline: "Energía y distribución para infraestructura de seguridad.",
    bullets: [
      "Fuentes y distribución para sistemas críticos",
      "Mejores prácticas de protección eléctrica",
      "Diseño ordenado y mantenible",
    ],
    tags: ["Power", "Distribución", "Protección", "Infraestructura"],
  },
  {
    name: "Automated Logic",
    logo: "/partners/automated-logic.png",
    tagline: "BMS para edificios inteligentes y operación eficiente.",
    bullets: [
      "Integración de subsistemas y automatización",
      "Monitoreo centralizado y control",
      "Eficiencia operativa y mantenimiento",
    ],
    tags: ["BMS", "Edificios inteligentes", "Automatización", "Eficiencia"],
  },
  {
    name: "Velasea",
    logo: "/partners/velasea.png",
    tagline: "Soluciones tecnológicas para operación y continuidad.",
    bullets: [
      "Soporte a proyectos de infraestructura",
      "Componentes para despliegue enterprise",
      "Enfoque en disponibilidad y operación",
    ],
    tags: ["Infraestructura", "Continuidad", "Enterprise", "Soporte"],
  },

  // ✅ ACTUALIZADO: MAGOS (Radar + MASS+AI + integración VMS/PTZ + reducción falsas alarmas)
  {
    name: "Magos",
    logo: "/partners/magos.png",
    tagline: "Radars de vigilancia terrestre para protección perimetral con fusión radar+cámara (MASS+AI).",
    bullets: [
      "Detección y seguimiento de intrusos en grandes perímetros, incluso en condiciones complejas",
      "Integración con VMS/PSIM y cámaras PTZ para verificación y tracking automático",
      "Clasificación por IA en conjunto con MASS+AI para reducir alarmas molestas y mejorar la respuesta",
    ],
    tags: ["Radar perimetral", "MASS+AI", "PTZ tracking", "Integración VMS"],
  },

  {
    name: "Digital Watchdog",
    logo: "/partners/digital.png",
    tagline: "Soluciones VMS y video para múltiples escenarios.",
    bullets: [
      "Implementaciones orientadas a operación",
      "Escenarios comerciales e industriales",
      "Enfoque en usabilidad y gestión",
    ],
    tags: ["Video", "VMS", "Operación", "Escalabilidad"],
  },
];

export default function PartnersPage() {
  return (
    <main className="min-h-screen">
      <div className="h-20" />

      {/* HERO */}
      <section className="border-b bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-600">
            Partners tecnológicos
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">
            Integraciones abiertas, operación enterprise
          </h1>
          <p className="mt-4 max-w-3xl text-slate-700">
            Trabajamos con fabricantes y plataformas reconocidas para diseñar arquitecturas
            escalables, integradas y listas para operación crítica.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/contacto"
              className="rounded-xl bg-slate-900 px-5 py-3 text-center text-sm font-semibold text-white hover:opacity-90"
            >
              Solicitar asesoría
            </Link>
            <Link
              href="/proyectos"
              className="rounded-xl border px-5 py-3 text-center text-sm font-semibold hover:bg-white"
            >
              Ver proyectos
            </Link>
          </div>
        </div>
      </section>

      {/* GRID */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <motion.div
          layout
          className="grid gap-5 md:grid-cols-2"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          {PARTNERS.map((p) => (
            <motion.article
              key={p.name}
              layout
              className="rounded-2xl border bg-white p-6 shadow-[0_20px_80px_rgba(0,0,0,0.06)] hover:bg-slate-50"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  {/* ✅ Logo más grande y más legible */}
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl border bg-white shadow-sm">
                    <img
                      src={p.logo}
                      alt={p.name}
                      className="h-10 w-auto object-contain md:h-12"
                      loading="lazy"
                    />
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold">{p.name}</h2>
                    <p className="mt-1 text-sm text-slate-600">{p.tagline}</p>
                  </div>
                </div>
              </div>

              <ul className="mt-5 list-disc space-y-1 pl-5 text-sm text-slate-700">
                {p.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>

              <div className="mt-5 flex flex-wrap gap-2">
                {p.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border bg-white px-3 py-1 text-xs font-semibold text-slate-600"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </motion.article>
          ))}
        </motion.div>
      </section>

      {/* CTA */}
      <section className="bg-slate-950">
        <div className="mx-auto max-w-6xl px-4 py-16 text-white">
          <div className="grid gap-8 md:grid-cols-12 md:items-center">
            <div className="md:col-span-8">
              <h2 className="text-3xl font-semibold tracking-tight">
                Diseñemos tu arquitectura
              </h2>
              <p className="mt-3 text-white/75">
                Levantamiento, integración y puesta en marcha con enfoque enterprise y soporte.
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
                Integración • Documentación • Puesta en marcha
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
