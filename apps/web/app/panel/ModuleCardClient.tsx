"use client";

import Link from "next/link";
import { useState } from "react";
import { Loader2, Headset, ShieldCheck, FileSpreadsheet, Box } from "lucide-react";
import { useRouter } from "next/navigation";

interface Module {
    id: string;
    title: string;
    description: string;
    href: string;
}

const iconMap: Record<string, any> = {
    tickets: Headset,
    cotizaciones: FileSpreadsheet,
    administracion: ShieldCheck,
};

export default function ModuleCardClient({
    module
}: {
    module: Module;
}) {
    const [isNavigating, setIsNavigating] = useState(false);
    const router = useRouter();

    const IconToRender = iconMap[module.id] || Box;

    const isExternal = module.href.startsWith("http");

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (isNavigating) return;
        setIsNavigating(true);
        setTimeout(() => {
            if (isExternal) {
                window.location.href = module.href;
            } else {
                router.push(module.href);
            }
        }, 50);
    };

    return (
        <Link
            href={module.href}
            onClick={handleClick}
            prefetch={true}
            className={`group relative flex flex-col items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-[#0a162d]/60 p-8 text-center shadow-[0_20px_40px_-15px_rgba(0,0,0,0.7)] backdrop-blur-md transition-all duration-500 hover:-translate-y-2 hover:border-cyan-500/40 hover:bg-[#0c1b36]/80 hover:shadow-[0_30px_60px_-15px_rgba(0,163,196,0.3)] ${isNavigating ? 'pointer-events-none opacity-80 scale-[0.98]' : ''}`}
        >
            <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-cyan-500/10 blur-3xl transition group-hover:bg-cyan-400/20" />
            <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-blue-500/10 blur-2xl transition group-hover:bg-blue-400/20" />

            <div className="relative mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 transition-transform duration-500 group-hover:scale-110 group-hover:border-cyan-500/30 group-hover:bg-cyan-500/10">
                {isNavigating ? (
                    <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
                ) : (
                    <IconToRender className="h-8 w-8 text-cyan-100 transition-colors group-hover:text-cyan-400" />
                )}
            </div>

            <div className="relative w-full">
                <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-600/70">
                    {isNavigating ? 'Conectando...' : 'Módulo'}
                </span>
                <h2 className="text-xl font-bold text-white mb-2">{module.title}</h2>
                <p className="text-xs font-medium leading-relaxed text-slate-400 line-clamp-3">
                    {module.description}
                </p>
            </div>

            <div className="relative mt-7 flex items-center justify-center gap-2 rounded-full border border-white/5 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-300 transition group-hover:border-cyan-500/50 group-hover:bg-cyan-500/20 group-hover:text-cyan-100">
                {isNavigating ? (
                    <>
                        <Loader2 className="h-3 w-3 animate-spin" /> INGRESANDO
                    </>
                ) : (
                    <>
                        INGRESAR
                        <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
                    </>
                )}
            </div>
        </Link>
    );
}
