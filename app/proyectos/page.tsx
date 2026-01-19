export default function Proyectos() {
  const cases = [
    {
      title: "Videovigilancia enterprise multi-sede",
      bullets: [
        "Arquitectura escalable y estandarizada.",
        "Control de permisos por roles y auditoría.",
        "Operación continua y optimización post-implementación.",
      ],
    },
    {
      title: "Control de acceso centralizado",
      bullets: [
        "Gestión de identidades, visitantes y reglas.",
        "Trazabilidad y reportes para cumplimiento.",
        "Integración con infraestructura existente.",
      ],
    },
    {
      title: "Automatización y monitoreo de infraestructura",
      bullets: [
        "Monitoreo, alarmas y control operativo.",
        "Optimización energética y continuidad.",
        "Documentación técnica y puesta en marcha formal.",
      ],
    },
  ];

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Proyectos</h1>
      <p className="mt-3 text-slate-700">
        Presentamos capacidades en formato “caso tipo” para proteger información sensible.
      </p>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {cases.map((c) => (
          <div key={c.title} className="rounded-2xl border p-6">
            <h3 className="font-semibold">{c.title}</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
              {c.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
