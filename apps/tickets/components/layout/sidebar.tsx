"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Ticket,
  FolderKanban,
  Kanban,
  Users,
  CreditCard,
  FileBarChart2,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import type { User, UserProfile } from "@/types"
import { ROLE_LABELS, hasPermission, ROLE_HIERARCHY } from "@/types"

interface SidebarProps {
  user: User | UserProfile
  onLogout: () => void
  collapsed?: boolean
  onCollapsedChange?: (val: boolean) => void
}

// ─── Navigation groups ───────────────────────────────────────────────────────

const PRIMARY_NAV = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    permission: null,
    exact: true,
  },
  {
    name: "Servicios",
    href: "/dashboard/tickets?tipo=servicio",
    matchHref: "/dashboard/tickets",
    icon: Ticket,
    permission: null,
  },
  {
    name: "Proyectos",
    href: "/dashboard/tickets?tipo=proyecto",
    matchHref: "/dashboard/tickets",
    icon: FolderKanban,
    permission: null,
  },
  {
    name: "Pipeline",
    href: "/dashboard/pipeline",
    icon: Kanban,
    permission: null,
    exact: false,
  },
] as const

const MANAGEMENT_NAV = [
  {
    name: "Usuarios",
    href: "/dashboard/usuarios",
    icon: Users,
    permission: "users:view" as const,
  },
  {
    name: "Pagos",
    href: "/dashboard/pagos",
    icon: CreditCard,
    permission: "payments:view" as const,
  },
  {
    name: "Reportes",
    href: "/dashboard/reportes",
    icon: FileBarChart2,
    permission: "reports:view" as const,
  },
] as const

const SYSTEM_NAV = [
  {
    name: "Configuración",
    href: "/dashboard/configuracion",
    icon: Settings,
    permission: "config:view" as const,
  },
] as const

export function Sidebar({ user, onLogout, collapsed: controlledCollapsed, onCollapsedChange }: SidebarProps) {
  const pathname = usePathname()
  const [internalCollapsed, setInternalCollapsed] = useState(false)
  const collapsed = controlledCollapsed ?? internalCollapsed
  const setCollapsed = (val: boolean) => {
    setInternalCollapsed(val)
    onCollapsedChange?.(val)
  }

  function isActive(item: { href: string; matchHref?: string; exact?: boolean }) {
    const match = item.matchHref || item.href.split("?")[0]
    if (item.exact) return pathname === match
    return pathname === match || pathname.startsWith(match + "/")
  }

  const managementItems = MANAGEMENT_NAV.filter(
    (item) => hasPermission(user.rol, item.permission)
  )
  const systemItems = SYSTEM_NAV.filter(
    (item) => hasPermission(user.rol, item.permission)
  )

  const NavLink = ({ item }: { item: { name: string; href: string; matchHref?: string; exact?: boolean; icon: React.ComponentType<{ className?: string }> } }) => {
    const active = isActive(item)
    return (
      <Link
        href={item.href}
        className={cn(
          "sidebar-nav-item flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
          active
            ? "active bg-gradient-to-r from-blue-500/25 to-purple-500/15 text-white border border-blue-500/30 shadow-[0_0_20px_rgba(47,84,224,0.12)]"
            : "text-white/60 hover:bg-white/10 hover:text-white"
        )}
      >
        <item.icon className={cn("h-[18px] w-[18px] shrink-0", active ? "text-sky-400" : "")} />
        {!collapsed && <span>{item.name}</span>}
        {!collapsed && active && (
          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-sky-400" />
        )}
      </Link>
    )
  }

  const SectionDivider = ({ label }: { label?: string }) => (
    <div className={cn("my-2", collapsed ? "mx-2" : "mx-1")}>
      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-white/10" />
        {!collapsed && label && (
          <span className="text-[10px] font-semibold uppercase tracking-widest text-white/25 px-1 shrink-0">
            {label}
          </span>
        )}
        <div className="h-px flex-1 bg-white/10" />
      </div>
    </div>
  )

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen transition-all duration-300",
        collapsed ? "w-[72px]" : "w-64"
      )}
    >
      {/* Glass background */}
      <div className="absolute inset-0 border-r border-white/8 bg-gradient-to-b from-[#0d1117]/98 to-[#111827]/99 backdrop-blur-2xl" />

      {/* Content */}
      <div className="relative flex h-full flex-col">

        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-white/10">
          {!collapsed ? (
            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500/20 to-slate-500/20 border border-white/15 group-hover:border-sky-400/30 transition-colors">
                <Zap className="h-5 w-5 text-sky-400" />
              </div>
              <div>
                <span className="font-bold text-white text-sm">COPS</span>
                <span className="font-bold text-sky-400 text-sm"> Tickets</span>
              </div>
            </Link>
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500/20 to-slate-500/20 border border-white/15 mx-auto">
              <Zap className="h-5 w-5 text-sky-400" />
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-0.5 px-3 py-4 overflow-y-auto">
          {/* Primary nav */}
          {PRIMARY_NAV.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}

          {/* Management nav */}
          {managementItems.length > 0 && (
            <>
              <SectionDivider label="Gestión" />
              {managementItems.map((item) => (
                <NavLink key={item.href} item={item} />
              ))}
            </>
          )}

          {/* System nav */}
          {systemItems.length > 0 && (
            <>
              <SectionDivider label="Sistema" />
              {systemItems.map((item) => (
                <NavLink key={item.href} item={item} />
              ))}
            </>
          )}
        </nav>

        {/* Role badge (only when expanded) */}
        {!collapsed && (
          <div className="px-4 pb-2">
            <div className="rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 text-center">
              <span className="text-[11px] text-white/40 font-medium">{ROLE_LABELS[user.rol]}</span>
            </div>
          </div>
        )}

        {/* User section */}
        <div className="border-t border-white/10 p-3">
          <div className={cn("flex items-center gap-3 rounded-xl p-2", collapsed ? "justify-center" : "")}>
            <Avatar className="h-9 w-9 shrink-0 ring-1 ring-white/20">
              {"foto_perfil_url" in user && user.foto_perfil_url && (
                <AvatarImage src={user.foto_perfil_url} alt={`${user.nombre} ${user.apellido}`} />
              )}
              <AvatarFallback className="bg-gradient-to-br from-sky-600/30 to-slate-600/30 text-white text-xs font-bold">
                {user.nombre.charAt(0)}{user.apellido.charAt(0)}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {user.nombre} {user.apellido}
                </p>
                <p className="text-xs text-white/40 truncate">{user.email}</p>
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            className={cn(
              "mt-1 w-full text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-colors text-sm",
              collapsed ? "px-0 justify-center" : "justify-start"
            )}
            onClick={onLogout}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span className="ml-2">Cerrar sesión</span>}
          </Button>
        </div>

        {/* Collapse button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border border-white/20 bg-[#111827] text-white/60 hover:text-white hover:bg-white/10 transition-colors shadow-lg"
        >
          {collapsed ? (
            <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
    </aside>
  )
}
