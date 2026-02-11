"use client";

import { FormEvent, useEffect, useState } from "react";

type Role = "admin" | "tickets" | "cotizaciones";

type Profile = {
  id: string;
  username: string;
  password: string;
  role: Role;
  permissions: string[];
};

const STORAGE_KEY = "cops_profiles";

const permissionOptions = [
  { id: "tickets", label: "Tickets" },
  { id: "cotizaciones", label: "Cotizacion" },
  { id: "administracion", label: "Administracion" },
  { id: "autorizacion", label: "Autorizacion" },
];

export default function PerfilesPage() {
  const [profiles, setProfiles] = useState<Profile[]>(() => {
    if (typeof window === "undefined") return [];
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    try {
      return JSON.parse(raw) as Profile[];
    } catch {
      return [];
    }
  });
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("tickets");
  const [permissions, setPermissions] = useState<string[]>(["tickets"]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
  }, [profiles]);

  const applyRoleDefaults = (nextRole: Role) => {
    if (nextRole === "admin") {
      setPermissions(permissionOptions.map((item) => item.id));
      return;
    }

    if (nextRole === "tickets") {
      setPermissions((prev) =>
        Array.from(
          new Set([
            "tickets",
            ...prev.filter((p) => p !== "administracion" && p !== "autorizacion"),
          ]),
        ),
      );
      return;
    }

    setPermissions((prev) =>
      Array.from(
        new Set([
          "cotizaciones",
          ...prev.filter((p) => p !== "administracion" && p !== "autorizacion"),
        ]),
      ),
    );
  };

  const onRoleChange = (nextRole: Role) => {
    setRole(nextRole);
    applyRoleDefaults(nextRole);
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!username.trim() || !password.trim()) return;

    const newProfile: Profile = {
      id: crypto.randomUUID(),
      username: username.trim(),
      password: password.trim(),
      role,
      permissions: role === "admin" ? permissionOptions.map((item) => item.id) : permissions,
    };

    setProfiles((prev) => [newProfile, ...prev]);
    setUsername("");
    setPassword("");
    onRoleChange("tickets");
  };

  const togglePermission = (permissionId: string) => {
    if (role === "admin") {
      return;
    }

    setPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId],
    );
  };

  return (
    <section className="space-y-6">
      <div className="lg-card p-6 md:p-8">
        <span className="tag-glass">Perfiles</span>
        <h1 className="mt-4 text-3xl font-semibold text-white">Gestion de perfiles</h1>
        <p className="mt-3 max-w-2xl text-white/60">
          Crea usuarios y define su rol y permisos para mostrar u ocultar modulos del panel.
        </p>

        <form onSubmit={onSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold text-white/80">Usuario</label>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none"
              placeholder="nuevo_usuario"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-white/80">Contrasena</label>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none"
              placeholder="********"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-white/80">Rol</label>
            <select
              value={role}
              onChange={(event) => onRoleChange(event.target.value as Role)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-[#0a1024] px-4 py-2.5 text-sm text-white outline-none"
            >
              <option value="tickets">tickets</option>
              <option value="cotizaciones">cotizaciones</option>
              <option value="admin">admin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-white/80">Permisos</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {permissionOptions.map((permission) => {
                const active = permissions.includes(permission.id);

                return (
                  <button
                    key={permission.id}
                    type="button"
                    disabled={role === "admin"}
                    onClick={() => togglePermission(permission.id)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                      active
                        ? "border-brand-300/40 bg-brand-500/20 text-brand-100"
                        : "border-white/10 bg-white/[0.03] text-white/65"
                    } ${role === "admin" ? "opacity-70" : "hover:border-brand-300/30"}`}
                  >
                    {permission.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="md:col-span-2">
            <button type="submit" className="btn-glass-primary">
              Crear perfil
            </button>
          </div>
        </form>
      </div>

      <div className="lg-card p-6 md:p-8">
        <h2 className="text-xl font-semibold text-white">Perfiles creados</h2>
        <div className="mt-4 space-y-3">
          {profiles.length === 0 && (
            <p className="text-sm text-white/55">No hay perfiles creados aun.</p>
          )}

          {profiles.map((profile) => (
            <article key={profile.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-white">{profile.username}</p>
                <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-xs font-semibold text-white/70">
                  {profile.role}
                </span>
              </div>
              <p className="mt-2 text-xs text-white/50">Permisos: {profile.permissions.join(", ")}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
