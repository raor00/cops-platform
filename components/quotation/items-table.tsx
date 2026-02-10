"use client"

import React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { QuotationItem, CatalogItem } from "@/lib/quotation-types"
import { CATALOG_CATEGORIES, formatCurrency } from "@/lib/quotation-types"
import { getCatalog, getCatalogDiscountConfig } from "@/lib/quotation-storage"
import { Plus, Trash2, Search, ChevronDown, ChevronUp } from "lucide-react"

interface ItemsSectionProps {
  title: string
  icon: React.ReactNode
  items: QuotationItem[]
  onItemsChange: (items: QuotationItem[]) => void
  catalogFilter?: string
  showMaterialsFilter?: boolean
  companyFormat?: "sa" | "llc"
}

export function ItemsSection({ title, icon, items, onItemsChange, catalogFilter, showMaterialsFilter, companyFormat = "sa" }: ItemsSectionProps) {
  const [catalogOpen, setCatalogOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [brandFilter, setBrandFilter] = useState<string>("all")
  const [catFilter, setCatFilter] = useState<string>("all")
  const [subcatFilter, setSubcatFilter] = useState<string>("all")
  const [variantFilter, setVariantFilter] = useState<string>("all")
  const [catalog, setCatalog] = useState<CatalogItem[]>([])
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    setCatalog(getCatalog())
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

  const filteredCatalog = catalog.filter((item) => {
    const matchSearch = !search || item.code.toLowerCase().includes(search.toLowerCase()) || item.description.toLowerCase().includes(search.toLowerCase())
    const matchBrand = brandFilter === "all" || (item.brand || "General") === brandFilter
    let matchCat = true
    if (catalogFilter) {
      matchCat = catalogFilter === "Materiales" ? item.category === "Materiales" : item.category !== "Materiales"
    }
    if (catFilter !== "all") {
      matchCat = item.category === catFilter
    }
    const matchSub = subcatFilter === "all" || (item.subcategory || "General") === subcatFilter
    const matchVariant = variantFilter === "all" || (item.variant || "") === variantFilter
    return matchSearch && matchBrand && matchCat && matchSub && matchVariant
  })

  const brands = Array.from(new Set(catalog.map((item) => item.brand || "General"))).sort()

  const subcategories = Array.from(
    new Set(
      catalog
        .filter((item) => {
          const matchBrand = brandFilter === "all" || (item.brand || "General") === brandFilter
          const matchCat = catFilter === "all" ? true : item.category === catFilter
          return matchBrand && matchCat
        })
        .map((item) => item.subcategory || "General"),
    ),
  ).sort()

  const variants = Array.from(
    new Set(
      catalog
        .filter((item) => {
          const matchBrand = brandFilter === "all" || (item.brand || "General") === brandFilter
          const matchCat = catFilter === "all" ? true : item.category === catFilter
          const matchSub = subcatFilter === "all" ? true : (item.subcategory || "General") === subcatFilter
          return matchBrand && matchCat && matchSub
        })
        .map((item) => item.variant || "")
        .filter(Boolean),
    ),
  ).sort()

  const applicableCategories = catalogFilter === "Materiales"
    ? ["Materiales"]
    : Array.from(new Set([...CATALOG_CATEGORIES, ...catalog.map((item) => item.category)])).filter((c) => c !== "Materiales")

  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0)

  return (
    <div className="rounded-lg border border-border bg-card">
      {/* Section Header */}
      <div className="flex flex-col gap-3 border-b border-border px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
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
        <div className="flex flex-wrap items-center gap-2">
          {items.length > 0 && (
            <span className="text-xs font-medium text-muted-foreground">
              {companyFormat === "llc" ? "Subtotal" : "Subtotal"}: <span className="font-mono text-foreground">${formatCurrency(subtotal)}</span>
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
            className="h-7 bg-[#1a5276] text-xs text-white hover:bg-[#0e3a57]"
          >
            <Plus className="mr-1 h-3 w-3" />
            {companyFormat === "llc" ? "Add" : "Agregar"}
          </Button>
        </div>
      </div>

      {/* Mobile Cards */}
      {!collapsed && (
        <div className="space-y-3 p-4 sm:hidden">
          {items.map((item) => (
            <div key={item.id} className="rounded-md border border-border bg-card p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Item</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(item.id)}
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="mt-3 grid gap-3">
                <div className="grid gap-1.5">
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{companyFormat === "llc" ? "Quantity" : "Cantidad"}</span>
                  <Input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onFocus={(e) => e.currentTarget.select()}
                    onChange={(e) => updateItem(item.id, "quantity", e.target.value === "" ? 0 : Number(e.target.value))}
                    className="h-9 border-border bg-card text-center text-sm text-foreground"
                  />
                </div>
                <div className="grid gap-1.5">
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{companyFormat === "llc" ? "Code" : "Codigo"}</span>
                  <Input
                    value={item.code}
                    onChange={(e) => updateItem(item.id, "code", e.target.value)}
                    placeholder={companyFormat === "llc" ? "CODE-001" : "COD-001"}
                    className="h-9 border-border bg-card font-mono text-sm text-foreground"
                  />
                </div>
                <div className="grid gap-1.5">
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{companyFormat === "llc" ? "Description" : "Descripcion"}</span>
                  <Textarea
                    value={item.description}
                    onChange={(e) => updateItem(item.id, "description", e.target.value)}
                    placeholder={companyFormat === "llc" ? "Product description" : "Descripcion del producto"}
                    rows={2}
                    className="min-h-16 resize-none border-border bg-card text-sm text-foreground"
                  />
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="grid gap-1.5">
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{companyFormat === "llc" ? "Unit Price" : "Precio Unitario"}</span>
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      value={item.unitPrice}
                      onFocus={(e) => e.currentTarget.select()}
                      onChange={(e) => updateItem(item.id, "unitPrice", e.target.value === "" ? 0 : Number(e.target.value))}
                      className="h-9 border-border bg-card text-right text-sm text-foreground"
                    />
                  </div>
                  <div className="grid gap-1.5">
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Total</span>
                    <div className="flex h-9 items-center justify-end rounded-md border border-border bg-muted/40 px-3 font-mono text-sm font-semibold text-foreground">
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
                    <Input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onFocus={(e) => e.currentTarget.select()}
                      onChange={(e) => updateItem(item.id, "quantity", e.target.value === "" ? 0 : Number(e.target.value))}
                      className="h-8 w-14 border-border bg-card text-center text-xs text-foreground"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      value={item.code}
                      onChange={(e) => updateItem(item.id, "code", e.target.value)}
                      placeholder={companyFormat === "llc" ? "CODE-001" : "COD-001"}
                      className="h-8 w-36 border-border bg-card font-mono text-xs text-foreground"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Textarea
                      value={item.description}
                      onChange={(e) => updateItem(item.id, "description", e.target.value)}
                      placeholder={companyFormat === "llc" ? "Product description" : "Descripcion del producto"}
                      rows={1}
                      className="min-h-8 resize-none border-border bg-card text-xs text-foreground"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      value={item.unitPrice}
                      onFocus={(e) => e.currentTarget.select()}
                      onChange={(e) => updateItem(item.id, "unitPrice", e.target.value === "" ? 0 : Number(e.target.value))}
                      className="h-8 w-24 border-border bg-card text-right text-xs text-foreground"
                    />
                  </td>
                  <td className="px-3 py-2 text-right">
                    <span className="font-mono text-xs font-semibold text-foreground">${formatCurrency(item.totalPrice)}</span>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      className="h-7 w-7 p-0 text-muted-foreground opacity-0 hover:text-destructive group-hover:opacity-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-muted-foreground">
                    Sin items. Use "Agregar" o seleccione del "Catalogo".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Catalog Dialog */}
      <Dialog open={catalogOpen} onOpenChange={setCatalogOpen}>
        <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto bg-card text-foreground">
          <DialogHeader>
            <DialogTitle className="font-heading text-foreground">
              {companyFormat === "llc" ? "Select from Catalog" : "Seleccionar del Catalogo"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={companyFormat === "llc" ? "Search by code or description..." : "Buscar por codigo o descripcion..."}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border-border bg-card pl-10 text-foreground"
              />
            </div>
            {!catalogFilter && (
              <Select value={brandFilter} onValueChange={(value) => { setBrandFilter(value); setCatFilter("all"); setSubcatFilter("all"); setVariantFilter("all") }}>
                <SelectTrigger className="w-40 border-border bg-card text-foreground">
                  <SelectValue placeholder={companyFormat === "llc" ? "Brand" : "Marca"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{companyFormat === "llc" ? "All brands" : "Todas las marcas"}</SelectItem>
                  {brands.map((brand) => (
                    <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {!catalogFilter && (
              <Select value={catFilter} onValueChange={(value) => { setCatFilter(value); setSubcatFilter("all") }}>
                <SelectTrigger className="w-44 border-border bg-card text-foreground">
                  <SelectValue placeholder={companyFormat === "llc" ? "Category" : "Categoria"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{companyFormat === "llc" ? "All" : "Todas"}</SelectItem>
                  {CATALOG_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {showMaterialsFilter && (
              <Select value={catFilter} onValueChange={(value) => { setCatFilter(value); setSubcatFilter("all") }}>
                <SelectTrigger className="w-44 border-border bg-card text-foreground">
                  <SelectValue placeholder={companyFormat === "llc" ? "Category" : "Categoria"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{companyFormat === "llc" ? "All" : "Todas"}</SelectItem>
                  {applicableCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Select value={subcatFilter} onValueChange={setSubcatFilter}>
              <SelectTrigger className="w-44 border-border bg-card text-foreground">
                <SelectValue placeholder={companyFormat === "llc" ? "Subcategory" : "Subcategoria"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{companyFormat === "llc" ? "All subcategories" : "Todas las subcategorias"}</SelectItem>
                {subcategories.map((subcat) => (
                  <SelectItem key={subcat} value={subcat}>{subcat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={variantFilter} onValueChange={setVariantFilter}>
              <SelectTrigger className="w-40 border-border bg-card text-foreground">
                <SelectValue placeholder={companyFormat === "llc" ? "Variant" : "Variante"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{companyFormat === "llc" ? "All variants" : "Todas las variantes"}</SelectItem>
                {variants.map((variant) => (
                  <SelectItem key={variant} value={variant}>{variant}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            {filteredCatalog.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => addFromCatalog(preset)}
                className="flex w-full items-start justify-between gap-4 rounded-lg border border-border p-3 text-left transition-colors hover:border-[#1a5276] hover:bg-muted/50"
              >
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md border border-border bg-muted/30">
                    {preset.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={preset.imageUrl}
                        alt={preset.code}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                        Sin imagen
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                  <p className="font-mono text-xs font-semibold text-[#1a5276]">{preset.code}</p>
                  <p className="mt-0.5 text-sm text-foreground">{preset.description}</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    <span className="inline-block rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">{preset.brand || "General"}</span>
                    <span className="inline-block rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">{preset.category}</span>
                    <span className="inline-block rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">{preset.subcategory || "General"}</span>
                    {(preset.variant || "").trim() !== "" && (
                      <span className="inline-block rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">{preset.variant}</span>
                    )}
                  </div>
                </div>
                </div>
                <p className="shrink-0 font-mono text-sm font-semibold text-foreground">${formatCurrency(preset.unitPrice)}</p>
              </button>
            ))}
            {filteredCatalog.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                {companyFormat === "llc" ? "No products found" : "No se encontraron productos"}
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

