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
  LayoutGrid,
  LogOut,
  MoreVertical,
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
  const [mobileAccountMenuOpen, setMobileAccountMenuOpen] = useState(false)
  const [mobileHeaderVisible, setMobileHeaderVisible] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)
  const [selectMode, setSelectMode] = useState(false)
  const lastScrollRef = useRef(0)
  const webAppUrl = (process.env.NEXT_PUBLIC_PLATFORM_WEB_URL || "https://cops-platform-web.vercel.app").replace(/\/$/, "")

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
    window.location.href = `${webAppUrl}/logout`
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
        <div className="glass-card sticky top-4 flex h-[calc(100vh-2rem)] flex-col overflow-hidden border border-white/24 bg-white/[0.14] shadow-[0_18px_44px_rgba(7,20,52,0.34)]">
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
            <div className="mt-3 space-y-2">
              <Button type="button" onClick={goToPortal} className="h-8 w-full justify-start bg-white/12 text-xs text-white hover:bg-white/18">
                <LayoutGrid className="mr-2 h-3.5 w-3.5" />
                Cambiar modulo
              </Button>
              <Button type="button" onClick={logoutToWeb} className="h-8 w-full justify-start border border-red-300/40 bg-red-500/25 text-xs text-red-100 hover:bg-red-500/38">
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
          <div className="absolute inset-0 bg-[#102a58]/54 backdrop-blur-[2px]" onClick={() => setMobileMenuOpen(false)} />
          <aside className="glass absolute left-0 top-0 h-full w-[85vw] max-w-72 border-r border-white/24 bg-white/[0.16] shadow-lg">
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

      {mobileAccountMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Cerrar menu de cuenta"
            onClick={() => setMobileAccountMenuOpen(false)}
            className="absolute inset-0 bg-[#102a58]/54 backdrop-blur-[2px]"
          />
          <div className="glass absolute right-3 top-20 w-56 rounded-2xl border border-white/24 bg-white/[0.16] p-2 shadow-lg">
            <Button type="button" onClick={goToPortal} className="h-9 w-full justify-start bg-white/12 text-sm text-white hover:bg-white/18">
              <LayoutGrid className="mr-2 h-4 w-4" />
              Cambiar modulo
            </Button>
            <Button type="button" onClick={logoutToWeb} className="mt-2 h-9 w-full justify-start border border-red-300/40 bg-red-500/25 text-sm text-red-100 hover:bg-red-500/38">
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar sesion
            </Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Mobile Header */}
        <header className={`glass sticky top-3 z-30 mx-3 mt-3 flex items-center justify-between rounded-2xl border border-white/24 bg-white/[0.16] px-4 py-3 transition-transform duration-300 lg:hidden ${mobileHeaderVisible ? "translate-y-0" : "-translate-y-[130%]"}`}>
          <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(true)} className="h-8 w-8 p-0 text-white">
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex min-w-0 items-center gap-2">
            <Image src="/cops-logo.png" alt="COPS Electronics" width={20} height={20} />
            <span className="truncate text-sm font-bold text-white">{"COP'S ELECTRONICS"}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setMobileAccountMenuOpen((v) => !v)
              setMobileMenuOpen(false)
            }}
            className="h-8 w-8 p-0 text-white"
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




