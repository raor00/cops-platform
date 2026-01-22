export default function ClientLogosMarquee() {
  const logos = [
    { src: "/clientes/bancamiga.png", alt: "Bancamiga" },
    { src: "/clientes/bancaribe.png", alt: "Bancaribe" },
    { src: "/clientes/fvf.png", alt: "FVF" },
    { src: "/clientes/bigott.png", alt: "Cigarrera Bigott" },
    { src: "/clientes/plaza.png", alt: "Plaza" },
    { src: "/clientes/bfc.png", alt: "BFC" },
  ];

  // duplicamos para loop suave
  const items = [...logos, ...logos];

  return (
    <div className="mt-6">
      <p className="text-xs font-semibold tracking-[0.2em] text-white/60">
        HAN CONFIADO EN COP’S
      </p>

      <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        <div className="flex w-max animate-marquee gap-6 px-6 py-4">
          {items.map((l, i) => (
            <div
              key={`${l.src}-${i}`}
              className="flex h-12 w-32 items-center justify-center rounded-xl bg-white/5 px-4"
            >
              <img
                src={l.src}
                alt={l.alt}
                className="h-7 w-auto object-contain opacity-90 grayscale transition hover:opacity-100 hover:grayscale-0"
              />
            </div>
          ))}
        </div>
      </div>

      <p className="mt-3 text-xs text-white/50">
        *Algunas marcas pueden corresponder a empresas históricas o reestructuradas con el tiempo.
      </p>
    </div>
  );
}
