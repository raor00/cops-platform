// components/home/HomeSectors.tsx
export default function HomeSectors() {
  return (
    <section className="border-y bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-3xl font-semibold tracking-tight">Sectores</h2>
        <p className="mt-2 text-slate-700">
          Experiencia en entornos donde la disponibilidad, auditoría y continuidad operativa son prioridad.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-4">
          {[
            { t: "Bancario", d: "Operación crítica, control por roles, trazabilidad y estándares." },
            { t: "Industrial", d: "Seguridad, monitoreo, automatización y continuidad en planta." },
            { t: "Comercial", d: "Protección integral, control de accesos, operación multi-sede." },
            { t: "Gubernamental", d: "Implementaciones con enfoque en cumplimiento y operación robusta." },
          ].map((x) => (
            <div key={x.t} className="rounded-2xl border bg-white p-6">
              <h3 className="font-semibold">{x.t}</h3>
              <p className="mt-2 text-sm text-slate-700">{x.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
