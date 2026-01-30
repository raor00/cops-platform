// components/home/HomeCases.tsx
import Link from "next/link";

export default function HomeCases() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-600">
            Proyectos enterprise
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">
            Casos destacados (sin datos sensibles)
          </h2>
          <p className="mt-2 max-w-2xl text-slate-700">
            Experiencia en banca nacional, operación multi-sede e infraestructura crítica.
            Mostramos alcances tipo: arquitectura, integración y continuidad operativa.
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/proyectos"
            className="rounded-xl border px-5 py-3 text-sm font-semibold hover:bg-white"
          >
            Ver todos los proyectos
          </Link>
          <Link
            href="/contacto"
            className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:opacity-90"
          >
            Agendar reunión
          </Link>
        </div>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {[
          {
            t: "Operación multi-sede con VMS",
            s: "Banca",
            d: "Estandarización, control por roles y trazabilidad para monitoreo centralizado.",
            tags: ["Arquitectura", "Roles", "Auditoría"],
          },
          {
            t: "Control de acceso y visitantes",
            s: "Enterprise",
            d: "Zonificación, credenciales y reportes para cumplimiento y control operativo.",
            tags: ["Identidades", "Visitantes", "Reportes"],
          },
          {
            t: "Automatización y monitoreo (BMS)",
            s: "Infraestructura crítica",
            d: "Integración de señales, alarmas y tableros para continuidad operativa.",
            tags: ["Integración", "Alarmas", "Operación"],
          },
        ].map((x) => (
          <article key={x.t} className="rounded-2xl border bg-white p-6 hover:bg-slate-50">
            <div className="flex items-start justify-between gap-4">
              <h3 className="font-semibold">{x.t}</h3>
              <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                {x.s}
              </span>
            </div>

            <p className="mt-3 text-sm text-slate-700">{x.d}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              {x.tags.map((t) => (
                <span key={t} className="rounded-full border px-3 py-1 text-xs text-slate-600">
                  {t}
                </span>
              ))}
            </div>

            <div className="mt-6">
              <Link
                href="/proyectos"
                className="inline-flex rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-white"
              >
                Ver detalles
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
