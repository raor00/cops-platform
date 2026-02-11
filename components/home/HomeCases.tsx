import Link from "next/link";
export default function HomeCases() {
  return (
    <section className="relative border-t border-white/[0.06]">
      <div className="mx-auto max-w-6xl px-4 py-20">
        <div className="reveal flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[10px] font-bold tracking-[0.25em] text-brand-400">PROYECTOS ENTERPRISE</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-white">Casos destacados (sin datos sensibles)</h2>
            <p className="mt-2 max-w-2xl text-white/55">Experiencia en banca nacional, operación multi-sede e infraestructura crítica.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/proyectos" className="btn-glass">Ver todos</Link>
            <Link href="/contacto" className="btn-glass-primary">Agendar reunión</Link>
          </div>
        </div>
        <div className="reveal-stagger mt-12 grid gap-5 md:grid-cols-3">
          {[
            { t: "Operación multi-sede con VMS", s: "Banca", d: "Estandarización, control por roles y trazabilidad para monitoreo centralizado.", tags: ["Arquitectura", "Roles", "Auditoría"] },
            { t: "Control de acceso y visitantes", s: "Enterprise", d: "Zonificación, credenciales y reportes para cumplimiento y control operativo.", tags: ["Identidades", "Visitantes", "Reportes"] },
            { t: "Automatización y monitoreo (BMS)", s: "Infraestructura", d: "Integración de señales, alarmas y tableros para continuidad operativa.", tags: ["Integración", "Alarmas", "Operación"] },
          ].map((x) => (
            <article key={x.t} className="reveal lg-card p-6">
              <div className="flex items-start justify-between gap-4">
                <h3 className="font-semibold text-white">{x.t}</h3>
                <span className="tag-glass shrink-0">{x.s}</span>
              </div>
              <p className="mt-3 text-sm text-white/55">{x.d}</p>
              <div className="mt-4 flex flex-wrap gap-2">{x.tags.map((t) => <span key={t} className="tag-glass">{t}</span>)}</div>
              <div className="mt-6"><Link href="/proyectos" className="btn-glass text-sm !px-4 !py-2">Ver detalles</Link></div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
