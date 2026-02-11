import Link from "next/link";
import { cookies } from "next/headers";
import { Headset, ShieldCheck, FileSpreadsheet } from "lucide-react";
import {
  MASTER_ROLE_COOKIE,
  MASTER_USER_COOKIE,
  ModuleId,
  getVisibleModules,
} from "../../lib/masterAuth";

const iconByModule: Record<ModuleId, typeof Headset> = {
  soporte: Headset,
  cotizaciones: FileSpreadsheet,
  administracion: ShieldCheck,
};

export default async function PanelHomePage() {
  const cookieStore = await cookies();
  const role = cookieStore.get(MASTER_ROLE_COOKIE)?.value;
  const username = cookieStore.get(MASTER_USER_COOKIE)?.value ?? "usuario";
  const modules = getVisibleModules(role);

  return (
    <section className="relative py-6">
      <div className="pointer-events-none absolute left-0 top-0 h-64 w-64 rounded-full bg-brand-600/20 blur-[90px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-indigo-500/20 blur-[100px]" />

      <div className="relative">
        <span className="tag-glass">Portal interno</span>
        <h1 className="mt-3 text-3xl font-semibold text-white">Selecciona un modulo</h1>
        <p className="mt-2 max-w-3xl text-white/55">
          Sesion activa como <span className="font-semibold text-white/80">{username}</span>. El acceso visible depende de tu perfil.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {modules.map((module) => {
            const Icon = iconByModule[module.id];

            return (
              <Link
                key={module.id}
                href={module.href}
                className="lg-card card-lift group relative overflow-hidden p-5"
              >
                <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-brand-500/10 blur-2xl transition group-hover:bg-brand-400/20" />

                <div className="relative flex items-start justify-between">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05]">
                    <Icon className="h-6 w-6 text-brand-200" />
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-white/40">Modulo</span>
                </div>

                <h2 className="relative mt-5 text-xl font-semibold text-white">{module.title}</h2>
                <p className="relative mt-2 text-sm leading-relaxed text-white/55">{module.description}</p>

                <span className="relative mt-6 inline-flex items-center text-sm font-semibold text-brand-200 transition group-hover:text-brand-100">
                  Entrar
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
