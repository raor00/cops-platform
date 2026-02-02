import Link from "next/link";
export default function HomeProcess() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20">
      <div className="reveal flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div><h2 className="text-3xl font-bold tracking-tight text-brand-950">Metodología orientada a operación</h2><p className="mt-2 max-w-2xl text-slate-600">Trabajamos por fases claras, con entregables definidos, control de calidad y foco en dejar la operación estable.</p></div>
        <Link href="/soluciones#metodologia" className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold transition hover:bg-slate-50">Ver metodología completa</Link>
      </div>
      <div className="reveal-stagger mt-12 grid gap-5 md:grid-cols-3">
        {[
          { n: "01", t: "Levantamiento y diagnóstico", d: "Análisis técnico, riesgos, alcance y requerimientos operativos." },
          { n: "02", t: "Arquitectura e integración", d: "Diseño enterprise, selección tecnológica y definición de estándares." },
          { n: "03", t: "Implementación y puesta en marcha", d: "Integración, pruebas, documentación y validación operativa." },
        ].map((x) => (
          <article key={x.n} className="reveal card-lift rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-xs font-bold text-brand-500">{x.n}</p>
            <h3 className="mt-2 text-base font-semibold text-brand-950">{x.t}</h3>
            <p className="mt-2 text-sm text-slate-600">{x.d}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
