export default function SiteFooter() {
  return (
    <footer className="border-t bg-slate-950 text-slate-400">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm flex flex-col gap-2 sm:flex-row sm:justify-between">
        <p>
          © {new Date().getFullYear()} COP’S Electronics, S.A.  
          <span className="ml-2">Todos los derechos reservados.</span>
        </p>
        <p className="text-slate-500">
          Automatización · Seguridad · Energía
        </p>
      </div>
    </footer>
  );
}
