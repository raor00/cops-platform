import Link from "next/link";

const HIGHLIGHTS = [
  { k: "28 años", v: "Trayectoria ininterrumpida" },
  { k: "+1500", v: "Obras ejecutadas" },
  { k: "Enterprise", v: "Banca • Industria • Gobierno" },
  { k: "Integración", v: "Automatización • Seguridad • Energía" },
];

const VALUES = [
  {
    t: "Enfoque enterprise",
    d: "Diseñamos soluciones robustas para operación crítica, continuidad y entornos regulados.",
  },
  {
    t: "Arquitectura y documentación",
    d: "Levantamiento, diseño, planos, configuración y entrega con criterios de calidad.",
  },
  {
    t: "Integración real",
    d: "Unificamos plataformas y subsistemas para operación centralizada y escalable.",
  },
  {
    t: "Soporte y continuidad",
    d: "Acompañamiento post-implementación con mantenimiento, mejoras y respuesta operativa.",
  },
];

export default function Nosotros() {
  return (
    <div>
      {/* HERO */}
      <section className="border-b bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-600">
            COP’S ELECTRONICS, S.A.
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
            28 años impulsando proyectos tecnológicos de alta exigencia
          </h1>

          <p className="mt-4 max-w-3xl text-slate-700">
            Somos una organización privada con <span className="font-semibold">28 años</span> de
            trayectoria ininterrumpida dedicada a la asesoría e implementación de proyectos de alta
            gama en <span className="font-semibold">automatización</span>,{" "}
            <span className="font-semibold">seguridad</span> y{" "}
            <span className="font-semibold">energía</span>, dirigidos a sectores industriales,
            bancarios, comerciales e instituciones gubernamentales.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/contacto"
              className="rounded-xl bg-slate-900 px-5 py-3 text-center text-sm font-semibold text-white hover:opacity-90"
            >
              Agendar reunión técnica
            </Link>
            <Link
              href="/proyectos"
              className="rounded-xl border px-5 py-3 text-center text-sm font-semibold hover:bg-white"
            >
              Ver proyectos
            </Link>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-4">
            {HIGHLIGHTS.map((h) => (
              <div key={h.k} className="rounded-2xl border bg-white p-6">
                <p className="text-2xl font-semibold">{h.k}</p>
                <p className="mt-1 text-sm text-slate-600">{h.v}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HISTORIA */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-10 md:grid-cols-12 md:items-start">
          <div className="md:col-span-7">
            <h2 className="text-3xl font-semibold tracking-tight">Nuestra historia</h2>
            <p className="mt-4 text-slate-700">
              COP’S ELECTRONICS, S.A. ha ejecutado más de{" "}
              <span className="font-semibold">1500 obras</span> que afianzan nuestra gestión técnica
              y comercial en relación a la promoción, instalación y mantenimiento de sistemas de
              seguridad integrales, automatización de procesos, edificios inteligentes y energía.
            </p>

            <p className="mt-4 text-slate-700">
              Nuestro compromiso es brindar atención personalizada, documentar correctamente cada
              implementación y entregar soluciones que mejoren la seguridad, la operación y la
              continuidad ante cualquier situación.
            </p>

            <p className="mt-4 text-slate-700">
              En entornos como la <span className="font-semibold">banca nacional</span> y proyectos
              enterprise, la diferencia está en los detalles: arquitectura, control por roles,
              trazabilidad, procedimientos y soporte.
            </p>
          </div>

          <aside className="md:col-span-5">
            <div className="rounded-3xl border bg-slate-50 p-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-600">
                Lo que nos distingue
              </p>

              <ul className="mt-4 space-y-3 text-sm text-slate-700">
                <li>• Trayectoria comprobada en proyectos de alta exigencia</li>
                <li>• Enfoque en arquitectura, documentación y QA</li>
                <li>• Integración entre plataformas y subsistemas</li>
                <li>• Operación multi-sede y continuidad operativa</li>
              </ul>

              <div className="mt-6">
                <Link
                  href="/contacto"
                  className="inline-flex w-full justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:opacity-90"
                >
                  Solicitar diagnóstico
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* VALORES / DIFERENCIADORES */}
      <section className="border-y bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-3xl font-semibold tracking-tight">En qué creemos</h2>
          <p className="mt-2 text-slate-700">
            La experiencia se traduce en método, control y resultados sostenibles.
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-4">
            {VALUES.map((v) => (
              <div key={v.t} className="rounded-2xl border bg-white p-6 hover:bg-slate-50">
                <h3 className="font-semibold">{v.t}</h3>
                <p className="mt-2 text-sm text-slate-700">{v.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="bg-slate-950">
        <div className="mx-auto max-w-6xl px-4 py-16 text-white">
          <div className="grid gap-8 md:grid-cols-12 md:items-center">
            <div className="md:col-span-8">
              <h2 className="text-3xl font-semibold tracking-tight">
                28 años se sostienen con resultados, método y soporte
              </h2>
              <p className="mt-3 text-white/75">
                Si estás evaluando un proyecto enterprise, conversemos: levantamiento, arquitectura,
                implementación y puesta en marcha.
              </p>
            </div>
            <div className="md:col-span-4 md:text-right">
              <Link
                href="/contacto"
                className="inline-flex w-full justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 hover:opacity-90 md:w-auto"
              >
                Agendar reunión 
              </Link>
              <p className="mt-3 text-xs text-white/60">
                Banca nacional • Proyectos enterprise • Partners internacionales
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
