import Link from "next/link";
export default function Gracias() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-20 text-center">
      <div className="reveal">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-brand-400/20 bg-brand-500/15 text-brand-300">
          <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        </div>
        <h1 className="mt-6 text-3xl font-bold text-white">¡Gracias!</h1>
        <p className="mt-3 text-white/55">Recibimos tu solicitud. Nuestro equipo se pondrá en contacto contigo pronto.</p>
        <Link href="/" className="btn-glass-primary mt-8 inline-flex">Volver al inicio</Link>
      </div>
    </main>
  );
}
