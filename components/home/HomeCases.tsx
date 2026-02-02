import Link from "next/link";
export default function HomeCases() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20">
      <div className="reveal flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-[0.25em] text-brand-600">PROYECTOS ENTERPRISE</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-brand-950">Casos destacados (sin datos sensibles)</h2>
          <p className="mt-2 max-w-2xl text-slate-600">Experiencia en banca nacional, operación multi-sede e infraestructura crítica.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/proyectos" className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold transition hover:bg-slate-50">Ver todos</Link>
          <Link href="/contacto" className="rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-brand-600/20 transition hover:bg-brand-500">Agendar reunión</Link>
        </div>
      </div>
      <div className="reveal-stagger mt-12 grid gap-5 md:grid-cols-3">
        {[
          { t: "Operación multi-sede con VMS", s: "Banca", d: "Estandarización, control por roles y trazabilidad para monitoreo centralizado.", tags: ["Arquitectura", "Roles", "Auditoría"] },
          { t: "Control de acceso y visitantes", s: "Enterprise", d: "Zonificación, credenciales y reportes para cumplimiento y control operativo.", tags: ["Identidades", "Visitantes", "Reportes"] },
          { t: "Automatización y monitoreo (BMS)", s: "Infraestructura", d: "Integración de señales, alarmas y tableros para continuidad operativa.", tags: ["Integración", "Alarmas", "Operación"] },
        ].map((x) => (
          <article key={x.t} className="reveal card-lift rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-start justify-between gap-4">
              <h3 className="font-semibold text-brand-950">{x.t}</h3>
              <span className="shrink-0 rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white">{x.s}</span>
            </div>
            <p className="mt-3 text-sm text-slate-600">{x.d}</p>
            <div className="mt-4 flex flex-wrap gap-2">{x.tags.map((t) => <span key={t} className="rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs text-brand-700">{t}</span>)}</div>
            <div className="mt-6"><Link href="/proyectos" className="inline-flex rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold transition hover:bg-slate-50">Ver detalles</Link></div>
          </article>
        ))}
      </div>
    </section>
  );
}
