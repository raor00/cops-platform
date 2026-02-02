export default function HomeSectors() {
  return (
    <section className="border-y border-slate-200 bg-surface-alt">
      <div className="mx-auto max-w-6xl px-4 py-20">
        <div className="reveal"><h2 className="text-3xl font-bold tracking-tight text-brand-950">Sectores</h2><p className="mt-2 text-slate-600">Experiencia en entornos donde la disponibilidad, auditoría y continuidad operativa son prioridad.</p></div>
        <div className="reveal-stagger mt-12 grid gap-5 md:grid-cols-4">
          {[
            { t: "Bancario", d: "Operación crítica, control por roles, trazabilidad y estándares." },
            { t: "Industrial", d: "Seguridad, monitoreo, automatización y continuidad en planta." },
            { t: "Comercial", d: "Protección integral, control de accesos, operación multi-sede." },
            { t: "Gubernamental", d: "Implementaciones con enfoque en cumplimiento y operación robusta." },
          ].map((x) => (
            <div key={x.t} className="reveal card-lift rounded-2xl border border-slate-200 bg-white p-6">
              <h3 className="font-semibold text-brand-800">{x.t}</h3>
              <p className="mt-2 text-sm text-slate-600">{x.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
