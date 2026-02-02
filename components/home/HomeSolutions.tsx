import Link from "next/link";
export default function HomeSolutions() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20">
      <div className="reveal flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-brand-950">Soluciones para operación crítica</h2>
          <p className="mt-2 max-w-2xl text-slate-600">Diseñamos arquitectura tecnológica enterprise enfocada en disponibilidad, trazabilidad y escalabilidad.</p>
        </div>
        <Link href="/soluciones" className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold transition hover:bg-slate-50">Ver todas las soluciones</Link>
      </div>
      <div className="reveal-stagger mt-12 grid gap-5 md:grid-cols-3">
        {[
          { t: "Seguridad electrónica enterprise", d: "CCTV, control de acceso y analítica integrados bajo estándares de operación crítica.", b: ["Arquitectura", "Integración", "Auditoría"] },
          { t: "Gestión de video (VMS)", d: "Estandarización multi-sede con control por roles, trazabilidad y escalabilidad.", b: ["Multi-sede", "Roles", "Escala"] },
          { t: "Automatización y BMS", d: "Monitoreo, alarmas y control para infraestructura crítica y edificios inteligentes.", b: ["Continuidad", "Eficiencia", "Control"] },
        ].map((x) => (
          <article key={x.t} className="reveal card-lift rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="text-base font-semibold text-brand-950">{x.t}</h3>
            <p className="mt-2 text-sm text-slate-600">{x.d}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {x.b.map((b) => <span key={b} className="rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">{b}</span>)}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
