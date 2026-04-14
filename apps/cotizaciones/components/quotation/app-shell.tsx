"use client"

import React from "react"
import Image from "next/image"

import { useState, useCallback, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { QuotationBuilder } from "./quotation-builder"
import { CatalogManager } from "./catalog-manager"
import { QuotationHistory } from "./quotation-history"
import { DeliveryNoteBuilder } from "./delivery-note-builder"
import { TransportGuideBuilder } from "./transport-guide-builder"
import { KnowledgeManager } from "./knowledge-manager"
import type { QuotationData } from "@/lib/quotation-types"
import {
  FilePlus,
  Package,
  Clock,
  ClipboardList,
  Truck,
  Database,
  Menu,
  X,
  ChevronRight,
  LayoutGrid,
  LogOut,
  MoreVertical,
} from "lucide-react"

type View = "new" | "delivery" | "transport" | "catalog" | "history" | "knowledge"

const NAV_ITEMS: { id: View; label: string; icon: React.ReactNode }[] = [
  { id: "new", label: "Nueva Cotizacion", icon: <FilePlus className="h-4 w-4" /> },
  { id: "delivery", label: "Nota de Entrega", icon: <ClipboardList className="h-4 w-4" /> },
  { id: "transport", label: "Guia de Transporte", icon: <Truck className="h-4 w-4" /> },
  { id: "knowledge", label: "Base de Conocimiento", icon: <Database className="h-4 w-4" /> },
  { id: "catalog", label: "Catalogo", icon: <Package className="h-4 w-4" /> },
  { id: "history", label: "Historial", icon: <Clock className="h-4 w-4" /> },
]

export function AppShell() {
  const [activeView, setActiveView] = useState<View>("new")
  const [editingQuotation, setEditingQuotation] = useState<QuotationData | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileAccountMenuOpen, setMobileAccountMenuOpen] = useState(false)
  const [mobileHeaderVisible, setMobileHeaderVisible] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)
  const [selectMode, setSelectMode] = useState(false)
  const lastScrollRef = useRef(0)
  const webAppUrl = (process.env.NEXT_PUBLIC_PLATFORM_WEB_URL || "https://copselectronics.com").replace(/\/$/, "")

  // Sync desde Firestore al montar (hidrata localStorage con datos persistidos)
  useEffect(() => {
    import("@/lib/quotation-storage").then(({ syncCotizacionesFromFirestore }) => {
      syncCotizacionesFromFirestore().then(() => {
        setRefreshKey((k) => k + 1)
      })
    })
  }, [])

  // Detect ?select=true to activate select mode (Feature 3)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get("select") === "true") {
      setSelectMode(true)
      setActiveView("history")
    }
  }, [])

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
    setMobileAccountMenuOpen(false)
  }

  const goToPortal = useCallback(() => {
    window.location.href = `${webAppUrl}/panel`
  }, [webAppUrl])

  const logoutToWeb = useCallback(() => {
    setMobileMenuOpen(false)
    setMobileAccountMenuOpen(false)
    window.location.href = `${webAppUrl}/`
  }, [webAppUrl])

  useEffect(() => {
    const onScroll = () => {
      if (window.innerWidth >= 1024) return

      const y = window.scrollY
      const delta = y - lastScrollRef.current

      if (y < 20) {
        setMobileHeaderVisible(true)
      } else if (delta > 6 && !mobileMenuOpen && !mobileAccountMenuOpen) {
        setMobileHeaderVisible(false)
      } else if (delta < -6) {
        setMobileHeaderVisible(true)
      }

      lastScrollRef.current = y
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [mobileMenuOpen, mobileAccountMenuOpen])

  useEffect(() => {
    if (mobileMenuOpen || mobileAccountMenuOpen) {
      setMobileHeaderVisible(true)
    }
  }, [mobileMenuOpen, mobileAccountMenuOpen])

  return (
    <div className="relative flex min-h-screen overflow-x-hidden bg-background">
      {/* Sidebar - Desktop */}
      <aside className="hidden w-60 shrink-0 lg:block lg:px-3 lg:py-4">
        <div className="sticky top-4 flex h-[calc(100vh-2rem)] flex-col overflow-hidden rounded-[1rem] bg-[#0A192F] shadow-xl border border-[#1e345e]">
          {/* Logo */}
          <div className="border-b border-white/10 bg-transparent px-5 py-5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-white/10 border border-white/20">
                <Image src="/cops-logo.png" alt="COPS Electronics" width={28} height={28} />
              </div>
              <div>
                <h1 className="text-sm font-bold tracking-wide text-white">{"COP'S ELECTRONICS"}</h1>
                <p className="text-[10px] text-slate-400">Sistema de Cotizaciones</p>
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
                        ? "bg-[#4a72ef] font-medium text-white shadow-sm"
                        : "text-slate-300 hover:bg-white/10 hover:text-white"
                    }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>
          </nav>

          {/* Footer */}
          <div className="border-t border-white/10 px-5 py-4">
            <div className="text-[10px] text-slate-400">
              <p className="font-medium text-white">{"Cop's Electronics S.A."}</p>
              <p className="mt-0.5">0212-7934136 / 7940316</p>
              <p>proyectos@copselectronics.com</p>
            </div>
            <div className="mt-3 space-y-2">
              <Button type="button" onClick={goToPortal} className="h-8 w-full justify-start border border-white/10 bg-white/5 text-xs text-white hover:bg-white/15">
                <LayoutGrid className="mr-2 h-3.5 w-3.5" />
                Cambiar modulo
              </Button>
              <Button type="button" onClick={logoutToWeb} className="h-8 w-full justify-start border border-red-500/30 bg-red-500/10 text-xs text-red-400 hover:bg-red-500/20 hover:text-red-300">
                <LogOut className="mr-2 h-3.5 w-3.5" />
                Cerrar sesion
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-[85vw] max-w-72 border-r border-[#1e345e] bg-[#0A192F] shadow-xl">
            <div className="border-b border-white/10 bg-transparent px-5 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-white/10 border border-white/20">
                    <Image src="/cops-logo.png" alt="COPS Electronics" width={26} height={26} />
                  </div>
                  <span className="text-sm font-bold text-white">{"COP'S"}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(false)} className="h-8 w-8 p-0 text-slate-400 hover:bg-white/10 hover:text-white">
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
                        ? "bg-[#4a72ef] font-medium text-white shadow-sm"
                        : "text-slate-300 hover:bg-white/10 hover:text-white"
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

      {mobileAccountMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Cerrar menu de cuenta"
            onClick={() => setMobileAccountMenuOpen(false)}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
          />
          <div className="absolute right-3 top-20 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
            <Button type="button" onClick={goToPortal} className="h-9 w-full justify-start bg-slate-50 text-sm text-slate-700 hover:bg-slate-100">
              <LayoutGrid className="mr-2 h-4 w-4" />
              Cambiar modulo
            </Button>
            <Button type="button" onClick={logoutToWeb} className="mt-2 h-9 w-full justify-start border border-red-200 bg-red-50 text-sm text-red-600 hover:bg-red-100">
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar sesion
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col">
        {/* Mobile Header */}
        <header className={`sticky top-3 z-30 mx-3 mt-3 flex items-center justify-between rounded-2xl border border-slate-200 bg-white/95 backdrop-blur-md px-4 py-3 shadow-md transition-transform duration-300 lg:hidden ${mobileHeaderVisible ? "translate-y-0" : "-translate-y-[130%]"}`}>
          <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(true)} className="h-8 w-8 p-0 text-slate-800 hover:bg-slate-100">
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex min-w-0 items-center gap-2">
            <Image src="/cops-logo.png" alt="COPS Electronics" width={20} height={20} />
            <span className="truncate text-sm font-bold text-slate-900">{"COP'S ELECTRONICS"}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setMobileAccountMenuOpen((v) => !v)
              setMobileMenuOpen(false)
            }}
            className="h-8 w-8 p-0 text-slate-700 hover:bg-slate-100"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
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
            {activeView === "knowledge" && <KnowledgeManager />}
            {activeView === "catalog" && <CatalogManager />}
            {activeView === "history" && (
              <QuotationHistory
                onEdit={handleEditQuotation}
                refreshKey={refreshKey}
                selectMode={selectMode}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

