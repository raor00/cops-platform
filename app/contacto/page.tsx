"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const FORMSPREE_ENDPOINT = "https://formspree.io/f/mvzzrkjd";

export default function Contacto() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [open, setOpen] = useState(false);


  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);

      // Subject (opcional)
      formData.append("_subject", "Nuevo contacto - COP’S Electronics");

      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const msg =
          data?.errors?.[0]?.message ||
          "No se pudo enviar la solicitud. Intenta de nuevo.";
        throw new Error(msg);
      }

      form.reset();
      router.push("/gracias");
    } catch (err: any) {
      setErrorMsg(err?.message || "Ocurrió un error al enviar el formulario.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Contacto</h1>
      <p className="mt-3 text-slate-700">
        Déjanos tu requerimiento y coordinamos una reunión técnica.
      </p>

      <form
        onSubmit={handleSubmit}
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

        {errorMsg && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMsg}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Enviando..." : "Enviar solicitud"}
        </button>

        <p className="text-xs text-slate-500">
          Al enviar este formulario aceptas ser contactado por nuestro equipo.
        </p>
      </form>
    </section>
  );
}
