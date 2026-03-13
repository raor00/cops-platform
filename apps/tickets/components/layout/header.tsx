"use client"

import React from "react"
import { Bell, Search, Menu, LayoutGrid } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { User } from "@/types"
import { ROLE_LABELS } from "@/types"

interface HeaderProps {
  user: User
  onMenuClick?: () => void
  onLogout: () => void
}

export function Header({ user, onMenuClick, onLogout }: HeaderProps) {
  const webAppUrl = (process.env.NEXT_PUBLIC_PLATFORM_WEB_URL || "https://cops-platform-web.vercel.app").replace(/\/$/, "")

  const goToModuleSelector = () => {
    window.location.href = `${webAppUrl}/panel`
  }

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-slate-200 bg-white backdrop-blur-md shadow-sm border-b-slate-200">
      <div className="flex h-full items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-slate-500 hover:text-slate-900"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="hidden md:flex relative w-64 lg:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar tickets, clientes..."
              className="border-slate-200 bg-white pl-9 focus:border-blue-500/50"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative text-slate-500 hover:text-slate-900"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="py-4 text-center text-sm text-slate-500">
                No hay notificaciones nuevas
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 px-2 text-slate-700 hover:text-slate-900"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {user.nombre.charAt(0)}
                    {user.apellido.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-medium">
                    {user.nombre} {user.apellido}
                  </p>
                  <p className="text-xs text-slate-500">{ROLE_LABELS[user.rol]}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Perfil</DropdownMenuItem>
              <DropdownMenuItem>Configuracion</DropdownMenuItem>
              <DropdownMenuItem onClick={goToModuleSelector}>
                <LayoutGrid className="h-4 w-4 mr-2" />
                Cambiar modulo
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-400 focus:text-red-400 focus:bg-red-500/10"
                onClick={onLogout}
              >
                Cerrar sesion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
