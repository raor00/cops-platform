// components/home/HomeDifferentiators.tsx
export default function HomeDifferentiators() {
  return (
    <section className="bg-slate-950/40 border-t border-white/10">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <p className="text-xs font-semibold tracking-[0.2em] text-white/60">
          DIFERENCIADORES
        </p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Experiencia real en banca y operación crítica
        </h2>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            {
              t: "Integración multi-marca",
              d: "Arquitecturas abiertas (VMS, control de acceso, CCTV, BMS, energía) sin depender de un solo fabricante.",
            },
            {
              t: "Escalabilidad enterprise",
              d: "Diseños listos para multi-sede, estandarización de modelos piloto y despliegue por fases.",
            },
            {
              t: "Soporte y continuidad",
              d: "Planificación, documentación y acompañamiento post-implementación para operación estable.",
            },
          ].map((s) => (
            <div
              key={s.t}
              className="rounded-2xl border border-white/10 bg-white/5 p-6"
            >
              <h3 className="text-base font-semibold tracking-tight text-white">
                {s.t}
              </h3>
              <p className="mt-3 text-sm text-white/60 leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
