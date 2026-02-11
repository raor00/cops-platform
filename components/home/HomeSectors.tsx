export default function HomeSectors() {
  return (
    <section className="relative border-t border-white/[0.06]">
      <div className="pointer-events-none absolute -top-40 right-[20%] h-72 w-[400px] rounded-full bg-brand-600/8 blur-3xl" />
      <div className="mx-auto max-w-6xl px-4 py-20">
        <div className="reveal"><h2 className="text-3xl font-bold tracking-tight text-white">Sectores</h2><p className="mt-2 text-white/55">Experiencia en entornos donde la disponibilidad, auditoría y continuidad operativa son prioridad.</p></div>
        <div className="reveal-stagger mt-12 grid gap-5 md:grid-cols-4">
          {[
            { t: "Bancario", d: "Operación crítica, control por roles, trazabilidad y estándares." },
            { t: "Industrial", d: "Seguridad, monitoreo, automatización y continuidad en planta." },
            { t: "Comercial", d: "Protección integral, control de accesos, operación multi-sede." },
            { t: "Gubernamental", d: "Implementaciones con enfoque en cumplimiento y operación robusta." },
          ].map((x) => (
            <div key={x.t} className="reveal lg-card p-6">
              <h3 className="font-semibold text-brand-300">{x.t}</h3>
              <p className="mt-2 text-sm text-white/55">{x.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
