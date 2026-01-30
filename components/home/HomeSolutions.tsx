// components/home/HomeSolutions.tsx
import Link from "next/link";

export default function HomeSolutions() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">
            Soluciones para operación crítica
          </h2>
          <p className="mt-2 max-w-2xl text-slate-700">
            Diseñamos arquitectura tecnológica enterprise enfocada en
            disponibilidad, trazabilidad y escalabilidad. El objetivo no es
            instalar, es dejar la operación lista.
          </p>
        </div>

        <Link
          href="/soluciones"
          className="inline-flex items-center justify-center rounded-xl border px-5 py-3 text-sm font-semibold hover:bg-slate-50"
        >
          Ver todas las soluciones
        </Link>
      </div>

      {/* Cards preview */}
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {[
          {
            t: "Seguridad electrónica enterprise",
            d: "CCTV, control de acceso y analítica integrados bajo estándares de operación crítica.",
            b: ["Arquitectura", "Integración", "Auditoría"],
          },
          {
            t: "Gestión de video (VMS)",
            d: "Estandarización multi-sede con control por roles, trazabilidad y escalabilidad.",
            b: ["Multi-sede", "Roles", "Escala"],
          },
          {
            t: "Automatización y BMS",
            d: "Monitoreo, alarmas y control para infraestructura crítica y edificios inteligentes.",
            b: ["Continuidad", "Eficiencia", "Control"],
          },
        ].map((x) => (
          <article
            key={x.t}
            className="rounded-2xl border bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <h3 className="text-base font-semibold">{x.t}</h3>
            <p className="mt-2 text-sm text-slate-700">{x.d}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              {x.b.map((b) => (
                <span
                  key={b}
                  className="rounded-full border px-3 py-1 text-xs text-slate-600"
                >
                  {b}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
