export default function Nosotros() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Nosotros</h1>
      <p className="mt-3 text-slate-700">
        COP’S Electronics es una empresa de soluciones tecnológicas enfocada en automatización
        de procesos y seguridad electrónica, con enfoque en proyectos de alta exigencia.
      </p>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border p-6">
          <h3 className="font-semibold">Enfoque</h3>
          <p className="mt-2 text-sm text-slate-700">
            Arquitectura, integración, implementación y soporte para operación continua.
          </p>
        </div>
        <div className="rounded-2xl border p-6">
          <h3 className="font-semibold">Metodología</h3>
          <p className="mt-2 text-sm text-slate-700">
            Levantamiento → Diseño → Implementación → Puesta en marcha → Soporte.
          </p>
        </div>
        <div className="rounded-2xl border p-6">
          <h3 className="font-semibold">Experiencia</h3>
          <p className="mt-2 text-sm text-slate-700">
            Proyectos enterprise incluyendo banca nacional y organizaciones multi-sede.
          </p>
        </div>
      </div>
    </section>
  );
}
