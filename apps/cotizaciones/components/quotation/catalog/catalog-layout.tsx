"use client"

import { useState, type ReactNode } from "react"
import { Filter, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

interface CatalogLayoutProps {
  sidebar: ReactNode
  children: ReactNode
}

export function CatalogLayout({ sidebar, children }: CatalogLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex flex-1 gap-2">
      {/* Desktop sidebar - full height, sticky */}
      <aside className="hidden h-[calc(100vh-7rem)] w-[240px] shrink-0 md:flex">
        <div className="glass-card flex w-full flex-col overflow-hidden">
          <div className="shrink-0 border-b border-border/50 px-3 py-2.5">
            <h3 className="text-sm font-semibold text-foreground">Filtros</h3>
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-2">
            {sidebar}
          </div>
        </div>
      </aside>

      {/* Mobile filter trigger */}
      <div className="md:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Filtros
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] p-0">
            <SheetHeader className="flex-row items-center justify-between space-y-0 border-b border-border/50 px-4 py-3 text-left">
              <SheetTitle className="text-base">Filtros</SheetTitle>
              <SheetClose asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <X className="h-4 w-4" />
                  <span className="sr-only">Cerrar filtros</span>
                </Button>
              </SheetClose>
            </SheetHeader>
            <div className="h-[calc(100vh-4rem)] overflow-y-auto px-4 py-3">
              {sidebar}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Main content */}
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  )
}
