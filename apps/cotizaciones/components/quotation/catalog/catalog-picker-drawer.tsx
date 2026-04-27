"use client"

import { useEffect, useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { CatalogEmptyState, ProductCard } from "@/components/quotation/catalog"
import { normalizeCatalogCategory } from "@/components/quotation/catalog/catalog-utils"
import { getCatalogDiscountConfig } from "@/lib/quotation-storage"
import type { CatalogDiscountConfig, CatalogItem } from "@/lib/quotation-types"
import { formatCurrency } from "@/lib/quotation-types"
import { cn } from "@/lib/utils"
import { Package2, Plus, Search, Trash2, X } from "lucide-react"
import { toast } from "sonner"

interface CatalogPickerDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  catalog: CatalogItem[]
  existingItems?: string[]
  companyFormat: "sa" | "llc"
  onSelect: (items: Array<{ item: CatalogItem; quantity: number }>) => void
}

function getEffectiveCatalogPrice(item: CatalogItem, config: CatalogDiscountConfig) {
  const matchesScope =
    config.scope === "all" ||
    (config.scope === "category" && normalizeCatalogCategory(item) === config.category) ||
    (config.scope === "subcategory" && (item.subcategory || "General") === config.subcategory)

  const discountedPrice = config.enabled && config.value > 0 && matchesScope
    ? config.mode === "percentage"
      ? item.unitPrice * (1 - config.value / 100)
      : item.unitPrice - config.value
    : item.unitPrice

  return Math.max(0, Number(discountedPrice.toFixed(2)))
}

