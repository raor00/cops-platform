// app/page.tsx
import HomeHero from "../components/home/HomeHero";
import HomeTrajectory from "../components/home/HomeTrajectory";
import HomeClients from "../components/home/HomeClients";
import HomePartnersMarquee from "../components/home/HomePartnersMarquee";
import HomeSolutions from "../components/home/HomeSolutions";
import HomeSectors from "../components/home/HomeSectors";
import HomeProcess from "../components/home/HomeProcess";
import HomeDifferentiators from "../components/home/HomeDifferentiators";
import HomeCases from "../components/home/HomeCases";
import HomeCTA from "../components/home/HomeCta";

const CLIENTES = [
  { src: "/clientes/bancamiga.png", alt: "Bancamiga" },
  { src: "/clientes/bancaribe.png", alt: "Bancaribe" },
  { src: "/clientes/fvf.png",       alt: "FVF" },
  { src: "/clientes/bigott.png",    alt: "Cigarrera Bigott" },
  { src: "/clientes/plaza.png",     alt: "Plaza" },
  { src: "/clientes/bfc.png",       alt: "BFC" },
];

const PARTNER_LOGOS = [
  { src: "/partners/milestone.png",      alt: "Milestone" },
  { src: "/partners/winsted.png",        alt: "Winsted" },
  { src: "/partners/invenzi.png",        alt: "Invenzi" },
  { src: "/partners/altronix.png",       alt: "Altronix" },
  { src: "/partners/automated-logic.png", alt: "Automated Logic" },
  { src: "/partners/velasea.png",        alt: "Velasea" },
  { src: "/partners/magos.png",          alt: "Magos" },
  { src: "/partners/digital.png",        alt: "Digital Watchdog" },
];

export default function Home() {
  return (
    <div>
      <HomeHero />
      <HomeTrajectory />
      <HomeClients
        title="HAN CONFIADO EN COP'S"
        subtitle="Organizaciones que han trabajado con COP'S Electronics a lo largo de 28 años de trayectoria."
        logos={CLIENTES}
        featuredCount={12}
      />
      <HomePartnersMarquee logos={PARTNER_LOGOS} />
      <HomeSolutions />
      <HomeSectors />
      <HomeProcess />
      <HomeDifferentiators />
      <HomeCases />
      <HomeCTA />
    </div>
  );
}
