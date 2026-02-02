import Link from "next/link";
export default function Gracias() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-20 text-center">
      <div className="reveal">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-brand-600">
          <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        </div>
        <h1 className="mt-6 text-3xl font-bold text-brand-950">¡Gracias!</h1>
        <p className="mt-3 text-slate-600">Recibimos tu solicitud. Nuestro equipo se pondrá en contacto contigo pronto.</p>
        <Link href="/" className="mt-8 inline-flex rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-brand-600/20 transition hover:bg-brand-500">Volver al inicio</Link>
      </div>
    </main>
  );
}
