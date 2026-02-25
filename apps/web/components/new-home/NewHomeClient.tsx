"use client";

import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  ArrowRight,
  Building2,
  Factory,
  Landmark,
  LucideIcon,
  MonitorSmartphone,
  Search,
  Settings,
  Share2,
  ShieldCheck,
  Store,
  Video,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import NewHomeHeader from "./NewHomeHeader";
import ParticleNetwork from "./ParticleNetwork";

function Hero() {
  return (
    <section
      id="homepage"
      className="relative flex min-h-[90vh] items-center overflow-hidden bg-transparent pb-32 pt-32 lg:pb-40 lg:pt-48"
    >
      <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-r from-[#070f1e]/70 via-[#070f1e]/10 to-[#070f1e]/70" />
      <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-t from-[#070f1e]/80 via-transparent to-transparent" />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-8">
        <div className="flex max-w-5xl flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-[#0f1b2e]/40 px-5 py-2 shadow-[0_0_20px_rgba(0,163,196,0.1)] backdrop-blur-sm"
          >
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Cops Electronics</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 25, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1.2, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="mb-8 text-4xl font-black leading-[1.05] tracking-[-0.03em] md:text-5xl lg:text-7xl xl:text-[5rem]"
          >
            <span className="bg-gradient-to-br from-white via-slate-200 to-slate-400 bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(0,163,196,0.15)]">
              ARQUITECTURA E INTEGRACION
            </span>
            <br className="hidden md:block" />
            <span className="bg-gradient-to-br from-slate-300 via-slate-400 to-slate-600 bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(0,163,196,0.15)]">
              PARA OPERACION CRITICA
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="mb-8 max-w-2xl text-base font-light leading-relaxed tracking-wide text-slate-400 md:text-lg"
          >
            Disenamos y ejecutamos plataformas resilientes de Videovigilancia,
            Control de Acceso y Energia para corporaciones donde cada evento
            debe ser auditable y la continuidad es innegociable.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.1, ease: [0.16, 1, 0.3, 1] }}
            className="relative mt-4 group"
          >
            <div className="pointer-events-none absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-light text-slate-500/50">+</div>
            <div className="pointer-events-none absolute -bottom-3 left-1/2 -translate-x-1/2 text-xs font-light text-slate-500/50">+</div>
            <div className="pointer-events-none absolute -left-4 top-1/2 -translate-y-1/2 text-xs font-light text-slate-500/50">+</div>
            <div className="pointer-events-none absolute -right-4 top-1/2 -translate-y-1/2 text-xs font-light text-slate-500/50">+</div>

            <Link
              href="/contacto"
              className="relative inline-block overflow-hidden rounded-[2.5rem] border border-slate-700/50 bg-[#0a1428]/90 px-12 py-5 text-sm font-bold uppercase tracking-[0.2em] text-white shadow-[0_4px_20px_rgba(0,0,0,0.5)] transition-all duration-500 hover:border-cyan-500 hover:bg-[#0f1b2e] hover:shadow-[0_8px_30px_rgba(0,163,196,0.3)]"
            >
              <span className="relative z-10">Saber mas</span>
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-cyan-600/0 via-cyan-500/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function StorySection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 64,
    damping: 30,
    mass: 0.9,
  });

  const statsOpacity = useTransform(smoothProgress, [0, 0.15], [1, 0]);
  const statsY = useTransform(smoothProgress, [0, 0.15], [0, -50]);
  const numberScale = useTransform(smoothProgress, [0, 0.35, 0.7], [1, 2.0, 2.0]);
  const numberY = useTransform(smoothProgress, [0, 0.35, 0.6, 1], ["0vh", "15vh", "15vh", "-40vh"]);
  const numberX = useTransform(smoothProgress, [0, 0.35, 0.7], ["0%", "15%", "15%"]);
  const numberGlow = useTransform(smoothProgress, [0.3, 0.5], ["0px 0px 0px rgba(34,211,238,0)", "0px 0px 40px rgba(34,211,238,0.8)"]);

  const bentoOpacity = useTransform(smoothProgress, [0.3, 0.45, 0.9, 1], [0, 1, 1, 1]);
  const bentoY = useTransform(smoothProgress, [0.35, 0.55, 1], ["30vh", "0vh", "-100vh"]);

  return (
    <section ref={containerRef} className="relative z-30 -mt-16 h-[280vh] w-full bg-transparent md:-mt-24">
      <div className="sticky top-0 flex h-[100dvh] w-full max-w-5xl mx-auto flex-col items-center justify-start overflow-visible px-4 sm:px-6 lg:px-8">
        <motion.div
          style={{ opacity: statsOpacity, y: statsY }}
          className="absolute left-0 right-0 top-[15vh] z-40 w-full origin-top px-4 md:top-[18vh]"
        >
          <div className="relative mx-auto max-w-4xl overflow-hidden rounded-2xl border border-white/5 bg-[#0b1426]/60 px-4 py-4 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.8)] backdrop-blur-xl md:px-8 md:py-6">
            <div className="absolute left-0 top-0 h-[1px] w-full bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
            <div className="relative z-10 grid w-full grid-cols-4 divide-x divide-white/5 gap-0">
              {/* Primer slot es invisible, servirá para que el 28+ flotante tome su lugar exacto abajo */}
              <div className="invisible pointer-events-none flex w-full flex-col items-center justify-center px-1 text-center md:px-4">
                <div className="mb-2 text-3xl font-black tracking-tight md:text-5xl">28+</div>
                <div className="text-[7px] font-bold uppercase tracking-widest leading-relaxed md:text-[10px]">AÑOS DE<br className="md:hidden" />TRAYECTORIA</div>
              </div>

              <div className="flex w-full flex-col items-center justify-center px-1 text-center md:px-4">
                <div className="mb-2 text-2xl font-black tracking-tight text-white md:text-4xl">1500+</div>
                <div className="text-[7px] font-bold uppercase tracking-widest leading-relaxed text-slate-400 md:text-[10px]">Proyectos<br />ejecutados</div>
              </div>

              <div className="flex w-full flex-col items-center justify-center px-1 text-center md:px-4">
                <div className="mb-2 text-2xl font-black tracking-tight text-white md:text-4xl">+12</div>
                <div className="text-[7px] font-bold uppercase tracking-widest leading-relaxed text-slate-400 md:text-[10px]">Inst.<br />financieras</div>
              </div>

              <div className="flex w-full flex-col items-center justify-center px-1 text-center md:px-4">
                <div className="mb-2 text-xl font-black tracking-tight text-cyan-400 md:text-4xl">M-Sede</div>
                <div className="text-[7px] font-bold uppercase tracking-widest leading-relaxed text-slate-400 md:text-[10px]">Operacion<br />Nacional</div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="absolute left-0 right-0 top-[15vh] z-50 w-full px-4 md:top-[18vh] pointer-events-none">
          <div className="relative mx-auto h-full max-w-4xl px-4 py-4 md:px-8 md:py-6">
            <div className="relative w-full">
              {/* Usa el grid identico al de stats para emular el cajon de 28+ */}
              <div className="grid w-full grid-cols-4 gap-0">
                <motion.div
                  style={{ x: numberX, y: numberY, scale: numberScale, originX: 0.5, originY: 0.5 }}
                  className="flex w-full origin-center flex-col items-center justify-center px-1 text-center pointer-events-auto md:px-4"
                >
                  <motion.div
                    style={{ textShadow: numberGlow }}
                    className="mb-2 leading-none text-3xl font-black tracking-tighter text-white drop-shadow-2xl md:text-5xl"
                  >
                    28+
                  </motion.div>
                  <div className="text-[7px] font-bold uppercase tracking-widest leading-relaxed text-cyan-400 drop-shadow-md md:text-[10px]">
                    AÑOS DE<br className="md:hidden" />TRAYECTORIA
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        <motion.div
          style={{ opacity: bentoOpacity, y: bentoY }}
          className="absolute top-[15vh] flex h-full w-full flex-col justify-start px-4 pointer-events-none md:top-[18vh]"
        >
          <div className="relative z-10 mt-[15vh] grid grid-cols-1 gap-6 pointer-events-auto md:mt-[18vh] md:grid-cols-3 mb-12 md:mb-24">
            <div className="mb-6 flex w-full flex-col items-start md:col-span-3 md:flex-row md:items-end">
              <div className="hidden w-[45%] flex-shrink-0 md:block" />
              <div className="mt-24 w-full border-t border-white/10 px-2 pt-8 text-center md:-mt-8 md:w-[55%] lg:-mt-20 md:border-l md:border-t-0 md:pl-10 md:pt-0">
                <h2 className="text-3xl font-black leading-tight tracking-tight text-white md:text-5xl">
                  Respaldando operacion critica en Venezuela
                </h2>
                <p className="mx-auto mt-6 max-w-[20rem] text-left text-sm font-medium leading-relaxed tracking-wide text-slate-200 opacity-100 sm:max-w-lg md:mx-0 md:max-w-none md:text-justify md:text-base lg:text-lg">
                  Somos una empresa privada con trayectoria ininterrumpida dedicada a la asesoria e implementacion de proyectos tecnologicos de alta gama en automatizacion, seguridad y energia, con enfoque enterprise para banca, industria, comercio e instituciones gubernamentales.
                </p>
              </div>
            </div>

            {(
              [
                {
                  Icon: ShieldCheck,
                  title: "Integracion multi-marca",
                  desc: "Arquitecturas abiertas sin depender de un solo fabricante, enlazando VMS, control de acceso y BMS bajo un mismo nucleo de comando.",
                },
                {
                  Icon: Building2,
                  title: "Escalabilidad enterprise",
                  desc: "Disenos listos para operacion multi-sede. Estandarizacion de modelos piloto orientados a despliegues a nivel nacional.",
                },
                {
                  Icon: Settings,
                  title: "Soporte y continuidad",
                  desc: "Planificacion, documentacion exhaustiva (QA) y acompanamiento post-implementacion para asegurar la estabilidad operativa.",
                },
              ] as { Icon: LucideIcon; title: string; desc: string }[]
            ).map(({ Icon, title, desc }) => (
              <div key={title} className="flex flex-col items-start rounded-[2rem] border border-white/10 bg-[#0b1426]/90 p-8 shadow-[0_20px_40px_-5px_rgba(0,0,0,0.8)] transition-colors hover:border-cyan-500/50">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-cyan-950/80">
                  <Icon className="h-7 w-7 text-cyan-400" />
                </div>
                <h3 className="mb-3 text-lg font-black tracking-wide text-white md:text-xl">{title}</h3>
                <p className="text-sm font-medium leading-relaxed text-slate-300">{desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

type LogoItem = {
  src: string;
  alt: string;
  widthClass?: string;
};

const CLIENT_LOGOS: LogoItem[] = [
  { src: "/clientes/bancamiga.png", alt: "Bancamiga", widthClass: "max-w-[180px] md:max-w-[240px]" },
  { src: "/clientes/bancaribe.png", alt: "Bancaribe", widthClass: "max-w-[180px] md:max-w-[230px]" },
  { src: "/clientes/fvf.png", alt: "FVF", widthClass: "h-9 md:h-11 max-w-[80px] md:max-w-[110px]" },
  { src: "/clientes/bigott.png", alt: "Cigarrera Bigott", widthClass: "max-w-[150px] md:max-w-[190px]" },
  { src: "/clientes/plaza.png", alt: "Banco Plaza", widthClass: "max-w-[190px] md:max-w-[260px]" },
  { src: "/clientes/bfc.png", alt: "BFC", widthClass: "max-w-[140px] md:max-w-[180px]" },
];

const TECH_PARTNER_LOGOS: LogoItem[] = [
  { src: "/partners/ablerex.png", alt: "Ablerex" },
  { src: "/partners/altronix.png", alt: "Altronix", widthClass: "h-9 md:h-11 max-w-[140px] md:max-w-[190px]" },
  { src: "/partners/automated-logic.png", alt: "Automated Logic" },
  { src: "/partners/digital.png", alt: "Digital Watchdog", widthClass: "h-9 md:h-11 max-w-[160px] md:max-w-[220px]" },
  { src: "/partners/hikvision.png", alt: "Hikvision" },
  { src: "/partners/invenzi.png", alt: "Invenzi", widthClass: "h-9 md:h-11 max-w-[140px] md:max-w-[170px]" },
  { src: "/partners/magos.png", alt: "Magos", widthClass: "h-9 md:h-11 max-w-[170px] md:max-w-[230px]" },
  { src: "/partners/milestone.png", alt: "Milestone", widthClass: "h-9 md:h-11 max-w-[160px] md:max-w-[210px]" },
  { src: "/partners/velasea.png", alt: "Velasea", widthClass: "h-9 md:h-11 max-w-[130px] md:max-w-[160px]" },
  { src: "/partners/winsted.png", alt: "Winsted", widthClass: "h-9 md:h-11 max-w-[130px] md:max-w-[170px]" },
];

const MARQUEE_CLIENT_LOGOS = [...CLIENT_LOGOS, ...CLIENT_LOGOS];
const MARQUEE_PARTNER_LOGOS = [...TECH_PARTNER_LOGOS, ...TECH_PARTNER_LOGOS];

function MarqueeLogo({ logo }: { logo: LogoItem }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span className="rounded-full border border-slate-300 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 md:text-sm">
        {logo.alt}
      </span>
    );
  }

  return (
    <img
      src={logo.src}
      alt={logo.alt}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={`h-10 w-auto max-w-[170px] object-contain drop-shadow-[0_1px_0_rgba(15,23,42,0.08)] md:h-12 md:max-w-[220px] ${logo.widthClass ?? ""}`}
    />
  );
}

function Partners() {
  return (
    <section id="partners" className="relative z-40 mt-[-5vh] overflow-hidden bg-white pb-24 pt-20 border-b border-slate-200">

      {/* Aesthetic wave connection to the dark node background */}
      <div className="pointer-events-none absolute bottom-full left-0 w-full overflow-hidden leading-none block">
        <svg
          className="relative block w-full h-[60px] md:h-[120px]"
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V0C69.83,21,154.21,41.97,221.46,47.4,255.43,50.14,289.44,52.26,321.39,56.44Z"
            fill="#ffffff"
          ></path>
        </svg>
      </div>

      <div className="pointer-events-none absolute left-0 top-0 h-32 w-full bg-gradient-to-b from-slate-100 to-transparent opacity-60" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h3 className="inline-block border-b-2 border-cyan-400 pb-2 text-sm font-bold uppercase tracking-[0.2em] text-slate-900 md:text-base">
            Han confiado en COP&apos;S
          </h3>
        </div>

        <div className="relative mb-24 flex w-full cursor-default overflow-hidden">
          <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-48 bg-gradient-to-r from-white via-white/80 to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-48 bg-gradient-to-l from-white via-white/80 to-transparent" />

          <motion.div
            className="flex w-max shrink-0 items-center gap-10 px-6 md:gap-20 md:px-8"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ repeat: Infinity, ease: "linear", duration: 30 }}
          >
            {MARQUEE_CLIENT_LOGOS.map((logo, idx) => (
              <div
                key={`${logo.src}-${idx}`}
                className="flex h-16 min-w-[140px] cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-slate-100/80 px-3 opacity-100 transition-all hover:border-cyan-300 hover:bg-white md:min-w-[180px]"
              >
                <MarqueeLogo logo={logo} />
              </div>
            ))}
          </motion.div>
        </div>

        <div className="mb-12 text-center">
          <h3 className="inline-block border-b-2 border-cyan-400 pb-2 text-sm font-bold uppercase tracking-[0.2em] text-slate-900 md:text-base">
            Partners tecnologicos
          </h3>
        </div>

        <div className="relative flex w-full cursor-default overflow-hidden pb-8">
          <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-48 bg-gradient-to-r from-white via-white/50 to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-48 bg-gradient-to-l from-white via-white/50 to-transparent" />

          <motion.div
            className="flex w-max shrink-0 items-center gap-10 px-6 md:gap-20 md:px-8"
            animate={{ x: ["-50%", "0%"] }}
            transition={{ repeat: Infinity, ease: "linear", duration: 35 }}
          >
            {MARQUEE_PARTNER_LOGOS.map((logo, idx) => (
              <div
                key={`${logo.src}-${idx}`}
                className="flex h-16 min-w-[150px] cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-slate-100/80 px-3 opacity-100 transition-all hover:border-cyan-300 hover:bg-white md:min-w-[190px]"
              >
                <MarqueeLogo logo={logo} />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

type SolutionItem = {
  id: string;
  title: string;
  summary: string;
  stats: string[];
  graphicType: "security" | "video" | "automation";
  accentClass: string;
};

const SOLUTIONS: SolutionItem[] = [
  {
    id: "seguridad-electronica",
    title: "Seguridad electronica enterprise",
    summary:
      "Arquitectura integral de CCTV, control de acceso, alarmas y analitica para operacion continua y trazabilidad de eventos.",
    stats: ["SLA 24/7", "Integracion multi-sede", "Auditoria centralizada"],
    graphicType: "security",
    accentClass: "from-cyan-400 to-blue-500",
  },
  {
    id: "gestion-de-video-vms",
    title: "Gestion de video (VMS)",
    summary:
      "Monitoreo inteligente con reglas, busqueda forense y orquestacion de incidentes para centros de control de alta demanda.",
    stats: ["Busqueda acelerada", "Alertas por eventos", "Roles y permisos"],
    graphicType: "video",
    accentClass: "from-fuchsia-400 to-cyan-400",
  },
  {
    id: "automatizacion-y-bms",
    title: "Automatizacion y BMS",
    summary:
      "Control unificado de infraestructura critica: energia, climatizacion y subsistemas con tableros operativos en tiempo real.",
    stats: ["Telemetria en vivo", "Optimización energetica", "Operacion predictiva"],
    graphicType: "automation",
    accentClass: "from-emerald-400 to-cyan-400",
  },
];

function SolutionGraphic({ type }: { type: SolutionItem["graphicType"] }) {
  if (type === "security") {
    return (
      <div className="relative h-24 w-full overflow-hidden rounded-xl border border-cyan-500/20 bg-[#0d1a31]/70">
        <div className="absolute bottom-4 left-0 right-0 h-px bg-cyan-400/35" />
        <motion.div
          className="absolute right-20 top-3 h-[70%] w-px"
          animate={{
            backgroundColor: [
              "rgba(71,85,105,0.65)",
              "rgba(71,85,105,0.65)",
              "rgba(248,113,113,0.95)",
              "rgba(248,113,113,0.95)",
              "rgba(71,85,105,0.65)",
            ],
          }}
          transition={{ repeat: Infinity, duration: 6, ease: "linear", times: [0, 0.7, 0.76, 0.85, 1] }}
        />
        <div className="absolute right-[88px] top-3 text-[8px] font-bold uppercase tracking-[0.16em] text-slate-300">
          Sensor
        </div>
        <motion.div
          className="absolute inset-y-0 right-0 w-[28%] bg-gradient-to-l from-rose-500/20 to-transparent"
          animate={{ opacity: [0, 0, 0.9, 0.9, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: "linear", times: [0, 0.7, 0.76, 0.85, 1] }}
        />
        <motion.div
          className="absolute top-[57%] h-7 w-7 -translate-y-1/2"
          animate={{ left: ["4%", "18%", "34%", "50%", "66%", "78%", "86%", "86%", "4%"] }}
          transition={{ repeat: Infinity, duration: 6, ease: "linear", times: [0, 0.13, 0.28, 0.45, 0.62, 0.74, 0.8, 0.9, 1] }}
        >
          <motion.div
            className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-cyan-100"
            animate={{ y: [0, -0.6, 0] }}
            transition={{ repeat: Infinity, duration: 0.55, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute left-1/2 top-2.5 h-3.5 w-[2px] -translate-x-1/2 rounded-full bg-cyan-100"
            animate={{ rotate: [0, 2, 0, -2, 0] }}
            transition={{ repeat: Infinity, duration: 0.55, ease: "linear" }}
          />
          <motion.div
            className="absolute left-1/2 top-4.5 h-[2px] w-3.5 -translate-x-1/2 rounded-full bg-cyan-100"
            animate={{ rotate: [6, -6, 6] }}
            transition={{ repeat: Infinity, duration: 0.55, ease: "linear" }}
          />
          <motion.div
            className="absolute left-[44%] top-5 h-2.5 w-[2px] rounded-full bg-cyan-100"
            animate={{ rotate: [14, -16, 14] }}
            transition={{ repeat: Infinity, duration: 0.55, ease: "linear" }}
          />
          <motion.div
            className="absolute right-[44%] top-5 h-2.5 w-[2px] rounded-full bg-cyan-100"
            animate={{ rotate: [-14, 16, -14] }}
            transition={{ repeat: Infinity, duration: 0.55, ease: "linear" }}
          />
        </motion.div>
        <motion.div
          className="absolute right-2 top-2 rounded-md border px-2 py-1 text-[9px] font-black tracking-[0.2em]"
          animate={{
            borderColor: ["rgba(71,85,105,0.8)", "rgba(71,85,105,0.8)", "rgba(248,113,113,0.9)", "rgba(248,113,113,0.9)", "rgba(71,85,105,0.8)"],
            backgroundColor: ["rgba(30,41,59,0.55)", "rgba(30,41,59,0.55)", "rgba(127,29,29,0.62)", "rgba(127,29,29,0.62)", "rgba(30,41,59,0.55)"],
            color: ["rgb(148,163,184)", "rgb(148,163,184)", "rgb(254,202,202)", "rgb(254,202,202)", "rgb(148,163,184)"],
          }}
          transition={{ repeat: Infinity, duration: 6, ease: "linear", times: [0, 0.7, 0.76, 0.85, 1] }}
        >
          ALERT
        </motion.div>
      </div>
    );
  }

  if (type === "video") {
    return (
      <div className="relative h-24 w-full overflow-hidden rounded-xl border border-fuchsia-500/20 bg-[#0d1a31]/70 p-2.5">
        <div className="grid h-full grid-cols-12 gap-2">
          <div className="col-span-8 grid grid-cols-2 grid-rows-2 gap-1.5">
            {[0, 1, 2, 3].map((idx) => (
              <div key={`cam-${idx}`} className="relative overflow-hidden rounded-md border border-cyan-500/20 bg-[#081326]">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-300/15 to-transparent"
                  animate={{ y: ["-120%", "140%"] }}
                  transition={{ repeat: Infinity, duration: 2.2 + idx * 0.4, ease: "linear" }}
                />
                <div className="absolute left-1 top-1 rounded bg-cyan-400/20 px-1 py-0.5 text-[8px] font-semibold tracking-wider text-cyan-200">
                  CAM {idx + 1}
                </div>
              </div>
            ))}
          </div>

          <div className="col-span-4 flex flex-col gap-1.5 rounded-md border border-fuchsia-400/25 bg-[#111a2f] p-1.5">
            <div className="flex items-center justify-between text-[8px] font-bold uppercase tracking-[0.18em] text-fuchsia-200">
              <span>VMS</span>
              <motion.span
                className="h-1.5 w-1.5 rounded-full bg-emerald-300"
                animate={{ opacity: [0.35, 1, 0.35] }}
                transition={{ repeat: Infinity, duration: 1.1, ease: "easeInOut" }}
              />
            </div>
            {[65, 45, 82].map((v, idx) => (
              <div key={`evt-${idx}`} className="space-y-1">
                <div className="h-1 w-full overflow-hidden rounded-full bg-slate-700/70">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-fuchsia-400 to-cyan-300"
                    initial={{ width: `${v * 0.6}%` }}
                    animate={{ width: [`${v * 0.45}%`, `${v}%`, `${v * 0.6}%`] }}
                    transition={{ repeat: Infinity, duration: 1.6 + idx * 0.25, ease: "easeInOut" }}
                  />
                </div>
              </div>
            ))}
            <motion.div
              className="mt-auto rounded-sm border border-rose-400/40 bg-rose-500/10 px-1 py-0.5 text-[7px] font-bold uppercase tracking-[0.18em] text-rose-200"
              animate={{ opacity: [0.45, 1, 0.45] }}
              transition={{ repeat: Infinity, duration: 1.25, ease: "easeInOut" }}
            >
              control center
            </motion.div>
          </div>
        </div>
        <div className="pointer-events-none absolute inset-0">
          {[14, 36, 58, 80].map((top) => (
            <motion.div
              key={`line-${top}`}
              className="absolute left-0 right-0 h-px bg-cyan-200/10"
              style={{ top: `${top}%` }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-24 w-full overflow-hidden rounded-xl border border-emerald-500/20 bg-[#0d1a31]/70">
      <div className="absolute bottom-0 left-0 right-0 h-[40%] bg-gradient-to-t from-emerald-950/45 to-transparent" />

      <div className="absolute bottom-2 left-2 h-14 w-[28%]">
        <div className="absolute -bottom-3 left-0 text-[7px] font-semibold uppercase tracking-[0.14em] text-emerald-200/70">
          Industry
        </div>
        <svg viewBox="0 0 120 60" className="h-full w-full">
          <path d="M6 52 H114" stroke="#6ee7b7" strokeOpacity="0.55" strokeWidth="1.2" fill="none" />
          <path d="M12 52 V34 L24 28 L34 34 L44 28 L54 34 L64 28 L74 34 V52 Z" stroke="#6ee7b7" strokeOpacity="0.7" strokeWidth="1.2" fill="none" />
          <path d="M78 52 V20 H88 V52" stroke="#6ee7b7" strokeOpacity="0.7" strokeWidth="1.2" fill="none" />
          <path d="M92 52 V24 H100 V52" stroke="#6ee7b7" strokeOpacity="0.7" strokeWidth="1.2" fill="none" />
          <motion.circle
            cx="84"
            cy="18"
            r="2"
            fill="#a7f3d0"
            animate={{ opacity: [0.25, 1, 0.25], y: [0, -2, 0] }}
            transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
          />
        </svg>
      </div>

      <div className="absolute bottom-2 right-2 h-14 w-[25%]">
        <div className="absolute -bottom-3 right-0 text-[7px] font-semibold uppercase tracking-[0.14em] text-cyan-200/70">
          Building
        </div>
        <svg viewBox="0 0 110 60" className="h-full w-full">
          <path d="M4 52 H106" stroke="#67e8f9" strokeOpacity="0.5" strokeWidth="1.2" fill="none" />
          <path d="M18 52 V18 H54 V52 Z" stroke="#67e8f9" strokeOpacity="0.75" strokeWidth="1.2" fill="none" />
          <path d="M58 52 V10 H92 V52 Z" stroke="#67e8f9" strokeOpacity="0.75" strokeWidth="1.2" fill="none" />
          {[24, 32, 40, 66, 74, 82].map((x) => (
            <rect key={`w-${x}`} x={x} y={26} width="4" height="4" fill="#67e8f9" fillOpacity="0.5" />
          ))}
          <motion.circle
            cx="94"
            cy="12"
            r="2"
            fill="#a5f3fc"
            animate={{ opacity: [0.25, 1, 0.25] }}
            transition={{ repeat: Infinity, duration: 1.3, ease: "easeInOut" }}
          />
        </svg>
      </div>

      <div className="absolute left-[39%] top-1/2 h-12 w-[22%] -translate-y-1/2 rounded-md border border-cyan-300/35 bg-[#15263d] p-1.5">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-[68%] rounded-md border border-cyan-300/40 bg-[#10233a] px-2 py-0.5 text-[7px] font-bold uppercase tracking-[0.18em] text-cyan-200">
          ALC
        </div>
        <div className="mt-1 space-y-0.5">
          <div className="flex items-center justify-center gap-1">
            <motion.span
              className="h-1.5 w-1.5 rounded-full bg-emerald-300"
              animate={{ opacity: [0.25, 1, 0.25] }}
              transition={{ repeat: Infinity, duration: 1.1, ease: "easeInOut" }}
            />
            <span className="text-[7px] font-semibold uppercase tracking-[0.14em] text-slate-300">Auto</span>
          </div>
          <div className="flex items-center justify-center gap-1">
            <motion.span
              className="h-1.5 w-1.5 rounded-full bg-cyan-300"
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ repeat: Infinity, duration: 1.3, ease: "easeInOut", delay: 0.2 }}
            />
            <span className="text-[7px] font-semibold uppercase tracking-[0.14em] text-slate-300">HVAC</span>
            <span className="text-[8px] leading-none text-cyan-200">❄</span>
          </div>
          <div className="flex items-center justify-center gap-1">
            <motion.span
              className="h-1.5 w-1.5 rounded-full bg-amber-300"
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ repeat: Infinity, duration: 1.25, ease: "easeInOut", delay: 0.35 }}
            />
            <span className="text-[7px] font-semibold uppercase tracking-[0.14em] text-slate-300">Energy</span>
            <span className="text-[8px] leading-none text-amber-200">⚡</span>
          </div>
        </div>
      </div>

      {/* Left connectors (ALC -> Industry) */}
      <div className="absolute left-[28%] top-[43%] h-px w-[11%] bg-emerald-300/45" />
      <div className="absolute left-[28%] top-[51%] h-px w-[11%] bg-cyan-300/45" />
      <div className="absolute left-[28%] top-[59%] h-px w-[11%] bg-amber-300/45" />

      {/* Right connectors (ALC -> Building) */}
      <div className="absolute left-[61%] top-[43%] h-px w-[11%] bg-emerald-300/45" />
      <div className="absolute left-[61%] top-[51%] h-px w-[11%] bg-cyan-300/45" />
      <div className="absolute left-[61%] top-[59%] h-px w-[11%] bg-amber-300/45" />

      {/* Data pulses */}
      <motion.span
        className="absolute left-[39%] top-[43%] -translate-x-1/2 -translate-y-1/2 text-[8px] leading-none text-emerald-200"
        animate={{ x: ["0%", "-620%"], opacity: [0, 1, 1, 0] }}
        transition={{ repeat: Infinity, duration: 2.1, ease: "linear" }}
      >
        ⟳
      </motion.span>
      <motion.span
        className="absolute left-[39%] top-[51%] -translate-x-1/2 -translate-y-1/2 text-[8px] leading-none text-cyan-200"
        animate={{ x: ["0%", "-620%"], opacity: [0, 1, 1, 0] }}
        transition={{ repeat: Infinity, duration: 2.3, ease: "linear", delay: 0.12 }}
      >
        ❄
      </motion.span>
      <motion.span
        className="absolute left-[39%] top-[59%] -translate-x-1/2 -translate-y-1/2 text-[8px] leading-none text-amber-200"
        animate={{ x: ["0%", "-620%"], opacity: [0, 1, 1, 0] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: "linear", delay: 0.22 }}
      >
        ⚡
      </motion.span>

      <motion.span
        className="absolute left-[61%] top-[43%] -translate-x-1/2 -translate-y-1/2 text-[8px] leading-none text-emerald-200"
        animate={{ x: ["0%", "620%"], opacity: [0, 1, 1, 0] }}
        transition={{ repeat: Infinity, duration: 2.2, ease: "linear", delay: 0.18 }}
      >
        ⟳
      </motion.span>
      <motion.span
        className="absolute left-[61%] top-[51%] -translate-x-1/2 -translate-y-1/2 text-[8px] leading-none text-cyan-200"
        animate={{ x: ["0%", "620%"], opacity: [0, 1, 1, 0] }}
        transition={{ repeat: Infinity, duration: 2.4, ease: "linear", delay: 0.3 }}
      >
        ❄
      </motion.span>
      <motion.span
        className="absolute left-[61%] top-[59%] -translate-x-1/2 -translate-y-1/2 text-[8px] leading-none text-amber-200"
        animate={{ x: ["0%", "620%"], opacity: [0, 1, 1, 0] }}
        transition={{ repeat: Infinity, duration: 2.6, ease: "linear", delay: 0.42 }}
      >
        ⚡
      </motion.span>

      <motion.div
        className="absolute left-2 top-2 rounded-md border border-emerald-300/45 bg-emerald-400/10 px-1.5 py-0.5 text-[7px] font-bold uppercase tracking-[0.16em] text-emerald-200"
        animate={{ opacity: [0.65, 1, 0.65] }}
        transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
      >
        AUTOMATION LOOP
      </motion.div>
    </div>
  );
}

function Solutions() {
  const cardContainerVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.14,
        delayChildren: 0.08,
      },
    },
  };

  const cardItemVariants = {
    hidden: { opacity: 0, y: 36, scale: 0.95, filter: "blur(6px)" },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: { type: "spring", stiffness: 90, damping: 16, mass: 0.9 },
    },
  };

  return (
    <section id="soluciones" className="relative z-10 border-t border-slate-200 bg-slate-50 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-4 text-center text-3xl font-bold text-slate-900">Soluciones</h2>
        <p className="mx-auto mb-12 max-w-3xl text-center text-sm font-medium text-slate-500 md:text-base">
          Plataformas modulares para seguridad, monitoreo y automatizacion orientadas a continuidad operativa real.
        </p>
        <motion.div
          className="grid grid-cols-1 gap-8 md:grid-cols-3"
          variants={cardContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          {SOLUTIONS.map((solution, idx) => (
            <motion.div
              key={solution.id}
              variants={cardItemVariants}
            >
              <motion.div
                whileHover={{ y: -6, boxShadow: "0 22px 45px -12px rgba(0,163,196,0.28)" }}
                className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-[#0a1428] p-6 shadow-sm transition-all duration-500 hover:border-cyan-500 md:p-7"
              >
                <div className={`pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${solution.accentClass}`} />

                <div className="mb-5 flex items-center justify-between">
                  <h3 className="text-lg font-black text-white md:text-xl">{solution.title}</h3>
                  <div className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300">
                    live
                  </div>
                </div>

                <div className="mb-5">
                  <SolutionGraphic type={solution.graphicType} />
                </div>

                <p className="mb-5 text-sm leading-relaxed text-slate-300">{solution.summary}</p>

                <div className="mb-6 flex flex-wrap items-center gap-1.5 md:gap-2">
                  {solution.stats.map((stat) => (
                    <span
                      key={stat}
                      className="inline-flex h-6 items-center rounded-full border border-slate-600/75 bg-slate-800/70 px-2.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-slate-200 md:h-7 md:px-3 md:text-[10px]"
                    >
                      {stat}
                    </span>
                  ))}
                </div>

                <Link
                  href={`/soluciones#${solution.id}`}
                  className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-cyan-300 transition-all hover:bg-cyan-500/20 hover:text-cyan-100"
                >
                  Ver detalle
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function Sectors() {
  return (
    <section id="sectores" className="relative z-10 border-t border-slate-200 bg-slate-100 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-12 text-center text-3xl font-bold text-slate-900">Sectores</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {(
            [
              { Icon: Landmark, title: "Bancario" },
              { Icon: Factory, title: "Industrial" },
              { Icon: Store, title: "Comercial" },
              { Icon: Building2, title: "Gubernamental" },
            ] as { Icon: LucideIcon; title: string }[]
          ).map(({ Icon, title }) => (
            <motion.div
              key={title}
              whileHover={{ scale: 1.02, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)" }}
              className="group cursor-pointer rounded-2xl border border-gray-100 bg-white p-6 transition-all duration-300 hover:border-cyan-300"
            >
              <div className="mb-4 flex items-center gap-3">
                <Icon className="h-6 w-6 text-cyan-500 transition-transform group-hover:scale-110" />
                <h3 className="text-lg font-bold text-slate-900">{title}</h3>
              </div>
              <p className="text-sm leading-relaxed text-slate-500">
                Focuses on matters included in implementing electronic security on {title}.
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Methodology() {
  return (
    <section
      id="metodologia"
      className="relative z-10 overflow-hidden border-t border-slate-200 py-20 text-white"
      style={{ background: "radial-gradient(circle at top, #0c1a2e 0%, #020914 80%)" }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mb-20 max-w-3xl text-center text-2xl font-bold leading-tight md:text-3xl"
        >
          Metodologia disenada para operacion estable y auditable
        </motion.h2>

        <div className="relative mx-auto max-w-5xl">
          <div className="absolute left-[16%] right-[16%] top-8 hidden h-[1px] bg-white/10 md:block" />
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: "68%" }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
            className="absolute left-[16%] top-8 hidden h-[1px] bg-cyan-400 shadow-[0_0_15px_rgba(0,210,255,0.8)] md:block"
          >
            <motion.div
              animate={{ left: ["0%", "100%"] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
              className="absolute top-[-2px] z-10 h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_10px_4px_rgba(0,210,255,1)]"
            />
          </motion.div>

          <div className="relative z-10 grid grid-cols-1 gap-12 md:grid-cols-3">
            {(
              [
                { step: "1", title: "LEVANTAMIENTO", desc: "Analisis exhaustivo de requerimientos y entorno.", Icon: Search, delay: 0.2 },
                { step: "2", title: "ARQUITECTURA", desc: "Diseno de soluciones robustas y escalables.", Icon: Share2, delay: 0.6 },
                { step: "3", title: "IMPLEMENTACION", desc: "Despliegue estructurado y puesta en marcha.", Icon: MonitorSmartphone, delay: 1.0 },
              ] as { step: string; title: string; desc: string; Icon: LucideIcon; delay: number }[]
            ).map(({ step, title, desc, Icon, delay }) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay }}
                className="group text-center"
              >
                <div className="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-cyan-400/50 bg-[#112440] transition-all duration-300 group-hover:border-cyan-400 group-hover:shadow-[0_0_20px_rgba(0,210,255,0.5)]">
                  <div className="absolute -top-3 rounded bg-cyan-500 px-2 py-0.5 text-[11px] font-bold text-white shadow-[0_2px_5px_rgba(0,0,0,0.5)]">Paso {step}</div>
                  <Icon className="h-5 w-5 text-cyan-400" />
                </div>
                <h3 className="mb-3 text-sm font-bold uppercase tracking-widest text-white transition-colors group-hover:text-cyan-400">{title}</h3>
                <p className="mx-auto max-w-[250px] text-sm leading-relaxed text-slate-400">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section id="contacto" className="relative z-10 bg-white pb-20 pt-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="group relative flex flex-col items-center justify-center gap-8 overflow-hidden rounded-[2rem] border border-gray-200 bg-gradient-to-b from-white to-slate-50 p-10 text-center shadow-[0_20px_50px_rgba(0,0,0,0.05)] md:p-14">
          <div className="pointer-events-none absolute left-1/2 top-0 h-full w-full -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-50/60 via-transparent to-transparent opacity-80 transition-opacity duration-700 group-hover:opacity-100" />
          <div className="relative z-10 max-w-2xl">
            <h3 className="mb-5 text-3xl font-black leading-tight text-slate-900 md:text-4xl">
              Listo para evaluar tu operacion y disenar una solucion robusta?
            </h3>
            <p className="text-lg text-slate-500">
              Nuestros especialistas estan listos para analizar su infraestructura actual y proponer la arquitectura que asegurara su futuro.
            </p>
          </div>
          <div className="relative z-10 mt-2">
            <Link href="/contacto" className="flex w-full items-center justify-center gap-3 rounded-full bg-gradient-to-r from-cyan-600 to-blue-700 px-10 py-4 text-lg font-bold text-white transition-all duration-300 shadow-[0_15px_30px_rgba(6,182,212,0.3)] hover:-translate-y-1 hover:from-cyan-500 hover:to-blue-600 hover:shadow-[0_20px_40px_rgba(6,182,212,0.5)] sm:w-auto">
              Solicitar Consultoria Gratuita
              <ArrowRight className="h-6 w-6" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="relative z-10 bg-slate-900 pb-10 pt-20 text-sm text-slate-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-12">
          <div>
            <h4 className="mb-6 text-xs font-bold tracking-widest text-white">EMPRESA</h4>
            <ul className="space-y-4 text-xs font-medium text-slate-400">
              <li><Link href="/nosotros" className="transition-colors hover:text-cyan-400">Nosotros</Link></li>
              <li><Link href="/proyectos" className="transition-colors hover:text-cyan-400">Trayectoria</Link></li>
              <li><Link href="/proyectos" className="transition-colors hover:text-cyan-400">Casos de exito</Link></li>
              <li><Link href="/partners" className="transition-colors hover:text-cyan-400">Partners</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-6 text-xs font-bold tracking-widest text-white">SOLUCIONES</h4>
            <ul className="space-y-4 text-xs font-medium text-slate-400">
              <li><Link href="/soluciones" className="transition-colors hover:text-cyan-400">Seguridad electronica</Link></li>
              <li><Link href="/soluciones" className="transition-colors hover:text-cyan-400">Gestion de video</Link></li>
              <li><Link href="/soluciones" className="transition-colors hover:text-cyan-400">Control de acceso</Link></li>
              <li><Link href="/soluciones" className="transition-colors hover:text-cyan-400">Automatizacion y BMS</Link></li>
              <li><Link href="/soluciones" className="transition-colors hover:text-cyan-400">Energia y respaldo</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-6 text-xs font-bold tracking-widest text-white">SECTORES</h4>
            <ul className="space-y-4 text-xs font-medium text-slate-400">
              <li>Banca</li>
              <li>Industrial</li>
              <li>Comercial</li>
              <li>Gubernamental</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-6 text-xs font-bold tracking-widest text-white">CONTACTO</h4>
            <ul className="space-y-4 text-xs font-medium text-slate-400">
              <li><Link href="/contacto" className="transition-colors hover:text-cyan-400">Solicitar consultoria</Link></li>
              <li>Atencion por correo</li>
              <li><span className="text-slate-500">Caracas, Venezuela</span></li>
              <li><Link href="/contacto" className="transition-colors hover:text-cyan-400">Soporte tecnico</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/5 pt-8 text-center">
          <p className="text-[10px] uppercase tracking-widest text-slate-500">
            © 2026 COP&apos;S Electronics, S.A. Todos los derechos reservados. Automatizacion - Seguridad - Energia
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function NewHomeClient() {
  const [appReady, setAppReady] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("cops-intro-seen") === "true";
    }
    return false;
  });

  useEffect(() => {
    if (appReady) return;

    const handlePhaseChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ phase?: string }>;
      if (customEvent.detail?.phase === "normal") {
        setAppReady(true);
      }
    };

    window.addEventListener("particlePhaseChange", handlePhaseChange);
    return () => window.removeEventListener("particlePhaseChange", handlePhaseChange);
  }, [appReady]);

  return (
    <div className="relative min-h-screen bg-transparent font-sans text-slate-800">
      <ParticleNetwork />

      <AnimatePresence>
        {appReady && (
          <>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="fixed left-0 right-0 top-0 z-[100] w-full pointer-events-none"
            >
              <NewHomeHeader />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, filter: "blur(10px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="relative z-10"
            >
              <Hero />
              <div className="relative z-30 mb-0 w-full">
                <StorySection />
              </div>
              <Partners />
              <div className="relative z-10 w-full bg-gray-50 shadow-xl">
                <Solutions />
                <Sectors />
              </div>
              <Methodology />
              <CTASection />
              <Footer />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
