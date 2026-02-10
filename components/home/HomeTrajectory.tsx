export default function HomeTrajectory() {
  return (
    <section className="dark-section noise relative border-t border-white/[0.06]">
      <div className="relative mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-stretch">
          <div className="lg:col-span-8">
            <div className="reveal">
              <p className="text-[10px] font-bold tracking-[0.25em] text-brand-300">TRAYECTORIA</p>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">28 años respaldando operación crítica en Venezuela</h2>
              <p className="mt-4 leading-relaxed text-white/60">Somos una empresa privada con trayectoria ininterrumpida dedicada a la asesoría e implementación de proyectos tecnológicos de alta gama en automatización, seguridad y energía, con enfoque enterprise para banca, industria, comercio e instituciones gubernamentales.</p>
            </div>
            <div className="reveal mt-8 lg-card p-6 md:grid md:grid-cols-12 md:gap-4">
              <div className="md:col-span-8">
                <p className="text-[10px] font-bold tracking-[0.25em] text-brand-300">LO QUE ENTREGAMOS</p>
                <ul className="mt-4 grid gap-3 text-sm text-white/65 sm:grid-cols-2">
                  {["Arquitectura lista para multi-sede y escalabilidad", "Integración multi-marca con trazabilidad y roles", "Documentación, QA y actas de puesta en marcha", "Acompañamiento post-implementación y soporte"].map((t) => (
                    <li key={t} className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" /><span>{t}</span></li>
                  ))}
                </ul>
              </div>
              <div className="mt-6 md:col-span-4 md:mt-0 md:flex md:items-center md:justify-end">
                <div className="dark-glass-card w-full p-4">
                  <p className="text-sm font-semibold text-white">¿Quieres ver el enfoque?</p>
                  <p className="mt-1 text-xs text-white/45">Metodología por fases, entregables y control de calidad.</p>
                  <div className="mt-4 flex gap-2">
                    <a href="/proyectos" className="btn-glass-primary flex-1 text-center text-xs !px-3 !py-2">Proyectos</a>
                    <a href="/soluciones#metodologia" className="btn-glass flex-1 text-center text-xs !px-3 !py-2">Metodología</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-4">
            <div className="reveal-stagger grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              <div className="reveal lg-card card-lift-dark p-6"><p className="text-3xl font-bold tracking-tight text-white">28+</p><p className="mt-1 text-sm text-white/45">Años de trayectoria</p></div>
              <div className="reveal lg-card card-lift-dark p-6"><p className="text-3xl font-bold tracking-tight text-white">1500+</p><p className="mt-1 text-sm text-white/45">Obras ejecutadas</p></div>
              <div className="reveal lg-card card-lift-dark border-brand-500/15 p-6"><p className="text-3xl font-bold tracking-tight text-brand-300">Enterprise</p><p className="mt-1 text-sm text-white/45">Arquitectura + implementación + soporte</p></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
