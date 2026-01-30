// components/home/HomeProcess.tsx
import Link from "next/link";

export default function HomeProcess() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">
            Metodología orientada a operación
          </h2>
          <p className="mt-2 max-w-2xl text-slate-700">
            Trabajamos por fases claras, con entregables definidos, control de
            calidad y foco en dejar la operación estable, auditable y escalable.
          </p>
        </div>

        <Link
          href="/soluciones#metodologia"
          className="inline-flex items-center justify-center rounded-xl border px-5 py-3 text-sm font-semibold hover:bg-slate-50"
        >
          Ver metodología completa
        </Link>
      </div>

      {/* Preview de fases */}
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {[
          {
            n: "01",
            t: "Levantamiento y diagnóstico",
            d: "Análisis técnico, riesgos, alcance y requerimientos operativos.",
          },
          {
            n: "02",
            t: "Arquitectura e integración",
            d: "Diseño enterprise, selección tecnológica y definición de estándares.",
          },
          {
            n: "03",
            t: "Implementación y puesta en marcha",
            d: "Integración, pruebas, documentación y validación operativa.",
          },
        ].map((x) => (
          <article
            key={x.n}
            className="rounded-2xl border bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <p className="text-xs font-semibold text-slate-500">{x.n}</p>
            <h3 className="mt-2 text-base font-semibold">{x.t}</h3>
            <p className="mt-2 text-sm text-slate-700">{x.d}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
