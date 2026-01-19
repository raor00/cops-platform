export default function Partners() {
  const partners = ["Hikvision", "Milestone", "Invenzi", "Ablerex", "Automated Logic"];

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Partners</h1>
      <p className="mt-3 text-slate-700">
        Trabajamos con un ecosistema de partners para construir soluciones robustas,
        compatibles y sostenibles en el tiempo.
      </p>

      <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-5">
        {partners.map((p) => (
          <div key={p} className="rounded-2xl border bg-white p-5 text-center font-medium">
            {p}
          </div>
        ))}
      </div>
    </section>
  );
}
