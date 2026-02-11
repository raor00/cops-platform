"use client"

import React from "react"
import Image from "next/image"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { QuotationBuilder } from "./quotation-builder"
import { CatalogManager } from "./catalog-manager"
import { QuotationHistory } from "./quotation-history"
import { DeliveryNoteBuilder } from "./delivery-note-builder"
import { TransportGuideBuilder } from "./transport-guide-builder"
import type { QuotationData } from "@/lib/quotation-types"
import {
  FilePlus,
  Package,
  Clock,
  ClipboardList,
  Truck,
  Menu,
  X,
  ChevronRight,
} from "lucide-react"

type View = "new" | "delivery" | "transport" | "catalog" | "history"

const NAV_ITEMS: { id: View; label: string; icon: React.ReactNode }[] = [
  { id: "new", label: "Nueva Cotizacion", icon: <FilePlus className="h-4 w-4" /> },
  { id: "delivery", label: "Nota de Entrega", icon: <ClipboardList className="h-4 w-4" /> },
  { id: "transport", label: "Guia de Transporte", icon: <Truck className="h-4 w-4" /> },
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
    <div className="relative flex min-h-screen bg-background">
      {/* Sidebar - Desktop */}
      <aside className="hidden w-60 shrink-0 lg:block lg:px-3 lg:py-4">
        <div className="glass-card sticky top-4 flex h-[calc(100vh-2rem)] flex-col overflow-hidden border border-white/15 bg-white/[0.08]">
          {/* Logo */}
          <div className="border-b border-white/12 bg-transparent px-5 py-5">
            <div className="flex items-center gap-2.5">
              <div className="glass-pill flex h-9 w-9 items-center justify-center rounded-md">
                <Image src="/cops-logo.png" alt="COPS Electronics" width={28} height={28} />
              </div>
              <div>
                <h1 className="text-sm font-bold tracking-wide text-white">{"COP'S ELECTRONICS"}</h1>
                <p className="text-[10px] text-white/70">Sistema de Cotizaciones</p>
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
                  className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-all duration-200 ${
                    activeView === item.id
                      ? "glass-pill bg-white/18 font-medium text-white shadow-[0_8px_20px_rgba(10,30,70,0.24)]"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>
          </nav>

          {/* Footer */}
          <div className="border-t border-white/12 px-5 py-4">
            <div className="text-[10px] text-white/65">
              <p className="font-medium text-white">{"Cop's Electronics S.A."}</p>
              <p className="mt-0.5">0212-7934136 / 7940316</p>
              <p>proyectos@copselectronics.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-[#07112c]/45" onClick={() => setMobileMenuOpen(false)} />
          <aside className="glass absolute left-0 top-0 h-full w-64 border-r border-white/15 bg-white/[0.08] shadow-lg">
            <div className="border-b border-white/12 bg-transparent px-5 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="glass-pill flex h-9 w-9 items-center justify-center rounded-md">
                    <Image src="/cops-logo.png" alt="COPS Electronics" width={26} height={26} />
                  </div>
                  <span className="text-sm font-bold text-white">{"COP'S"}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(false)} className="h-8 w-8 p-0 text-white hover:bg-white/12">
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
                    className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 ${
                      activeView === item.id
                        ? "glass-pill bg-white/18 font-medium text-white shadow-[0_8px_20px_rgba(10,30,70,0.24)]"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
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
        <header className="glass mx-3 mt-3 flex items-center justify-between rounded-2xl border border-white/15 bg-white/[0.08] px-4 py-3 lg:hidden">
          <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(true)} className="h-8 w-8 p-0 text-white">
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Image src="/cops-logo.png" alt="COPS Electronics" width={20} height={20} />
            <span className="text-sm font-bold text-white">{"COP'S ELECTRONICS"}</span>
          </div>
          <div className="w-8" />
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="mx-auto max-w-6xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
            {activeView === "new" && (
              <QuotationBuilder
                key={editingQuotation?.id || "new"}
                initialData={editingQuotation}
                onSaved={handleSaved}
              />
            )}
            {activeView === "delivery" && <DeliveryNoteBuilder />}
            {activeView === "transport" && <TransportGuideBuilder />}
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

