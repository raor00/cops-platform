export default function SoportePage() {
  return (
    <section className="relative overflow-hidden lg-card p-6 md:p-8">
      <div className="pointer-events-none absolute -top-16 right-0 h-52 w-52 rounded-full bg-cyan-500/20 blur-[80px]" />

      <span className="tag-glass">Modulo</span>
      <h1 className="mt-4 text-3xl font-semibold text-white">Soporte</h1>
      <p className="mt-3 max-w-2xl text-white/60">
        Aqui se integrara el flujo de soporte, tickets y seguimiento de casos.
      </p>
    </section>
  );
}
