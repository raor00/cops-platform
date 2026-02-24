"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  ChevronLeft,
  ChevronRight,
  Factory,
  Landmark,
  MonitorSmartphone,
  Search,
  Settings,
  Share2,
  ShieldCheck,
  Store,
  Video,
} from "lucide-react";
import ParticleNetwork from "./ParticleNetwork";
import VideoLoader from "./VideoLoader";

function Hero() {
  return (
    <section className="relative flex min-h-[90vh] items-center overflow-hidden bg-transparent pb-40 pt-48 lg:pb-56 lg:pt-64">
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
            Disenamos y ejecutamos plataformas resilientes de videovigilancia,
            control de acceso y energia para corporaciones donde cada evento debe
            ser auditable y la continuidad es innegociable.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.1, ease: [0.16, 1, 0.3, 1] }}
            className="relative mt-8 group"
          >
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

function Stats() {
  return (
    <section className="relative z-30 -mt-16 w-full px-4 pb-8 sm:px-6 md:-mt-24 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative flex flex-col items-center justify-between gap-6 overflow-hidden rounded-2xl border border-slate-700/50 bg-[#0b1426]/60 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl md:flex-row md:gap-0 md:p-8"
        >
          <div className="absolute left-0 top-0 h-[2px] w-full bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
          {[
            ["28+", "Anos de trayectoria"],
            ["1500+", "Proyectos ejecutados"],
            ["+12", "Inst. financieras"],
            ["Multi-sede", "Operacion nacional"],
          ].map(([value, label], idx) => (
            <div
              key={value}
              className={`w-full flex-1 px-4 pb-6 text-center md:w-auto md:pb-0 ${
                idx < 3 ? "border-b border-slate-700/50 md:border-b-0 md:border-r" : ""
              }`}
            >
              <div className={`mb-1 font-black ${idx === 3 ? "text-2xl md:text-3xl text-cyan-400" : "text-3xl md:text-4xl text-white"}`}>
                {value}
              </div>
              <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-400 md:text-xs">{label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function Partners() {
  return (
    <section className="relative z-10 bg-[#FAFAFA] pb-16 pt-8">
      <div className="pointer-events-none absolute left-0 top-0 h-32 w-full -translate-y-full bg-gradient-to-b from-[#070f1e] to-transparent opacity-80" />
      <div className="relative z-10 mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h3 className="inline-block border-b-2 border-cyan-500 pb-2 text-sm font-bold uppercase tracking-[0.2em] text-slate-900 md:text-base">
            Han confiado en COP&apos;S
          </h3>
        </div>

        <div className="relative mb-20 flex items-center justify-center gap-4">
          <button className="absolute left-0 z-20 hidden rounded-full border border-gray-100 bg-white p-2 text-slate-400 shadow-sm transition-colors hover:text-cyan-600 md:block">
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="flex flex-wrap items-center justify-center gap-8 px-12 md:flex-nowrap md:gap-16">
            {[
              "Bancamiga",
              "Bancaribe",
              "Banco Plaza",
              "BFC",
            ].map((name) => (
              <motion.div key={name} whileHover={{ scale: 1.05 }} className="cursor-pointer text-xl font-bold text-slate-900 opacity-60 grayscale transition-all hover:opacity-100 hover:grayscale-0">
                {name}
              </motion.div>
            ))}
          </div>

          <button className="absolute right-0 z-20 hidden rounded-full border border-gray-100 bg-white p-2 text-slate-400 shadow-sm transition-colors hover:text-cyan-600 md:block">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-10 text-center">
          <h3 className="inline-block border-b-2 border-cyan-500 pb-2 text-sm font-bold uppercase tracking-[0.2em] text-slate-900 md:text-base">
            Partners tecnologicos
          </h3>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {["Milestone", "Winsted", "Invenzi", "Altronix", "Automated Logic", "Velasea", "Magos"].map((name) => (
            <motion.div
              key={name}
              whileHover={{ scale: 1.05 }}
              className="cursor-pointer text-lg font-bold text-slate-900 opacity-50 transition-all hover:opacity-100"
            >
              {name}
            </motion.div>
          ))}
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
          {[
            [ShieldCheck, "Seguridad electronica enterprise"],
            [Video, "Gestion de video (VMS)"],
            [Settings, "Automatizacion y BMS"],
          ].map(([Icon, title]) => (
            <motion.div
              key={title as string}
              whileHover={{ y: -5, boxShadow: "0 20px 40px -10px rgba(0,163,196,0.3)" }}
              className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-[#0a1428] p-8 shadow-sm transition-all duration-500 hover:border-cyan-500"
            >
              <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#0a1428] via-[#0a1428]/80 to-transparent" />
              <Icon className="relative z-10 mb-6 h-10 w-10 text-cyan-400 transition-transform group-hover:scale-110 group-hover:text-cyan-300" strokeWidth={1.5} />
              <h3 className="relative z-10 mb-6 text-xl font-bold text-white">{title as string}</h3>
              <div className="relative z-10 text-sm text-slate-400">Arquitectura, integracion y operacion multi-sede con trazabilidad completa.</div>
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
          {[
            [Landmark, "Bancario"],
            [Factory, "Industrial"],
            [Store, "Comercial"],
            [Building2, "Gubernamental"],
          ].map(([Icon, title]) => (
            <motion.div
              key={title as string}
              whileHover={{ scale: 1.02, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)" }}
              className="group cursor-pointer rounded-2xl border border-gray-100 bg-white p-6 transition-all duration-300 hover:border-cyan-300"
            >
              <div className="mb-4 flex items-center gap-3">
                <Icon className="h-6 w-6 text-cyan-500 transition-transform group-hover:scale-110" />
                <h3 className="text-lg font-bold text-slate-900">{title as string}</h3>
              </div>
              <p className="text-sm leading-relaxed text-slate-500">
                Proyectos de alta criticidad con estandares de auditoria, continuidad y seguridad operacional.
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
    <section className="relative z-10 overflow-hidden border-t border-slate-200 py-20 text-white" style={{ background: "radial-gradient(circle at top, #0c1a2e 0%, #020914 80%)" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mb-20 max-w-3xl text-center text-2xl font-bold leading-tight md:text-3xl"
        >
          Metodologia disenada para operacion estable y auditable
        </motion.h2>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
          {[
            ["1", "LEVANTAMIENTO", Search],
            ["2", "ARQUITECTURA", Share2],
            ["3", "IMPLEMENTACION", MonitorSmartphone],
          ].map(([step, title, Icon]) => (
            <motion.div
              key={step as string}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="group text-center"
            >
              <div className="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-cyan-400/50 bg-[#112440] transition-all duration-300 group-hover:border-cyan-400 group-hover:shadow-[0_0_20px_rgba(0,210,255,0.5)]">
                <div className="absolute -top-3 rounded bg-cyan-500 px-2 py-0.5 text-[11px] font-bold text-white shadow-[0_2px_5px_rgba(0,0,0,0.5)]">
                  Paso {step as string}
                </div>
                <Icon className="h-5 w-5 text-cyan-400" />
              </div>
              <h3 className="mb-3 text-sm font-bold uppercase tracking-widest text-white transition-colors group-hover:text-cyan-400">{title as string}</h3>
              <p className="mx-auto max-w-[250px] text-sm leading-relaxed text-slate-400">
                Proceso estructurado de diseno, validacion e implementacion orientado a continuidad.
              </p>
            </motion.div>
          ))}
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
              Nuestros especialistas estan listos para analizar su infraestructura y proponer la arquitectura adecuada.
            </p>
          </div>
          <div className="relative z-10 mt-2">
            <Link
              href="/contacto"
              className="flex w-full items-center justify-center gap-3 rounded-full bg-gradient-to-r from-cyan-600 to-blue-700 px-10 py-4 text-lg font-bold text-white shadow-[0_15px_30px_rgba(6,182,212,0.3)] transition-all duration-300 hover:-translate-y-1 hover:from-cyan-500 hover:to-blue-600 hover:shadow-[0_20px_40px_rgba(6,182,212,0.5)] sm:w-auto"
            >
              Solicitar Consultoria
              <ArrowRight className="h-6 w-6" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function NewHomeClient() {
  const [appReady, setAppReady] = useState(false);

  return (
    <div className="relative -mt-[68px] min-h-screen bg-transparent font-sans text-slate-800 md:-mt-[76px]">
      {!appReady && <VideoLoader onComplete={() => setAppReady(true)} />}
      <ParticleNetwork />

      <AnimatePresence>
        {appReady && (
          <motion.div
            initial={{ opacity: 0, filter: "blur(10px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="relative z-10 pt-[68px] md:pt-[76px]"
          >
            <Hero />
            <div className="relative z-30 mb-0 w-full">
              <Stats />
            </div>
            <Partners />
            <div className="relative z-10 w-full bg-gray-50 shadow-xl">
              <Solutions />
              <Sectors />
            </div>
            <Methodology />
            <CTASection />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
