"use client"

import type { ReactNode } from "react"
import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { CatalogPickerDrawer } from "@/components/quotation/catalog/catalog-picker-drawer"
import { normalizeCatalogCategory } from "@/components/quotation/catalog/catalog-utils"
import { getCatalog, getCatalogDiscountConfig } from "@/lib/quotation-storage"
import type { CatalogItem, QuotationItem } from "@/lib/quotation-types"
import { formatCurrency } from "@/lib/quotation-types"
import { ChevronDown, ChevronUp, Plus, Search, Trash2 } from "lucide-react"

interface ItemsSectionProps {
  title: string
  icon: ReactNode
  items: QuotationItem[]
  onItemsChange: (items: QuotationItem[]) => void
  catalogFilter?: string
  showMaterialsFilter?: boolean
  companyFormat?: "sa" | "llc"
}

function getEffectiveCatalogPrice(item: CatalogItem, config: ReturnType<typeof getCatalogDiscountConfig>) {
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

export function ItemsSection({ title, icon, items, onItemsChange, catalogFilter, companyFormat = "sa" }: ItemsSectionProps) {
  const [catalogOpen, setCatalogOpen] = useState(false)
  const [catalog, setCatalog] = useState<CatalogItem[]>([])
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    if (!catalogOpen) return
    setCatalog(getCatalog())
  }, [catalogOpen])

  const baseCatalog = useMemo(() => {
    if (!catalogFilter) return catalog
    return catalogFilter === "Materiales"
      ? catalog.filter((item) => item.category === "Materiales")
      : catalog.filter((item) => item.category !== "Materiales")
  }, [catalog, catalogFilter])

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

  const addFromCatalogSelection = (selected: Array<{ item: CatalogItem; quantity: number }>) => {
    const config = getCatalogDiscountConfig()

    const nextItems = selected.map(({ item, quantity }) => {
      const finalPrice = getEffectiveCatalogPrice(item, config)
      return {
        id: crypto.randomUUID(),
        quantity,
        code: item.code,
        description: item.description,
        unitPrice: finalPrice,
        totalPrice: finalPrice * quantity,
        brand: item.brand || "General",
        category: item.category,
        subcategory: item.subcategory || "General",
        variant: item.variant || "",
      } satisfies QuotationItem
    })

    onItemsChange([...items, ...nextItems])
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
      }),
    )
  }

  const removeItem = (id: string) => {
    onItemsChange(items.filter((item) => item.id !== id))
  }

  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0)
  const existingKeys = items.flatMap((item) => [item.id, item.code]).filter(Boolean)

  return (
    <div className="glass-card">
      <div className="flex flex-col gap-2 border-b border-border px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-3">
        <button type="button" onClick={() => setCollapsed(!collapsed)} className="flex items-center gap-2 text-foreground">
          {icon}
          <span className="font-heading text-sm font-semibold">{title}</span>
          <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">{items.length}</span>
          {collapsed ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronUp className="h-4 w-4 text-muted-foreground" />}
        </button>

        <div className="flex items-center gap-2">
          {items.length > 0 ? (
            <span className="text-xs font-medium text-muted-foreground">
              Subtotal: <span className="font-mono text-foreground">${formatCurrency(subtotal)}</span>
            </span>
          ) : null}

          <Button variant="outline" size="sm" onClick={() => setCatalogOpen(true)} className="h-7 border-border bg-transparent text-xs text-muted-foreground hover:bg-muted">
            <Search className="mr-1 h-3 w-3" />
            {companyFormat === "llc" ? "Catalog" : "Catálogo"}
          </Button>

          <Button size="sm" onClick={addEmpty} className="h-7 text-xs">
            <Plus className="mr-1 h-3 w-3" />
            {companyFormat === "llc" ? "Add" : "Agregar"}
          </Button>
        </div>
      </div>

      {!collapsed ? (
        <>
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
                      <Input type="number" min={1} value={item.quantity} onChange={(event) => updateItem(item.id, "quantity", event.target.value === "" ? 0 : Number(event.target.value))} className="h-8 text-center text-sm" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{companyFormat === "llc" ? "Code" : "Código"}</span>
                      <Input value={item.code} onChange={(event) => updateItem(item.id, "code", event.target.value)} placeholder="COD-001" className="h-8 font-mono text-sm" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{companyFormat === "llc" ? "Description" : "Descripción"}</span>
                    <Textarea value={item.description} onChange={(event) => updateItem(item.id, "description", event.target.value)} rows={2} className="min-h-14 resize-none text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{companyFormat === "llc" ? "Unit $" : "P. Unit."}</span>
                      <Input type="number" min={0} step={0.01} value={item.unitPrice} onChange={(event) => updateItem(item.id, "unitPrice", event.target.value === "" ? 0 : Number(event.target.value))} className="h-8 text-right text-sm" />
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

            {items.length === 0 ? (
              <div className="rounded-md border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                {companyFormat === "llc" ? 'No items. Use "Add" or pick from "Catalog".' : 'Sin items. Use "Agregar" o seleccione del "Catálogo".'}
              </div>
            ) : null}
          </div>

          <div className="hidden overflow-x-auto sm:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground" style={{ width: 64 }}>{companyFormat === "llc" ? "Qty" : "Cant."}</th>
                  <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground" style={{ width: 150 }}>{companyFormat === "llc" ? "Code" : "Código"}</th>
                  <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{companyFormat === "llc" ? "Description" : "Descripción"}</th>
                  <th className="px-3 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground" style={{ width: 110 }}>{companyFormat === "llc" ? "Unit Price" : "P. Unit."}</th>
                  <th className="px-3 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground" style={{ width: 110 }}>Total</th>
                  <th className="px-3 py-2.5" style={{ width: 40 }}><span className="sr-only">Acciones</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((item) => (
                  <tr key={item.id} className="group transition-colors hover:bg-muted/30">
                    <td className="px-3 py-2">
                      <Input type="number" min={1} value={item.quantity} onChange={(event) => updateItem(item.id, "quantity", event.target.value === "" ? 0 : Number(event.target.value))} className="h-8 w-14 text-center text-xs" />
                    </td>
                    <td className="px-3 py-2">
                      <Input value={item.code} onChange={(event) => updateItem(item.id, "code", event.target.value)} placeholder="COD-001" className="h-8 w-36 font-mono text-xs" />
                    </td>
                    <td className="px-3 py-2">
                      <Textarea value={item.description} onChange={(event) => updateItem(item.id, "description", event.target.value)} rows={1} className="min-h-8 resize-none text-xs" />
                    </td>
                    <td className="px-3 py-2">
                      <Input type="number" min={0} step={0.01} value={item.unitPrice} onChange={(event) => updateItem(item.id, "unitPrice", event.target.value === "" ? 0 : Number(event.target.value))} className="h-8 w-24 text-right text-xs" />
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

                {items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-xs text-muted-foreground">
                      {companyFormat === "llc" ? 'No items added yet.' : 'Sin items. Use "Agregar" o seleccione del "Catálogo".'}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </>
      ) : null}

      <CatalogPickerDrawer
        open={catalogOpen}
        onOpenChange={setCatalogOpen}
        catalog={baseCatalog}
        existingItems={existingKeys}
        companyFormat={companyFormat}
        onSelect={addFromCatalogSelection}
      />
    </div>
  )
}
