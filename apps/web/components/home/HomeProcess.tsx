import Link from "next/link";
export default function HomeProcess() {
  return (
    <section className="relative border-t border-white/[0.06]">
      <div className="mx-auto max-w-6xl px-4 py-20">
        <div className="reveal flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div><h2 className="text-3xl font-bold tracking-tight text-white">Metodología orientada a operación</h2><p className="mt-2 max-w-2xl text-white/55">Trabajamos por fases claras, con entregables definidos, control de calidad y foco en dejar la operación estable.</p></div>
          <Link href="/soluciones#metodologia" className="btn-glass">Ver metodología completa</Link>
        </div>
        <div className="relative mt-12 isolate">
          {/* Animated path connecting steps (Vertical on Mobile, Horizontal on Desktop) */}
          <div className="absolute left-[27px] top-12 -z-10 block h-[calc(100%-80px)] w-0.5 rounded-full bg-gradient-to-b from-brand-400 via-cyan-400 to-transparent md:hidden" />
          <div className="absolute left-1/2 top-8 -z-10 hidden h-0.5 w-[calc(100%-100px)] -translate-x-1/2 rounded-full bg-gradient-to-r from-brand-400 via-cyan-400 to-transparent md:block" />

          <div className="reveal-stagger flex flex-col gap-8 md:grid md:grid-cols-3 md:gap-5">
            {[
              { n: "01", t: "Levantamiento y diagnóstico", d: "Análisis técnico, riesgos, alcance y requerimientos operativos." },
              { n: "02", t: "Arquitectura e integración", d: "Diseño enterprise, selección tecnológica y definición de estándares." },
              { n: "03", t: "Implementación y puesta en marcha", d: "Integración, pruebas, documentación y validación operativa." },
            ].map((x) => (
              <article key={x.n} className="reveal relative group flex items-start md:block">
                {/* Glowing Node on the line */}
                <div className="absolute left-6 md:left-1/2 top-7 md:top-8 -translate-x-1/2 -translate-y-1/2 z-0 h-3 w-3 rounded-full border border-cyan-300 bg-brand-400 shadow-[0_0_15px_rgba(34,211,238,0.6)] transition-all duration-300 group-hover:scale-150" />

                {/* Card Container */}
                <div className="ml-16 w-full md:ml-0 md:mt-16 lg-card p-6 min-h-[160px] border border-white/5 transition-colors hover:border-cyan-500/30">
                  <p className="text-[10px] font-black tracking-widest text-cyan-400 uppercase">Etapa {x.n}</p>
                  <h3 className="mt-3 text-lg font-bold text-white leading-snug">{x.t}</h3>
                  <p className="mt-2 text-sm text-slate-400 leading-relaxed">{x.d}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
