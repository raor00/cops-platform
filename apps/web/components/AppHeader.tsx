"use client";

import Link from "next/link";
import { Zap, Settings, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

export default function AppHeader() {
    const pathname = usePathname();
    const isDashboard = pathname.startsWith("/panel");

    return (
        <header className="fixed left-0 right-0 top-0 z-[100] px-4 py-4 md:px-6 transition-all duration-300 backdrop-blur-md bg-[#070f1e]/40 border-b border-white/5">
            <div className="mx-auto max-w-7xl flex items-center justify-between">
                <Link href="/" className="group flex items-center gap-3">
                    <motion.div
                        initial={{ rotate: -15, scale: 0.9 }}
                        animate={{ rotate: 0, scale: 1 }}
                        transition={{ duration: 0.5, ease: "backOut" }}
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-[0_0_20px_rgba(0,163,196,0.3)]"
                    >
                        <Zap className="h-4 w-4" />
                    </motion.div>
                    <div className="flex flex-col">
                        <span className="text-lg font-black tracking-tight text-white drop-shadow-md">
                            COP&apos;S <span className="text-cyan-400">Electronics</span>
                        </span>
                    </div>
                </Link>

                {isDashboard && (
                    <div className="flex items-center gap-3">
                        <Link
                            href="/panel/perfiles"
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition-all hover:bg-white/10 hover:text-white"
                            title="Configuración de Perfil"
                        >
                            <Settings className="h-4 w-4" />
                        </Link>
                        <div className="h-4 w-[1px] bg-white/10 mx-1 border-none" />
                        <a
                            href="/logout"
                            className="flex h-9 px-3 items-center justify-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 text-xs font-semibold text-rose-200 transition-all hover:bg-rose-500/20 hover:text-rose-100"
                        >
                            <LogOut className="h-3.5 w-3.5" />
                            <span>Cerrar Sesión</span>
                        </a>
                    </div>
                )}
            </div>
        </header>
    );
}
