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
      className="relative flex min-h-[90vh] items-center overflow-hidden bg-transparent pb-40 pt-48 lg:pb-56 lg:pt-64"
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
            className="mb-12 max-w-2xl text-base font-light leading-relaxed tracking-wide text-slate-400 md:text-lg"
          >
            Disenamos y ejecutamos plataformas resilientes de Videovigilancia,
            Control de Acceso y Energia para corporaciones donde cada evento
            debe ser auditable y la continuidad es innegociable.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.1, ease: [0.16, 1, 0.3, 1] }}
            className="relative mt-8 group"
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
    stiffness: 100,
    damping: 20,
  });

  const statsOpacity = useTransform(smoothProgress, [0, 0.15], [1, 0]);
  const statsY = useTransform(smoothProgress, [0, 0.15], [0, -50]);
  const numberScale = useTransform(smoothProgress, [0, 0.4, 0.8], [1, 2.2, 2.2]);
  const numberY = useTransform(smoothProgress, [0, 0.4, 0.6, 1], ["0vh", "19vh", "19vh", "-21vh"]);
  const numberX = useTransform(smoothProgress, [0, 0.4, 0.8], ["0%", "15%", "15%"]);
  const numberGlow = useTransform(smoothProgress, [0.3, 0.5], ["0px 0px 0px rgba(34,211,238,0)", "0px 0px 40px rgba(34,211,238,0.8)"]);

  const bentoOpacity = useTransform(smoothProgress, [0.3, 0.5, 0.8, 1], [0, 1, 1, 1]);
  const bentoY = useTransform(smoothProgress, [0.4, 0.6, 1], ["30vh", "0vh", "-40vh"]);

  return (
    <section ref={containerRef} className="relative z-30 -mt-16 h-[180vh] w-full bg-transparent md:-mt-24">
      <div className="sticky top-0 flex h-[100dvh] w-full max-w-5xl flex-col items-center justify-start overflow-hidden px-4 sm:px-6 lg:px-8">
        <motion.div
          style={{ opacity: statsOpacity, y: statsY }}
          className="absolute left-0 right-0 top-[15vh] z-40 w-full origin-top px-4 md:top-[18vh]"
        >
          <div className="relative mx-auto max-w-4xl overflow-hidden rounded-2xl border border-white/5 bg-[#0b1426]/60 px-4 py-4 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.8)] backdrop-blur-xl md:px-8 md:py-6">
            <div className="absolute left-0 top-0 h-[1px] w-full bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
            <div className="relative z-10 grid w-full grid-cols-4 divide-x divide-white/5 gap-0">
              <div className="invisible pointer-events-none flex w-full flex-col items-center justify-center px-1 text-center md:px-4">
                <div className="mb-2 text-3xl font-black tracking-tight md:text-5xl">28+</div>
                <div className="text-[7px] font-bold uppercase tracking-widest leading-relaxed md:text-[10px]">ANOS DE<br className="md:hidden" />TRAYECTORIA</div>
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

        <div className="absolute left-0 right-0 top-[15vh] z-50 h-full w-full pointer-events-none px-4 md:top-[18vh]">
          <motion.div
            style={{ x: numberX, y: numberY, scale: numberScale }}
            className="absolute top-0 flex w-1/4 origin-left flex-col items-center justify-start px-1 pt-4 pointer-events-auto md:px-4 md:pt-6"
          >
            <motion.div
              style={{ textShadow: numberGlow }}
              className="mb-2 leading-none text-3xl font-black tracking-tighter text-white drop-shadow-2xl md:text-5xl"
            >
              28+
            </motion.div>
            <div className="text-center text-[7px] font-bold uppercase tracking-widest leading-relaxed text-cyan-400 drop-shadow-md md:text-[8px]">
              ANOS DE<br className="md:hidden" />TRAYECTORIA
            </div>
          </motion.div>
        </div>

        <motion.div
          style={{ opacity: bentoOpacity, y: bentoY }}
          className="absolute top-[15vh] flex h-full w-full flex-col justify-start px-4 pointer-events-none md:top-[18vh]"
        >
          <div className="relative z-10 mt-[15vh] grid grid-cols-1 gap-6 pointer-events-auto md:mt-[18vh] md:grid-cols-3">
            <div className="mb-6 flex w-full flex-col items-start md:col-span-3 md:flex-row md:items-end">
              <div className="hidden w-[45%] flex-shrink-0 md:block" />
              <div className="mt-28 w-full border-t border-white/10 pl-0 pt-8 text-center md:mt-0 md:w-[55%] md:border-l md:border-t-0 md:pl-8 md:pt-0 md:text-left">
                <h2 className="text-3xl font-black leading-tight tracking-tight text-white md:text-5xl">
                  Respaldando operacion critica en Venezuela
                </h2>
                <p className="mt-4 text-sm font-medium leading-relaxed text-slate-300 opacity-90">
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

const PARTNERS_DATA = [
  { name: "Bancamiga", hasIcon: true },
  { name: "BANCARIBE", hasIcon: false, italic: true },
  { name: "BANCO PLAZA", hasIcon: true, icon: <Building2 className="h-6 w-6" /> },
  { name: "BFC", hasIcon: true, gradient: true },
  { name: "Digitel", hasIcon: false },
  { name: "Banesco", hasIcon: false, italic: true },
];

const MARQUEE_CLIENTS = [...PARTNERS_DATA, ...PARTNERS_DATA];

function Partners() {
  return (
    <section className="relative z-40 overflow-hidden border-y border-slate-200 bg-white pb-24 pt-16">
      <div className="pointer-events-none absolute left-0 top-0 h-32 w-full -translate-y-[99%] bg-gradient-to-b from-[#070f1e] to-transparent opacity-100" />
      <div className="pointer-events-none absolute left-0 top-0 h-32 w-full bg-gradient-to-b from-[#070f1e] to-transparent opacity-40" />

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
            className="w-max shrink-0 flex items-center gap-16 px-8 md:gap-24"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ repeat: Infinity, ease: "linear", duration: 30 }}
          >
            {MARQUEE_CLIENTS.map((client, idx) => (
              <div key={`client-${idx}`} className="flex cursor-pointer items-center gap-2 grayscale opacity-50 transition-all hover:opacity-100 hover:grayscale-0">
                {client.hasIcon && !client.gradient && !client.icon && (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-800">
                    <div className="h-4 w-4 rounded-full bg-slate-800" />
                  </div>
                )}
                {client.hasIcon && client.gradient && (
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-red-500 to-blue-600" />
                )}
                {client.icon && <span className="text-slate-800">{client.icon}</span>}
                <span className={`text-xl font-bold tracking-tight text-slate-900 md:text-2xl ${client.italic ? "italic tracking-tighter" : ""} ${client.gradient ? "font-black" : ""}`}>
                  {client.name}
                </span>
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
            className="w-max shrink-0 flex items-center gap-16 px-8 md:gap-24"
            animate={{ x: ["-50%", "0%"] }}
            transition={{ repeat: Infinity, ease: "linear", duration: 35 }}
          >
            {MARQUEE_CLIENTS.map((_, idx) => (
              <div key={`tech-${idx}`} className="flex cursor-pointer items-center gap-2 grayscale opacity-50 transition-all hover:opacity-100 hover:grayscale-0">
                <span className="text-xl font-black uppercase tracking-widest text-slate-400/80 md:text-2xl">TECH-LOGO {idx % 4 + 1}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Solutions() {
  return (
    <section id="soluciones" className="relative z-10 border-t border-slate-200 bg-slate-50 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-12 text-center text-3xl font-bold text-slate-900">Soluciones</h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {(
            [
              { Icon: ShieldCheck, title: "Seguridad electronica enterprise", videoSrc: "https://cdn.pixabay.com/video/2021/08/04/83870-584742468_tiny.mp4" },
              { Icon: Video, title: "Gestion de video (VMS)", videoSrc: "https://cdn.pixabay.com/video/2019/11/05/28848-372074094_tiny.mp4" },
              { Icon: Settings, title: "Automatizacion y BMS", videoSrc: "https://cdn.pixabay.com/video/2019/02/16/21430-318466657_tiny.mp4" },
            ] as { Icon: LucideIcon; title: string; videoSrc: string }[]
          ).map(({ Icon, title, videoSrc }) => (
            <motion.div
              key={title}
              whileHover={{ y: -5, boxShadow: "0 20px 40px -10px rgba(0,163,196,0.3)" }}
              className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-[#0a1428] p-8 shadow-sm transition-all duration-500 hover:border-cyan-500"
            >
              <video
                src={videoSrc}
                autoPlay
                loop
                muted
                playsInline
                className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover opacity-0 transition-all duration-700 group-hover:scale-110 group-hover:opacity-30"
              />
              <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#0a1428] via-[#0a1428]/80 to-transparent" />

              <Icon className="relative z-10 mb-6 h-10 w-10 text-cyan-400 transition-transform group-hover:scale-110 group-hover:text-cyan-300" strokeWidth={1.5} />
              <h3 className="relative z-10 mb-6 text-xl font-bold text-white">{title}</h3>
              <div className="relative z-10 flex justify-between text-sm text-slate-400">
                <div className="flex flex-col items-center gap-2"><div className="h-6 w-6 rounded-sm border-2 border-slate-600" />CCTV</div>
                <div className="flex flex-col items-center gap-2"><div className="h-6 w-6 rounded-sm border-2 border-slate-600" />Access</div>
                <div className="flex flex-col items-center gap-2"><div className="h-6 w-6 rounded-sm border-2 border-slate-600" />Audit</div>
                <div className="flex flex-col items-center gap-2"><div className="h-6 w-6 rounded-sm border-2 border-slate-600" />Integracion</div>
              </div>
            </motion.div>
          ))}
        </div>
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
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    const handlePhaseChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ phase?: string }>;
      if (customEvent.detail?.phase === "normal") {
        setAppReady(true);
      }
    };

    window.addEventListener("particlePhaseChange", handlePhaseChange);
    return () => window.removeEventListener("particlePhaseChange", handlePhaseChange);
  }, []);

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

