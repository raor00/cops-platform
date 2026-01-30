// components/home/HomeTrajectory.tsx
export default function HomeTrajectory() {
  return (
    <section className="relative border-t border-white/10 bg-slate-950/40">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-stretch">
          {/* Texto */}
          <div className="lg:col-span-8">
            <p className="text-xs font-semibold tracking-[0.2em] text-white/60">
              TRAYECTORIA
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              28 años respaldando operación crítica en Venezuela
            </h2>
            <p className="mt-4 text-white/70 leading-relaxed">
              Somos una empresa privada con trayectoria ininterrumpida dedicada a la
              asesoría e implementación de proyectos tecnológicos de alta gama en
              automatización, seguridad y energía, con enfoque enterprise para banca, industria,
              comercio e instituciones gubernamentales.
            </p>

            <div className="mt-7 flex flex-wrap gap-2">
 <div className="mt-8 grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur md:grid-cols-12">
  <div className="md:col-span-8">
    <p className="text-xs font-semibold tracking-[0.2em] text-white/60">
      LO QUE ENTREGAMOS
    </p>

    <ul className="mt-3 grid gap-2 text-sm text-white/75 sm:grid-cols-2">
      <li className="flex gap-2">
        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-white/60" />
        Arquitectura lista para multi-sede y escalabilidad
      </li>
      <li className="flex gap-2">
        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-white/60" />
        Integración multi-marca con trazabilidad y roles
      </li>
      <li className="flex gap-2">
        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-white/60" />
        Documentación, QA y actas de puesta en marcha
      </li>
      <li className="flex gap-2">
        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-white/60" />
        Acompañamiento post-implementación y soporte
      </li>
    </ul>
  </div>

  {/* CTA */}
  <div className="md:col-span-4 md:flex md:items-center md:justify-end">
    <div className="w-full rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-sm font-semibold text-white">¿Quieres ver el enfoque?</p>
      <p className="mt-1 text-xs text-white/60">
        Metodología por fases, entregables y control de calidad.
      </p>

      <div className="mt-4 flex gap-2">
        <a
          href="/proyectos"
          className="inline-flex flex-1 justify-center rounded-xl bg-white px-4 py-2 text-xs font-semibold text-slate-900 hover:opacity-90"
        >
          Ver proyectos
        </a>
        <a
          href="/soluciones#metodologia"
          className="inline-flex flex-1 justify-center rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white hover:bg-white/10"
        >
          Cómo trabajamos
        </a>
      </div>
    </div>
  </div>
</div>

</div>
          </div>

          {/* Métricas */}
            <div className="lg:col-span-4">
            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                <p className="text-3xl font-semibold tracking-tight text-white">28+</p>
                <p className="mt-1 text-sm text-white/60">Años de trayectoria</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                <p className="text-3xl font-semibold tracking-tight text-white">1500+</p>
                <p className="mt-1 text-sm text-white/60">Obras ejecutadas</p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur">
                <p className="text-3xl font-semibold tracking-tight text-white">Enterprise</p>
                <p className="mt-1 text-sm text-white/60">
                  Arquitectura + implementación + soporte
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
