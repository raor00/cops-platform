import Link from "next/link";

type PartnerLogo = {
  src: string;
  alt: string;
};

export default function HomePartnersMarquee({ logos }: { logos: PartnerLogo[] }) {
  const items = [...logos, ...logos]; // duplicamos para loop infinito

  return (
    <section className="mt-5">
      <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-600 dark:text-white/60">
  Partners tecnológicos
</p>


      <div className="relative left-1/2 right-1/2 w-screen -ml-[50vw] -mr-[50vw]">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/35 px-6 py-4 backdrop-blur">
          {/* fades laterales */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-black/70 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-black/70 to-transparent" />

          <div className="logo-marquee__track gap-10">
            <div className="logo-marquee__group gap-10">
              {items.map((l, idx) => (
                <Link
                  key={`g1-${idx}`}
                  href="/partners"
                  className="logo-pill cursor-pointer"
                  aria-label={`Ver partners (logo: ${l.alt})`}
                  title="Ver partners"
                >
                  <img src={l.src} alt={l.alt} className="logo-img" />
                </Link>
              ))}
            </div>

            <div className="logo-marquee__group gap-10" aria-hidden="true">
              {items.map((l, idx) => (
                <Link
                  key={`g2-${idx}`}
                  href="/partners"
                  className="logo-pill cursor-pointer"
                  aria-label={`Ver partners (logo: ${l.alt})`}
                  title="Ver partners"
                >
                  <img src={l.src} alt={l.alt} className="logo-img" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-slate-600 dark:text-white/60">
  Enfoque enterprise: levantamiento • arquitectura • implementación • puesta en marcha • soporte
</p>
    </section>
  );
}
