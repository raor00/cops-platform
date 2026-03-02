import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="bg-slate-950 border-t border-white/5 text-slate-400 relative z-20">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <span className="text-lg font-black tracking-tight text-white">COP&apos;S <span className="text-blue-500">Electronics</span></span>
            <p className="mt-1 text-[11px] font-medium uppercase tracking-widest text-slate-500">
              Continuidad Operativa Asegurada
            </p>
          </div>

          <div className="text-center md:text-right text-[11px] font-semibold tracking-wider text-slate-500">
            <p>© {new Date().getFullYear()} COP&apos;S Electronics, S.A. Todos los derechos reservados.</p>
            <p className="mt-1">Caracas, Venezuela</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
