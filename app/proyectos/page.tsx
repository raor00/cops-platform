"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  Factory,
  Landmark,
  Shield,
  Camera,
  KeyRound,
  Zap,
  Network,
} from "lucide-react";

type Sector = "Banca" | "Industrial" | "Comercial" | "Gubernamental" | "Mixto";

type Project = {
  title: string;
  sector: Sector;
  scope: string[];
  solution: string[];
  result: string[];
  icon: React.ReactNode;
};

const PROJECTS: Project[] = [
  {
    title: "Estandarización de video y operación multi-sede",
    sector: "Banca",
    scope: ["Arquitectura", "Estandarización", "Control por roles", "Auditoría"],
    solution: [
      "Diseño de arquitectura escalable",
      "Integración con VMS y políticas de acceso",
      "Estrategia de almacenamiento y retención",
    ],
    result: [
      "Operación centralizada y controlada",
      "Mejora de trazabilidad y auditoría",
      "Escalabilidad para nuevas sedes",
    ],
    icon: <Camera className="h-5 w-5" />,
  },
  {
    title: "Control de acceso y trazabilidad de visitantes",
    sector: "Banca",
    scope: ["Accesos", "Visitantes", "Reportes", "Cumplimiento"],
    solution: [
      "Flujos de acceso por áreas y niveles",
      "Gestión de credenciales y visitantes",
      "Reportes operativos y auditoría",
    ],
    result: ["Mayor control por zonas", "Registro confiable", "Mejor operación"],
    icon: <KeyRound className="h-5 w-5" />,
  },
  {
    title: "Automatización y monitoreo de infraestructura",
    sector: "Industrial",
    scope: ["Monitoreo", "Alarmas", "Integración", "Continuidad operativa"],
    solution: [
      "Levantamiento y definición de puntos críticos",
      "Integración de señales y alertas",
      "Tableros de monitoreo y procedimientos",
    ],
    result: [
      "Respuesta más rápida ante incidentes",
      "Reducción de fallas operativas",
      "Mejor visibilidad de planta",
    ],
    icon: <Network className="h-5 w-5" />,
  },
  {
    title: "Seguridad electrónica integral para instalación crítica",
    sector: "Gubernamental",
    scope: ["CCTV", "Analítica", "Perímetro", "Operación"],
    solution: [
      "Diseño de cobertura y zonificación",
      "Analítica alineada a riesgos",
      "Documentación y puesta en marcha",
    ],
    result: ["Cobertura alineada a riesgos", "Mejor detección", "Operación eficiente"],
    icon: <Shield className="h-5 w-5" />,
  },
  {
    title: "Edificios inteligentes y gestión de servicios",
    sector: "Comercial",
    scope: ["BMS", "Eficiencia", "Alarmas", "Mantenimiento"],
    solution: [
      "Integración de subsistemas",
      "Tableros de operación y control",
      "Procedimientos y mantenimiento preventivo",
    ],
    result: ["Mayor control", "Optimización operativa", "Planificación de mantenimiento"],
    icon: <Building2 className="h-5 w-5" />,
  },
  {
    title: "Respaldo de energía para continuidad operativa",
    sector: "Mixto",
    scope: ["Energía", "Respaldo", "Protección", "Disponibilidad"],
    solution: [
      "Evaluación de cargas y criticidad",
      "Diseño de respaldo y protección",
      "Implementación y pruebas",
    ],
    result: ["Mayor disponibilidad", "Protección eléctrica", "Continuidad operativa"],
    icon: <Zap className="h-5 w-5" />,
  },
];

const FILTERS: { key: "Todos" | Sector; label: string; icon: React.ReactNode }[] = [
  { key: "Todos", label: "Todos", icon: <Factory className="h-4 w-4" /> },
  { key: "Banca", label: "Banca", icon: <Landmark className="h-4 w-4" /> },
  { key: "Industrial", label: "Industrial", icon: <Factory className="h-4 w-4" /> },
  { key: "Comercial", label: "Comercial", icon: <Building2 className="h-4 w-4" /> },
  { key: "Gubernamental", label: "Gubernamental", icon: <Shield className="h-4 w-4" /> },
  { key: "Mixto", label: "Mixto", icon: <Network className="h-4 w-4" /> },
];

function Tag({ text }: { text: string }) {
  return (
    <span className="rounded-full border px-3 py-1 text-xs text-slate-600">
      {text}
    </span>
  );
}

export default function Proyectos() {
  const [filter, setFilter] = useState<"Todos" | Sector>("Todos");

  const filtered = useMemo(() => {
    if (filter === "Todos") return PROJECTS;
    return PROJECTS.filter((p) => p.sector === filter);
  }, [filter]);

  return (
    <div>
      {/* HERO */}
      <section className="border-b bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-600">
            Proyectos y experiencia
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">
            Implementaciones para entornos enterprise
          </h1>
          <p className="mt-4 max-w-3xl text-slate-700">
            Casos tipo y alcances representativos (sin datos sensibles) en automatización,
            seguridad electrónica y energía para operación crítica.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/contacto"
              className="rounded-xl bg-slate-900 px-5 py-3 text-center text-sm font-semibold text-white hover:opacity-90"
            >
              Agendar reunión técnica
            </Link>
            <Link
              href="/soluciones"
              className="rounded-xl border px-5 py-3 text-center text-sm font-semibold hover:bg-white"
            >
              Ver soluciones
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            <Tag text="Banca nacional" />
            <Tag text="Partners internacionales" />
            <Tag text="Proyectos enterprise" />
            <Tag text="+1500 obras ejecutadas" />
            <Tag text="20 años de trayectoria" />
          </div>

          {/* Filtros */}
          <div className="mt-10 flex flex-wrap gap-2">
            {FILTERS.map((f) => {
              const active = filter === f.key;
              return (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    active ? "bg-slate-900 text-white" : "bg-white hover:bg-slate-100"
                  }`}
                >
                  {f.icon}
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* GRID */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <motion.div
          layout
          className="grid gap-4 md:grid-cols-2"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          {filtered.map((p) => (
            <motion.article
              key={p.title}
              layout
              className="rounded-2xl border bg-white p-6 hover:bg-slate-50"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl border bg-white p-2 text-slate-900">
                    {p.icon}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">{p.title}</h2>
                    <p className="mt-1 text-sm text-slate-600">
                      Sector: <span className="font-medium">{p.sector}</span>
                    </p>
                  </div>
                </div>

                <Link
                  href="/contacto"
                  className="hidden rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-white md:inline-flex"
                >
                  Solicitar propuesta
                </Link>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {p.scope.map((s) => (
                  <Tag key={s} text={s} />
                ))}
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-xs font-semibold text-slate-500">Alcance</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                    {p.scope.slice(0, 4).map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-500">Solución</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                    {p.solution.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-500">Resultado</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                    {p.result.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6 md:hidden">
                <Link
                  href="/contacto"
                  className="inline-flex w-full justify-center rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-white"
                >
                  Solicitar propuesta
                </Link>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </section>

      {/* CTA FINAL */}
      <section className="bg-slate-950">
        <div className="mx-auto max-w-6xl px-4 py-16 text-white">
          <div className="grid gap-8 md:grid-cols-12 md:items-center">
            <div className="md:col-span-8">
              <h2 className="text-3xl font-semibold tracking-tight">
                Conversemos sobre tu proyecto
              </h2>
              <p className="mt-3 text-white/75">
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
      </section>
    </div>
  );
}