export function CatalogPickerDrawer({ open, onOpenChange, catalog, existingItems = [], companyFormat, onSelect }: CatalogPickerDrawerProps) {
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedBrand, setSelectedBrand] = useState<string>("all")
  const [pendingSelection, setPendingSelection] = useState<Record<string, { item: CatalogItem; quantity: number }>>({})

  useEffect(() => {
    if (!open) return
    setSearch("")
    setSelectedCategory(null)
    setSelectedBrand("all")
    setPendingSelection({})
  }, [open])

  const existingSet = useMemo(() => new Set(existingItems.map((value) => value.trim().toLowerCase())), [existingItems])
  const discountConfig = useMemo(() => getCatalogDiscountConfig(), [open])

  const brands = useMemo(() => {
    const counts = new Map<string, number>()
    catalog.forEach((item) => {
      const brand = item.brand || "Generico"
      counts.set(brand, (counts.get(brand) || 0) + 1)
    })
    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
  }, [catalog])

  const categories = useMemo(() => {
    const counts = new Map<string, number>()
    catalog
      .filter((item) => selectedBrand === "all" || (item.brand || "Generico") === selectedBrand)
      .forEach((item) => {
        const category = normalizeCatalogCategory(item)
        counts.set(category, (counts.get(category) || 0) + 1)
      })

    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [catalog, selectedBrand])

  const filtered = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return catalog.filter((item) => {
      const brand = item.brand || "Generico"
      const category = normalizeCatalogCategory(item)
      const matchesSearch = !normalizedSearch || [item.code, item.description, brand].some((value) => value.toLowerCase().includes(normalizedSearch))
      const matchesCategory = selectedCategory === null || category === selectedCategory
      const matchesBrand = selectedBrand === "all" || brand === selectedBrand
      return matchesSearch && matchesCategory && matchesBrand
    })
  }, [catalog, search, selectedBrand, selectedCategory])

  const selectedEntries = useMemo(() => Object.values(pendingSelection), [pendingSelection])
  const selectedCount = selectedEntries.length
  const selectedTotal = useMemo(
    () => selectedEntries.reduce((sum, entry) => sum + getEffectiveCatalogPrice(entry.item, discountConfig) * entry.quantity, 0),
    [discountConfig, selectedEntries],
  )

  const toggleItem = (item: CatalogItem, selected: boolean) => {
    const existing = pendingSelection[item.id]
    setPendingSelection((current) => {
      if (!selected) {
        const next = { ...current }
        delete next[item.id]
        return next
      }
      return { ...current, [item.id]: existing || { item, quantity: 1 } }
    })
  }

  const updateQuantity = (id: string, quantity: number) => {
    setPendingSelection((current) => {
      if (!current[id]) return current
      return { ...current, [id]: { ...current[id], quantity: Math.max(1, Number(quantity) || 1) } }
    })
  }

  const addSelected = () => {
    if (selectedEntries.length === 0) {
      toast.error(companyFormat === "llc" ? "Select at least one product" : "Seleccione al menos un producto")
      return
    }

    onSelect(selectedEntries)
    setPendingSelection({})
    toast.success(companyFormat === "llc" ? "Items added to quote" : "Productos agregados a la cotización")
  }

  const clearFilters = () => {
    setSearch("")
    setSelectedCategory(null)
    setSelectedBrand("all")
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="inset-y-0 right-0 left-auto mt-0 h-full w-full max-w-[1200px] rounded-none border-l">
        <DrawerHeader className="border-b border-border px-4 pb-4 text-left sm:px-6">
          <DrawerTitle className="flex items-center gap-2">
            <Package2 className="h-4 w-4 text-primary" />
            {companyFormat === "llc" ? "Select from Catalog" : "Seleccionar del Catálogo"}
          </DrawerTitle>
          <DrawerDescription>
            {companyFormat === "llc"
              ? "Filter products, mark quantities, and add them without closing the drawer."
              : "Filtre productos, ajuste cantidades y agréguelos sin cerrar el drawer."}
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
          <section className="flex min-h-0 flex-1 flex-col border-b border-border lg:border-r lg:border-b-0">
            <div className="space-y-4 border-b border-border px-4 py-4 sm:px-6">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="relative min-w-0 flex-1">
                  <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder={companyFormat === "llc" ? "Search products..." : "Buscar productos..."}
                    className="pr-10 pl-10"
                  />
                  {search ? (
                    <Button type="button" variant="ghost" size="icon" onClick={() => setSearch("")} className="absolute top-1/2 right-1 h-8 w-8 -translate-y-1/2">
                      <X className="h-4 w-4" />
                    </Button>
                  ) : null}
                </div>

                <Badge variant="secondary" className="w-fit">{filtered.length} resultados</Badge>
              </div>

              <div className="space-y-3">
                <FilterPills
                  title={companyFormat === "llc" ? "Brands" : "Marcas"}
                  allLabel={companyFormat === "llc" ? `All brands (${catalog.length})` : `Todas las marcas (${catalog.length})`}
                  selectedKey={selectedBrand}
                  allKey="all"
                  items={brands}
                  onChange={setSelectedBrand}
                />

                <FilterPills
                  title={companyFormat === "llc" ? "Categories" : "Categorías"}
                  allLabel={companyFormat === "llc" ? "All" : "Todas"}
                  selectedKey={selectedCategory ?? "all"}
                  allKey="all"
                  items={categories}
                  onChange={(value) => setSelectedCategory(value === "all" ? null : value)}
                />
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">
              {filtered.length === 0 ? (
                <CatalogEmptyState hasFilters={Boolean(search || selectedCategory || selectedBrand !== "all")} onClearFilters={clearFilters} />
              ) : (
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 2xl:grid-cols-3">
                  {filtered.map((item, index) => {
                    const isExisting = existingSet.has(item.id.toLowerCase()) || existingSet.has(item.code.trim().toLowerCase())
                    const isSelected = Boolean(pendingSelection[item.id])
                    const effectivePrice = getEffectiveCatalogPrice(item, discountConfig)

                    return (
                      <ProductCard
                        key={item.id}
                        item={item}
                        index={index}
                        isSelected={isSelected || isExisting}
                        selectionDisabled={isExisting}
                        hideHoverActions
                        onSelect={(selected) => toggleItem(item, selected)}
                        onQuickView={() => toggleItem(item, !isSelected)}
                        onEdit={() => toggleItem(item, !isSelected)}
                        onDelete={() => toggleItem(item, false)}
                        effectivePrice={effectivePrice}
                        footer={
                          <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-foreground">{isExisting ? "Ya agregado" : isSelected ? "Seleccionado" : "Disponible"}</p>
                              <p className="text-[11px] text-muted-foreground">{item.unit}</p>
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                              <Input
                                type="number"
                                min={1}
                                value={pendingSelection[item.id]?.quantity ?? 1}
                                onChange={(event) => {
                                  if (!pendingSelection[item.id]) toggleItem(item, true)
                                  updateQuantity(item.id, Number(event.target.value) || 1)
                                }}
                                disabled={isExisting}
                                className="h-8 w-16 text-center"
                              />
                              <Button type="button" variant={isSelected ? "secondary" : "outline"} size="sm" disabled={isExisting} onClick={() => toggleItem(item, !isSelected)} className="whitespace-nowrap">
                                {isSelected ? "Quitar" : "Seleccionar"}
                              </Button>
                            </div>
                          </div>
                        }
                      />
                    )
                  })}
                </div>
              )}
            </div>
          </section>

          <aside className="flex w-full shrink-0 flex-col border-t border-border bg-muted/20 lg:w-[360px] lg:border-t-0">
            <div className="border-b border-border px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{companyFormat === "llc" ? "Selected Items" : "Items seleccionados"}</h3>
                  <p className="text-xs text-muted-foreground">{selectedCount} items</p>
                </div>
                {selectedCount > 0 ? (
                  <Button type="button" variant="ghost" size="sm" onClick={() => setPendingSelection({})}>
                    Limpiar
                  </Button>
                ) : null}
              </div>
            </div>

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4 sm:px-6">
              {selectedEntries.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
                  {companyFormat === "llc" ? "Select products from the left panel." : "Seleccione productos en el panel izquierdo."}
                </div>
              ) : (
                selectedEntries.map(({ item, quantity }) => {
                  const price = getEffectiveCatalogPrice(item, discountConfig)
                  return (
                    <div key={item.id} className="rounded-xl border border-border bg-card p-3 shadow-sm">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate font-mono text-xs font-semibold text-primary">{item.code}</p>
                          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{item.description}</p>
                        </div>
                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => toggleItem(item, false)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Cant.</span>
                          <Input type="number" min={1} value={quantity} onChange={(event) => updateQuantity(item.id, Number(event.target.value) || 1)} className="h-8 w-20 text-center" />
                        </div>
                        <div className="text-right">
                          <p className="font-mono text-xs text-muted-foreground">${formatCurrency(price)} c/u</p>
                          <p className="font-mono text-sm font-semibold text-foreground">${formatCurrency(price * quantity)}</p>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            <DrawerFooter className="border-t border-border bg-background/95 px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total seleccionado</span>
                <span className="font-mono font-semibold text-foreground">${formatCurrency(selectedTotal)}</span>
              </div>
              <Button type="button" onClick={addSelected} disabled={selectedCount === 0}>
                <Plus className="h-4 w-4" />
                {companyFormat === "llc" ? "Add selected" : "Agregar seleccionados"}
              </Button>
            </DrawerFooter>
          </aside>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

interface FilterPillsProps {
  title: string
  allLabel: string
  selectedKey: string
  allKey: string
  items: Array<{ name: string; count: number }>
  onChange: (value: string) => void
}

function FilterPills({ title, allLabel, selectedKey, allKey, items, onChange }: FilterPillsProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onChange(allKey)}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium transition-colors",
            selectedKey === allKey ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80",
          )}
        >
          {allLabel}
        </button>
        {items.map((item) => (
          <button
            key={item.name}
            type="button"
            onClick={() => onChange(item.name)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              selectedKey === item.name ? "bg-primary text-primary-foreground" : "bg-muted/60 text-muted-foreground hover:bg-muted",
            )}
          >
            {item.name} ({item.count})
          </button>
        ))}
      </div>
    </div>
  )
}
