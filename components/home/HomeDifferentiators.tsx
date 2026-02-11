export default function HomeDifferentiators() {
  return (
    <section className="dark-section noise relative overflow-hidden border-t border-white/[0.06]">
      <div className="liquid-orb liquid-orb-1 -top-40 left-1/2 h-[500px] w-[600px] -translate-x-1/2 bg-brand-500/8" />
      <div className="relative mx-auto max-w-6xl px-4 py-14">
        <div className="reveal"><p className="text-[10px] font-bold tracking-[0.25em] text-brand-300">DIFERENCIADORES</p><h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">Experiencia real en banca y operación crítica</h2></div>
        <div className="reveal-stagger mt-10 grid gap-5 md:grid-cols-3">
          {[
            { t: "Integración multi-marca", d: "Arquitecturas abiertas (VMS, control de acceso, CCTV, BMS, energía) sin depender de un solo fabricante." },
            { t: "Escalabilidad enterprise", d: "Diseños listos para multi-sede, estandarización de modelos piloto y despliegue por fases." },
            { t: "Soporte y continuidad", d: "Planificación, documentación y acompañamiento post-implementación para operación estable." },
          ].map((s) => (
            <div key={s.t} className="reveal lg-card card-lift-dark p-6">
              <h3 className="text-base font-semibold text-white">{s.t}</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/55">{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
