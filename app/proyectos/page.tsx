import Link from "next/link";

const PROJECTS = [
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
  },
  {
    title: "Control de acceso y trazabilidad de visitantes",
    sector: "Banca / Corporativo",
    scope: ["Accesos", "Visitantes", "Reportes", "Cumplimiento"],
    solution: [
      "Diseño de flujos de acceso por áreas",
      "Gestión de credenciales y visitantes",
      "Reportes para auditoría interna",
    ],
    result: [
      "Mayor control y seguridad por zonas",
      "Registro confiable de eventos",
      "Mejor experiencia operativa",
    ],
  },
  {
    title: "Automatización y monitoreo de infraestructura",
    sector: "Industrial",
    scope: ["Monitoreo", "Alarmas", "Integración", "Continuidad operativa"],
    solution: [
      "Levantamiento y definición de puntos críticos",
      "Integración de señales y alertas",
      "Paneles de monitoreo y procedimientos",
    ],
    result: [
      "Respuesta más rápida ante incidentes",
      "Reducción de fallas operativas",
      "Mejor visibilidad del estado de planta",
    ],
  },
  {
    title: "Seguridad electrónica integral para instalación crítica",
    sector: "Gubernamental / Institucional",
    scope: ["CCTV", "Analítica", "Perímetro", "Operación"],
    solution: [
      "Diseño de cobertura y zonificación",
      "Implementación de analítica según riesgos",
      "Documentación y puesta en marcha",
    ],
    result: [
      "Cobertura alineada a riesgos",
      "Mejora de detección y disuasión",
      "Operación más eficiente",
    ],
  },
  {
    title: "Edificios inteligentes y gestión de servicios",
    sector: "Comercial",
    scope: ["BMS", "Eficiencia", "Alarmas", "Mantenimiento"],
    solution: [
      "Integración de subsistemas del edificio",
      "Tableros de operación y control",
      "Procedimientos y mantenimiento preventivo",
    ],
    result: [
      "Mayor control de infraestructura",
      "Optimización operativa",
      "Planificación de mantenimiento",
    ],
  },
  {
    title: "Respaldo de energía para continuidad operativa",
    sector: "Banca / Industrial",
    scope: ["Energía", "Respaldo", "Protección", "Disponibilidad"],
    solution: [
      "Evaluación de cargas y criticidad",
      "Diseño de respaldo y protección",
      "Implementación y pruebas",
    ],
    result: [
      "Mayor disponibilidad de servicios",
      "Protección ante variaciones eléctricas",
      "Continuidad en operación crítica",
    ],
  },
];

function Tag({ text }: { text: string }) {
  return (
    <span className="rounded-full border px-3 py-1 text-xs text-slate-600">
      {text}
    </span>
  );
}

export default function Proyectos() {
  return (
    <div>
      {/* HERO */}
      <section className="border-b bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-600">
            Proyectos y experiencia
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">
            Implementaciones para entornos enterprise
          </h1>
          <p className="mt-4 max-w-3xl text-slate-700">
            Presentamos casos tipo y alcances representativos (sin datos sensibles) de proyectos
            en automatización, seguridad electrónica y energía, orientados a operación crítica y
            continuidad de servicio.
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
        </div>
      </section>

      {/* GRID */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-4 md:grid-cols-2">
          {PROJECTS.map((p) => (
            <article key={p.title} className="rounded-2xl border bg-white p-6 hover:bg-slate-50">
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-lg font-semibold">{p.title}</h2>
                <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                  {p.sector}
                </span>
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

              <div className="mt-6">
                <Link
                  href="/contacto"
                  className="inline-flex rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-white"
                >
                  Solicitar propuesta
                </Link>
              </div>
            </article>
          ))}
        </div>
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
