import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PARTNERS } from "../../../data/partners";

export default function PartnerDetail({ params }: { params: { slug: string } }) {
  const p = PARTNERS.find((x) => x.slug === params.slug);
  if (!p) return notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <Link href="/partners" className="text-sm font-semibold text-slate-600 hover:text-slate-900">
        ← Volver a partners
      </Link>

      <div className="mt-8 rounded-3xl border bg-white p-8">
        <div className="flex items-start gap-5">
          <div className="h-16 w-16 rounded-2xl border bg-slate-950/5 p-3">
            <div className="relative h-full w-full">
              <Image src={p.logo} alt={p.name} fill sizes="64px" className="object-contain" />
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Partner tecnológico
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight">{p.name}</h1>
            <p className="mt-2 text-slate-600">{p.tagline}</p>
          </div>
        </div>

        <div className="mt-8 grid gap-8 md:grid-cols-12">
          <div className="md:col-span-8">
            <h2 className="text-xl font-semibold">{p.heroTitle}</h2>
            <p className="mt-3 text-slate-700">{p.short}</p>

            <h3 className="mt-8 text-sm font-semibold uppercase tracking-widest text-slate-500">
              Capacidades
            </h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-700">
              {p.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>

            <div className="mt-6 flex flex-wrap gap-2">
              {p.tags.map((t) => (
                <span key={t} className="rounded-full border px-3 py-1 text-xs text-slate-600">
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="md:col-span-4">
            <div className="rounded-2xl border bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                Acciones
              </p>

              <Link
                href="/contacto"
                className="mt-3 inline-flex w-full justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:opacity-95"
              >
                Solicitar consultoría
              </Link>

              {p.website && (
                <a
                  href={p.website}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex w-full justify-center rounded-xl border bg-white px-4 py-3 text-sm font-semibold hover:bg-slate-100"
                >
                  Sitio oficial
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
