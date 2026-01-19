export default function Contacto() {
  return (
    <section className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Contacto</h1>
      <p className="mt-3 text-slate-700">
        Déjanos tu requerimiento y coordinamos una reunión técnica.
      </p>

      <form
        action="https://formspree.io/f/mvzzrkjd"
        method="POST"
        className="mt-10 space-y-4 rounded-2xl border p-6"
      >
        <div>
          <label className="text-sm font-medium">Nombre</label>
          <input
            name="nombre"
            required
            className="mt-2 w-full rounded-xl border px-4 py-3"
            placeholder="Tu nombre"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Empresa</label>
          <input
            name="empresa"
            className="mt-2 w-full rounded-xl border px-4 py-3"
            placeholder="Empresa / Institución"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Correo</label>
          <input
            type="email"
            name="email"
            required
            className="mt-2 w-full rounded-xl border px-4 py-3"
            placeholder="correo@empresa.com"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Requerimiento</label>
          <textarea
            name="mensaje"
            required
            className="mt-2 w-full rounded-xl border px-4 py-3"
            rows={5}
            placeholder="Cuéntanos qué necesitas (alcance, sedes, prioridades, etc.)"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:opacity-90"
        >
          Enviar solicitud
        </button>

        <p className="text-xs text-slate-500">
          Al enviar este formulario aceptas ser contactado por nuestro equipo.
        </p>
      </form>
    </section>
  );
}
