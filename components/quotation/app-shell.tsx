"use client"

import React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { QuotationBuilder } from "./quotation-builder"
import { CatalogManager } from "./catalog-manager"
import { QuotationHistory } from "./quotation-history"
import type { QuotationData } from "@/lib/quotation-types"
import {
  FilePlus,
  Package,
  Clock,
  Shield,
  Menu,
  X,
  ChevronRight,
} from "lucide-react"

type View = "new" | "catalog" | "history"

const NAV_ITEMS: { id: View; label: string; icon: React.ReactNode }[] = [
  { id: "new", label: "Nueva Cotizacion", icon: <FilePlus className="h-4 w-4" /> },
  { id: "catalog", label: "Catalogo", icon: <Package className="h-4 w-4" /> },
  { id: "history", label: "Historial", icon: <Clock className="h-4 w-4" /> },
]

export function AppShell() {
  const [activeView, setActiveView] = useState<View>("new")
  const [editingQuotation, setEditingQuotation] = useState<QuotationData | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleEditQuotation = useCallback((data: QuotationData) => {
    setEditingQuotation(data)
    setActiveView("new")
  }, [])

  const handleNewQuotation = useCallback(() => {
    setEditingQuotation(null)
    setActiveView("new")
  }, [])

  const handleSaved = useCallback(() => {
    setRefreshKey((k) => k + 1)
  }, [])

  const navigateTo = (view: View) => {
    if (view === "new") {
      setEditingQuotation(null)
    }
    setActiveView(view)
    setMobileMenuOpen(false)
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar - Desktop */}
      <aside className="hidden w-60 shrink-0 border-r border-border bg-card lg:block">
        <div className="sticky top-0 flex h-screen flex-col">
          {/* Logo */}
          <div className="border-b border-border bg-[#0a1628] px-5 py-5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#1a3a6b]">
                <Shield className="h-4.5 w-4.5 text-[#5b9aff]" />
              </div>
              <div>
                <h1 className="text-sm font-bold tracking-wide text-white">{"COP'S ELECTRONICS"}</h1>
                <p className="text-[10px] text-[#7a9cc7]">Sistema de Cotizaciones</p>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4">
            <div className="space-y-1">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigateTo(item.id)}
                  className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${
                    activeView === item.id
                      ? "bg-[#1a5276] font-medium text-white"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>
          </nav>

          {/* Footer */}
          <div className="border-t border-border px-5 py-4">
            <div className="text-[10px] text-muted-foreground">
              <p className="font-medium text-foreground">{"Cop's Electronics S.A."}</p>
              <p className="mt-0.5">0212-7934136 / 7940316</p>
              <p>proyectos@copselectronics.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-foreground/20" onClick={() => setMobileMenuOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 border-r border-border bg-card shadow-lg">
            <div className="border-b border-border bg-[#0a1628] px-5 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#1a3a6b]">
                    <Shield className="h-4.5 w-4.5 text-[#5b9aff]" />
                  </div>
                  <span className="text-sm font-bold text-white">{"COP'S"}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(false)} className="h-8 w-8 p-0 text-white hover:bg-white/10">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <nav className="px-3 py-4">
              <div className="space-y-1">
                {NAV_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => navigateTo(item.id)}
                    className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-sm transition-colors ${
                      activeView === item.id
                        ? "bg-[#1a5276] font-medium text-white"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {item.icon}
                    {item.label}
                    {activeView === item.id && <ChevronRight className="ml-auto h-3.5 w-3.5" />}
                  </button>
                ))}
              </div>
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Mobile Header */}
        <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3 lg:hidden">
          <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(true)} className="h-8 w-8 p-0 text-foreground">
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-[#1a5276]" />
            <span className="text-sm font-bold text-foreground">{"COP'S ELECTRONICS"}</span>
          </div>
          <div className="w-8" />
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
            {activeView === "new" && (
              <QuotationBuilder
                key={editingQuotation?.id || "new"}
                initialData={editingQuotation}
                onSaved={handleSaved}
              />
            )}
            {activeView === "catalog" && <CatalogManager />}
            {activeView === "history" && (
              <QuotationHistory
                onEdit={handleEditQuotation}
                refreshKey={refreshKey}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
