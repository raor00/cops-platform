// components/home/HomeProcess.tsx
export default function HomeProcess() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <h2 className="text-3xl font-semibold tracking-tight">Cómo trabajamos</h2>
      <p className="mt-2 text-slate-700">
        Metodología clara, documentación y control de calidad para proyectos enterprise.
      </p>

      <div className="mt-10 grid gap-4 md:grid-cols-5">
        {[
          { n: "01", t: "Levantamiento", d: "Diagnóstico, requerimientos, riesgos y alcance." },
          { n: "02", t: "Arquitectura", d: "Diseño técnico, capacidades y escalabilidad." },
          { n: "03", t: "Implementación", d: "Instalación, integración y configuración." },
          { n: "04", t: "Puesta en marcha", d: "Pruebas, QA, actas y capacitación." },
          { n: "05", t: "Soporte", d: "Mantenimiento, mejoras y continuidad operativa." },
        ].map((x) => (
          <div key={x.n} className="rounded-2xl border p-6">
            <p className="text-xs font-semibold text-slate-500">{x.n}</p>
            <h3 className="mt-2 font-semibold">{x.t}</h3>
            <p className="mt-2 text-sm text-slate-700">{x.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
