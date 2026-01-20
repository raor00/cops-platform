import Link from "next/link";

const SOLUTIONS = [
  {
    t: "Seguridad electrónica integral",
    d: "Diseño e implementación de soluciones robustas para operación crítica.",
    items: ["CCTV y analítica", "Arquitectura y almacenamiento", "Operación multi-sede"],
  },
  {
    t: "VMS / Gestión de video",
    d: "Estandarización y control por roles para monitoreo y auditoría.",
    items: ["Roles y permisos", "Auditoría y trazabilidad", "Escalabilidad por sedes"],
  },
  {
    t: "Control de acceso e identidades",
    d: "Gestión de accesos, visitantes y reportes para entornos regulados.",
    items: ["Zonificación y reglas", "Visitantes y credenciales", "Reporteres y alertas"],
  },
  {
    t: "Edificios inteligentes (BMS)",
    d: "Monitoreo y control para eficiencia operativa y continuidad.",
    items: ["Alarmas y control", "Tableros de operación", "Optimización energética"],
  },
  {
    t: "Energía y respaldo",
    d: "Continuidad operativa para infraestructura crítica.",
    items: ["Respaldo y disponibilidad", "Protección eléctrica", "Pruebas y mantenimiento"],
  },
  {
    t: "Integración e interoperabilidad",
    d: "Unificamos plataformas y subsistemas para una operación centralizada.",
    items: ["Integración entre sistemas", "Procedimientos y operación", "Documentación y QA"],
  },
];

const PROCESS = [
  { n: "01", t: "Levantamiento", d: "Requerimientos, riesgos, alcance y criticidad." },
  { n: "02", t: "Arquitectura", d: "Diseño, dimensionamiento y escalabilidad." },
  { n: "03", t: "Implementación", d: "Instalación, integración y configuración." },
  { n: "04", t: "Puesta en marcha", d: "Pruebas, QA, actas y capacitación." },
  { n: "05", t: "Soporte", d: "Mantenimiento, mejoras y continuidad operativa." },
];

export default function Soluciones() {
  return (
    <div>
      {/* HERO */}
      <section className="border-b bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-600">
            Soluciones
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">
            Arquitectura, integración y operación para entornos críticos
          </h1>
          <p className="mt-4 max-w-3xl text-slate-700">
            Con 28 años de trayectoria y más de 1500 obras ejecutadas, diseñamos soluciones
            enterprise en automatización, seguridad y energía para banca, industria, comercio
            e instituciones gubernamentales.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/contacto"
              className="rounded-xl bg-slate-900 px-5 py-3 text-center text-sm font-semibold text-white hover:opacity-90"
            >
              Solicitar consultoría gratuita
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

      {/* CARDS */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-3xl font-semibold tracking-tight">Áreas de servicio</h2>
        <p className="mt-2 text-slate-700">
          Implementación, integración y soporte con foco en calidad, documentación y continuidad.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {SOLUTIONS.map((s) => (
            <article key={s.t} className="rounded-2xl border bg-white p-6 hover:bg-slate-50">
              <h3 className="font-semibold">{s.t}</h3>
              <p className="mt-2 text-sm text-slate-700">{s.d}</p>
              <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-slate-600">
                {s.items.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      {/* PROCESO */}
      <section className="border-y bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-3xl font-semibold tracking-tight">Metodología</h2>
          <p className="mt-2 text-slate-700">
            Estructura clara para asegurar resultados consistentes en proyectos enterprise.
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-5">
            {PROCESS.map((p) => (
              <div key={p.n} className="rounded-2xl border p-6 hover:bg-slate-50">
                <p className="text-xs font-semibold text-slate-500">{p.n}</p>
                <h3 className="mt-2 font-semibold">{p.t}</h3>
                <p className="mt-2 text-sm text-slate-700">{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-slate-950">
        <div className="mx-auto max-w-6xl px-4 py-16 text-white">
          <div className="grid gap-8 md:grid-cols-12 md:items-center">
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
          </div>
        </div>
      </section>
    </div>
  );
}
