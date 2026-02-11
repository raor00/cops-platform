"use client"

import React from "react"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { QuotationItem, CatalogItem } from "@/lib/quotation-types"
import { formatCurrency } from "@/lib/quotation-types"
import { getCatalog, getCatalogDiscountConfig } from "@/lib/quotation-storage"
import { normalizeCategory } from "@/components/quotation/catalog-manager"
import { Plus, Trash2, Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Package, ShoppingCart, X } from "lucide-react"
import { cn } from "@/lib/utils"

const PICKER_PAGE_SIZE = 20

interface ItemsSectionProps {
  title: string
  icon: React.ReactNode
  items: QuotationItem[]
  onItemsChange: (items: QuotationItem[]) => void
  catalogFilter?: string
  showMaterialsFilter?: boolean
  companyFormat?: "sa" | "llc"
}

export function ItemsSection({ title, icon, items, onItemsChange, catalogFilter, companyFormat = "sa" }: ItemsSectionProps) {
  const [catalogOpen, setCatalogOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [brandFilter, setBrandFilter] = useState<string>("todos")
  const [catFilter, setCatFilter] = useState<string>("all")
  const [catalog, setCatalog] = useState<CatalogItem[]>([])
  const [collapsed, setCollapsed] = useState(false)
  const [pickerPage, setPickerPage] = useState(1)

  useEffect(() => {
    if (catalogOpen) {
      setCatalog(getCatalog())
      setSearch("")
      setBrandFilter("todos")
      setCatFilter("all")
      setPickerPage(1)
    }
  }, [catalogOpen])

  const addEmpty = () => {
    const newItem: QuotationItem = {
      id: crypto.randomUUID(),
      quantity: 1,
      code: "",
      description: "",
      unitPrice: 0,
      totalPrice: 0,
    }
    onItemsChange([...items, newItem])
  }

  const addFromCatalog = (preset: CatalogItem) => {
    const config = getCatalogDiscountConfig()
    const matchesScope =
      config.scope === "all" ||
      (config.scope === "category" && preset.category === config.category) ||
      (config.scope === "subcategory" && (preset.subcategory || "General") === config.subcategory)

    const discountedPrice = config.enabled && config.value > 0 && matchesScope
      ? (config.mode === "percentage"
        ? preset.unitPrice * (1 - config.value / 100)
        : preset.unitPrice - config.value)
      : preset.unitPrice

    const finalPrice = Math.max(0, Number(discountedPrice.toFixed(2)))

    const newItem: QuotationItem = {
      id: crypto.randomUUID(),
      quantity: 1,
      code: preset.code,
      description: preset.description,
      unitPrice: finalPrice,
      totalPrice: finalPrice,
      brand: preset.brand || "General",
      category: preset.category,
      subcategory: preset.subcategory || "General",
      variant: preset.variant || "",
    }
    onItemsChange([...items, newItem])
    setCatalogOpen(false)
  }

  const updateItem = (id: string, field: keyof QuotationItem, value: string | number) => {
    onItemsChange(
      items.map((item) => {
        if (item.id !== id) return item
        const updated = { ...item, [field]: value }
        if (field === "quantity" || field === "unitPrice") {
          const qty = field === "quantity" ? Number(value) : item.quantity
          const price = field === "unitPrice" ? Number(value) : item.unitPrice
          updated.totalPrice = qty * price
        }
        return updated
      })
    )
  }

  const removeItem = (id: string) => {
    onItemsChange(items.filter((item) => item.id !== id))
  }

  const baseCatalog = useMemo(() => {
    if (!catalogFilter) return catalog
    return catalogFilter === "Materiales"
      ? catalog.filter((item) => item.category === "Materiales")
      : catalog.filter((item) => item.category !== "Materiales")
  }, [catalog, catalogFilter])

  const pickerCategories = useMemo(() => {
    const cats = new Map<string, number>()
    const brandItems = brandFilter === "ablerex"
      ? baseCatalog.filter((item) => (item.brand || "General").toLowerCase() === "ablerex")
      : baseCatalog

    brandItems.forEach((item) => {
      const nc = normalizeCategory(item)
      cats.set(nc, (cats.get(nc) || 0) + 1)
    })
    return Array.from(cats.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  }, [baseCatalog, brandFilter])

  const filteredCatalog = useMemo(() => {
    return baseCatalog.filter((item) => {
      const matchSearch = !search || item.code.toLowerCase().includes(search.toLowerCase()) || item.description.toLowerCase().includes(search.toLowerCase())
      const matchBrand = brandFilter === "todos" || (brandFilter === "ablerex" && (item.brand || "General").toLowerCase() === "ablerex") || (brandFilter !== "todos" && brandFilter !== "ablerex" && (item.brand || "General") === brandFilter)
      const matchCat = catFilter === "all" || normalizeCategory(item) === catFilter
      return matchSearch && matchBrand && matchCat
    })
  }, [baseCatalog, search, brandFilter, catFilter])

  const pickerTotalPages = Math.max(1, Math.ceil(filteredCatalog.length / PICKER_PAGE_SIZE))
  const pickerSafePage = Math.min(pickerPage, pickerTotalPages)
  const paginatedCatalog = useMemo(() => {
    const start = (pickerSafePage - 1) * PICKER_PAGE_SIZE
    return filteredCatalog.slice(start, start + PICKER_PAGE_SIZE)
  }, [filteredCatalog, pickerSafePage])

  const ablerexCount = useMemo(() => baseCatalog.filter((i) => (i.brand || "General").toLowerCase() === "ablerex").length, [baseCatalog])

  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0)

  return (
    <div className="rounded-lg border border-border bg-card">
      {/* Section Header */}
      <div className="flex flex-col gap-2 border-b border-border px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-3">
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-2 text-foreground"
        >
          {icon}
          <span className="font-heading text-sm font-semibold">{title}</span>
          <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
            {items.length}
          </span>
          {collapsed ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronUp className="h-4 w-4 text-muted-foreground" />}
        </button>
        <div className="flex items-center gap-2">
          {items.length > 0 && (
            <span className="text-xs font-medium text-muted-foreground">
              Subtotal: <span className="font-mono text-foreground">${formatCurrency(subtotal)}</span>
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCatalogOpen(true)}
            className="h-7 border-border bg-transparent text-xs text-muted-foreground hover:bg-muted"
          >
            <Search className="mr-1 h-3 w-3" />
            {companyFormat === "llc" ? "Catalog" : "Catalogo"}
          </Button>
          <Button
            size="sm"
            onClick={addEmpty}
            className="h-7 bg-[#4a72ef] text-xs text-white hover:bg-[#2f54e0]"
          >
            <Plus className="mr-1 h-3 w-3" />
            {companyFormat === "llc" ? "Add" : "Agregar"}
          </Button>
        </div>
      </div>

      {/* Mobile Cards */}
      {!collapsed && (
        <div className="space-y-3 p-3 sm:hidden">
          {items.map((item) => (
            <div key={item.id} className="rounded-md border border-border bg-card p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Item</span>
                <Button variant="ghost" size="sm" onClick={() => removeItem(item.id)} className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="mt-2 grid gap-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{companyFormat === "llc" ? "Qty" : "Cant."}</span>
                    <Input type="number" min={1} value={item.quantity} onFocus={(e) => e.currentTarget.select()} onChange={(e) => updateItem(item.id, "quantity", e.target.value === "" ? 0 : Number(e.target.value))} className="h-8 border-border bg-card text-center text-sm text-foreground" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{companyFormat === "llc" ? "Code" : "Codigo"}</span>
                    <Input value={item.code} onChange={(e) => updateItem(item.id, "code", e.target.value)} placeholder="COD-001" className="h-8 border-border bg-card font-mono text-sm text-foreground" />
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{companyFormat === "llc" ? "Description" : "Descripcion"}</span>
                  <Textarea value={item.description} onChange={(e) => updateItem(item.id, "description", e.target.value)} placeholder="Descripcion" rows={2} className="min-h-14 resize-none border-border bg-card text-sm text-foreground" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{companyFormat === "llc" ? "Unit $" : "P. Unit."}</span>
                    <Input type="number" min={0} step={0.01} value={item.unitPrice} onFocus={(e) => e.currentTarget.select()} onChange={(e) => updateItem(item.id, "unitPrice", e.target.value === "" ? 0 : Number(e.target.value))} className="h-8 border-border bg-card text-right text-sm text-foreground" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Total</span>
                    <div className="flex h-8 items-center justify-end rounded-md border border-border bg-muted/40 px-2 font-mono text-sm font-semibold text-foreground">
                      ${formatCurrency(item.totalPrice)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="rounded-md border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
              {companyFormat === "llc" ? 'No items. Use "Add" or pick from "Catalog".' : 'Sin items. Use "Agregar" o seleccione del "Catalogo".'}
            </div>
          )}
        </div>
      )}

      {/* Table */}
      {!collapsed && (
        <div className="hidden overflow-x-auto sm:block">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground" style={{ width: 64 }}>{companyFormat === "llc" ? "Qty" : "Cant."}</th>
                <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground" style={{ width: 150 }}>{companyFormat === "llc" ? "Code" : "Codigo"}</th>
                <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{companyFormat === "llc" ? "Description" : "Descripcion"}</th>
                <th className="px-3 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground" style={{ width: 110 }}>{companyFormat === "llc" ? "Unit Price" : "P. Unit."}</th>
                <th className="px-3 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground" style={{ width: 110 }}>Total</th>
                <th className="px-3 py-2.5" style={{ width: 40 }}><span className="sr-only">Acciones</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((item) => (
                <tr key={item.id} className="group transition-colors hover:bg-muted/30">
                  <td className="px-3 py-2">
                    <Input type="number" min={1} value={item.quantity} onFocus={(e) => e.currentTarget.select()} onChange={(e) => updateItem(item.id, "quantity", e.target.value === "" ? 0 : Number(e.target.value))} className="h-8 w-14 border-border bg-card text-center text-xs text-foreground" />
                  </td>
                  <td className="px-3 py-2">
                    <Input value={item.code} onChange={(e) => updateItem(item.id, "code", e.target.value)} placeholder="COD-001" className="h-8 w-36 border-border bg-card font-mono text-xs text-foreground" />
                  </td>
                  <td className="px-3 py-2">
                    <Textarea value={item.description} onChange={(e) => updateItem(item.id, "description", e.target.value)} placeholder="Descripcion del producto" rows={1} className="min-h-8 resize-none border-border bg-card text-xs text-foreground" />
                  </td>
                  <td className="px-3 py-2">
                    <Input type="number" min={0} step={0.01} value={item.unitPrice} onFocus={(e) => e.currentTarget.select()} onChange={(e) => updateItem(item.id, "unitPrice", e.target.value === "" ? 0 : Number(e.target.value))} className="h-8 w-24 border-border bg-card text-right text-xs text-foreground" />
                  </td>
                  <td className="px-3 py-2 text-right">
                    <span className="font-mono text-xs font-semibold text-foreground">${formatCurrency(item.totalPrice)}</span>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <Button variant="ghost" size="sm" onClick={() => removeItem(item.id)} className="h-7 w-7 p-0 text-muted-foreground opacity-0 hover:text-destructive group-hover:opacity-100">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-muted-foreground">
                    {companyFormat === "llc" ? 'No items added yet.' : 'Sin items. Use "Agregar" o seleccione del "Catalogo".'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Catalog Picker Dialog */}
      <Dialog open={catalogOpen} onOpenChange={setCatalogOpen}>
        <DialogContent className="flex max-h-[90vh] w-[calc(100vw-1rem)] max-w-3xl flex-col overflow-hidden bg-card p-0 text-foreground sm:w-[calc(100vw-2rem)]">
          {/* Fixed header */}
          <div className="shrink-0 space-y-3 border-b border-border p-3 sm:p-4">
            <DialogHeader className="p-0">
              <DialogTitle className="flex items-center gap-2 font-heading text-base text-foreground">
                <ShoppingCart className="h-4 w-4 text-[#4a72ef]" />
                {companyFormat === "llc" ? "Select from Catalog" : "Seleccionar del Catalogo"}
              </DialogTitle>
            </DialogHeader>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={companyFormat === "llc" ? "Search products..." : "Buscar productos..."}
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPickerPage(1) }}
                className="h-9 pl-10 pr-8 text-sm"
              />
              {search && (
                <button onClick={() => { setSearch(""); setPickerPage(1) }} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Brand pills */}
            <div className="flex gap-1.5">
              {(["todos", "ablerex"] as const).map((b) => (
                <button
                  key={b}
                  onClick={() => { setBrandFilter(b); setCatFilter("all"); setPickerPage(1) }}
                  className={cn(
                    "rounded-full px-3 py-1 text-[11px] font-medium transition-all duration-150",
                    brandFilter === b
                      ? "bg-[#4a72ef] text-white shadow-sm"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {b === "todos" ? `Todos (${baseCatalog.length})` : `Ablerex (${ablerexCount})`}
                </button>
              ))}
            </div>

            {/* Category chips */}
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => { setCatFilter("all"); setPickerPage(1) }}
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-[10px] font-medium transition-all duration-150",
                  catFilter === "all"
                    ? "bg-[#4a72ef] text-white"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted"
                )}
              >
                Todas
              </button>
              {pickerCategories.map(([cat, count]) => (
                <button
                  key={cat}
                  onClick={() => { setCatFilter(cat); setPickerPage(1) }}
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-[10px] font-medium transition-all duration-150",
                    catFilter === cat
                      ? "bg-[#4a72ef] text-white"
                      : "bg-muted/60 text-muted-foreground hover:bg-muted"
                  )}
                >
                  {cat} ({count})
                </button>
              ))}
            </div>

            {/* Result count */}
            <p className="text-[11px] text-muted-foreground">
              {filteredCatalog.length} {companyFormat === "llc" ? "products" : "productos"}
              {pickerTotalPages > 1 && `  - pag. ${pickerSafePage}/${pickerTotalPages}`}
            </p>
          </div>

          {/* Scrollable product list */}
          <div className="min-h-0 flex-1 overflow-y-auto px-3 py-2 sm:px-4">
            <div className="space-y-1.5">
              {paginatedCatalog.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => addFromCatalog(preset)}
                  className="flex w-full items-start gap-3 rounded-lg border border-border p-2.5 text-left transition-all duration-150 hover:border-[#4a72ef]/50 hover:bg-muted/40 hover:shadow-sm active:scale-[0.99] sm:p-3"
                >
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md border border-border bg-gradient-to-b from-muted/20 to-muted/40 sm:h-14 sm:w-14">
                    {preset.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={preset.imageUrl} alt={preset.code} className="h-full w-full object-contain object-center p-1" loading="lazy" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Package className="h-5 w-5 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="min-w-0 truncate font-mono text-xs font-semibold text-[#4a72ef]">{preset.code}</p>
                      <p className="shrink-0 font-mono text-sm font-bold text-foreground">${formatCurrency(preset.unitPrice)}</p>
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-foreground/80">{preset.description}</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      <Badge variant="secondary" className="px-1.5 py-0 text-[9px]">{normalizeCategory(preset)}</Badge>
                      {(preset.brand || "General").toLowerCase() === "ablerex" && (
                        <span className="rounded bg-blue-50 px-1.5 py-0 text-[9px] font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">Ablerex</span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
              {filteredCatalog.length === 0 && (
                <div className="py-10 text-center">
                  <Package className="mx-auto h-8 w-8 text-muted-foreground/30" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    {companyFormat === "llc" ? "No products found" : "No se encontraron productos"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Fixed pagination footer */}
          {pickerTotalPages > 1 && (
            <div className="shrink-0 border-t border-border px-3 py-2 sm:px-4">
              <div className="flex items-center justify-center gap-1.5">
                <Button variant="outline" size="sm" onClick={() => setPickerPage((p) => Math.max(1, p - 1))} disabled={pickerSafePage <= 1} className="h-7 w-7 p-0">
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                {Array.from({ length: pickerTotalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === pickerTotalPages || Math.abs(p - pickerSafePage) <= 1)
                  .reduce<(number | "dots")[]>((acc, p, i, arr) => {
                    if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("dots")
                    acc.push(p)
                    return acc
                  }, [])
                  .map((p, i) =>
                    p === "dots" ? (
                      <span key={`dots-${i}`} className="px-0.5 text-xs text-muted-foreground">...</span>
                    ) : (
                      <Button key={p} variant={p === pickerSafePage ? "default" : "outline"} size="sm" onClick={() => setPickerPage(p)} className={cn("h-7 w-7 p-0 text-[11px]", p === pickerSafePage && "bg-[#4a72ef] text-white")}>
                        {p}
                      </Button>
                    )
                  )}
                <Button variant="outline" size="sm" onClick={() => setPickerPage((p) => Math.min(pickerTotalPages, p + 1))} disabled={pickerSafePage >= pickerTotalPages} className="h-7 w-7 p-0">
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}



