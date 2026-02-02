import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PARTNERS } from "../../../data/partners";

export function generateStaticParams() { return PARTNERS.map((p) => ({ slug: p.id })); }

export default async function PartnerDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = PARTNERS.find((x) => x.id === slug);
  if (!p) return notFound();

  return (
    <main className="dark-section noise relative text-white">
      <section className="relative mx-auto max-w-6xl px-4 py-16">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
            <Image src={p.logo} alt={p.name} width={80} height={80} className="h-9 w-auto object-contain" priority />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold tracking-[0.25em] text-brand-300">PARTNER TECNOLÓGICO</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{p.subtitle}</h1>
            <p className="mt-3 max-w-3xl text-white/65">{p.description}</p>
            <div className="mt-5 flex flex-wrap gap-2">{(p.tags ?? []).map((t) => <span key={t} className="rounded-full border border-white/12 bg-white/5 px-3 py-1 text-xs font-semibold text-white/70">{t}</span>)}</div>
          </div>
          <div className="ml-auto hidden sm:block"><Link href="/partners" className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10">Volver</Link></div>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-12">
          <div className="md:col-span-8">
            <div className="glass-card p-6">
              <p className="text-[10px] font-bold tracking-[0.25em] text-brand-300">CAPACIDADES</p>
              <div className="mt-4 grid gap-6 md:grid-cols-2">
                <div><p className="text-sm font-semibold text-white">Enfoque</p><p className="mt-2 text-white/65">{p.focus ?? "Integración y operación enterprise"}</p></div>
                <div><p className="text-sm font-semibold text-white">Casos de uso</p><ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-white/65">{(p.usecases ?? ["Operación multi-sede", "Integración", "Continuidad"]).map((x) => <li key={x}>{x}</li>)}</ul></div>
              </div>
              <div className="mt-6"><p className="text-sm font-semibold text-white">Lo que habilita</p><ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-white/65">{(p.capabilities ?? []).map((x) => <li key={x}>{x}</li>)}</ul></div>
            </div>
            <div className="mt-4 sm:hidden"><Link href="/partners" className="inline-flex w-full justify-center rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10">Volver</Link></div>
          </div>
          <aside className="md:col-span-4">
            <div className="glass-card p-6">
              <p className="text-[10px] font-bold tracking-[0.25em] text-brand-300">ENLACES</p>
              {p.website ? <a href={p.website} target="_blank" rel="noreferrer" className="mt-4 inline-flex w-full justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-brand-950 transition hover:opacity-90">Sitio oficial</a> : <p className="mt-4 text-sm text-white/50">Sitio oficial no disponible.</p>}
              <p className="mt-4 text-xs text-white/40">Información resumida para uso corporativo.</p>
            </div>
          </aside>
        </div>
        <p className="mt-10 text-xs text-white/30">COP&apos;S Electronics, S.A. • Partners internacionales • Operación enterprise</p>
      </section>
    </main>
  );
}
