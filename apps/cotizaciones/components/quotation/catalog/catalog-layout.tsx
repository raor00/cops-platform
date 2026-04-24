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
    <div className="flex min-h-0 flex-1 gap-4">
      <aside className="hidden w-[280px] shrink-0 flex-col gap-4 md:flex">
        <div className="glass-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Filtros</h3>
          </div>
          {sidebar}
        </div>
      </aside>

      <div className="md:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Filtros
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] p-4">
            <SheetHeader className="flex-row items-center justify-between space-y-0 text-left">
              <SheetTitle>Filtros</SheetTitle>
              <SheetClose asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <X className="h-4 w-4" />
                  <span className="sr-only">Cerrar filtros</span>
                </Button>
              </SheetClose>
            </SheetHeader>
            <div className="mt-4 animate-slide-in-left">{sidebar}</div>
          </SheetContent>
        </Sheet>
      </div>

      <main className="min-w-0 flex-1">{children}</main>
    </div>
  )
}
