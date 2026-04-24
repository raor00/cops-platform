"use client"

import type { CatalogItem } from "@/lib/quotation-types"
import { formatCurrency } from "@/lib/quotation-types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Package, Pencil, Plus, Trash2, Copy } from "lucide-react"
import { getCategoryIcon, normalizeCatalogCategory } from "./catalog-utils"

export interface QuickViewDrawerProps {
  item: CatalogItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: () => void
  onDuplicate: () => void
  onDelete: () => void
  onAddToQuotation: () => void
  onPreviewImage?: () => void
  effectivePrice?: number
}

interface InfoFieldProps {
  label: string
  value?: string | null
}

function InfoField({ label, value }: InfoFieldProps) {
  return (
    <div className="space-y-1 rounded-lg border border-border bg-muted/30 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="break-words text-sm text-foreground">{value?.trim() ? value : "—"}</p>
    </div>
  )
}

export function QuickViewDrawer({
  item,
  open,
  onOpenChange,
  onEdit,
  onDuplicate,
  onDelete,
  onAddToQuotation,
  onPreviewImage,
  effectivePrice,
}: QuickViewDrawerProps) {
  const category = item ? normalizeCatalogCategory(item) : ""
  const CategoryIcon = getCategoryIcon(category)
  const hasDiscount = Boolean(item && typeof effectivePrice === "number" && effectivePrice !== item.unitPrice)
  const displayPrice = item ? (hasDiscount ? effectivePrice ?? item.unitPrice : item.unitPrice) : 0
  const showBrand = Boolean(item?.brand?.trim() && item.brand.trim().toLowerCase() !== "general")

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex h-full w-full flex-col p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border px-6 py-5 text-left">
          <SheetTitle>{item?.code ?? "Vista rápida"}</SheetTitle>
          <SheetDescription className="sr-only">
            Panel lateral con detalles del producto seleccionado y acciones rápidas.
          </SheetDescription>
        </SheetHeader>

        {item ? (
          <>
            <div className="flex-1 overflow-y-auto">
              <div className="space-y-6 px-6 py-5">
                <div className="overflow-hidden rounded-xl border border-border bg-gradient-to-br from-slate-50 to-slate-100">
                  <div className="flex aspect-video items-center justify-center p-6">
                    {item.imageUrl ? (
                      <button type="button" onClick={onPreviewImage} className="h-full w-full" disabled={!onPreviewImage}>
                        <img src={item.imageUrl} alt={item.description} className="h-full w-full object-contain" />
                      </button>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        <Package className="h-12 w-12" />
                        <span className="text-sm font-medium">Sin imagen disponible</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="gap-1.5 rounded-full px-3 py-1 text-xs font-medium">
                    <CategoryIcon className="h-3.5 w-3.5 shrink-0" />
                    <span>{category}</span>
                  </Badge>

                  {showBrand ? (
                    <Badge className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700 hover:bg-sky-100">
                      {item.brand}
                    </Badge>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-foreground">Descripción</h3>
                  <p className="text-sm leading-6 text-muted-foreground">{item.description}</p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-foreground">Precio</h3>
                  {hasDiscount ? (
                    <div className="space-y-1">
                      <p className="font-mono text-sm text-muted-foreground line-through">${formatCurrency(item.unitPrice)}</p>
                      <p className="font-mono text-3xl font-bold text-emerald-600">${formatCurrency(displayPrice)}</p>
                    </div>
                  ) : (
                    <p className="font-mono text-3xl font-bold text-foreground">${formatCurrency(displayPrice)}</p>
                  )}
                </div>

                {item.imageUrl && onPreviewImage ? (
                  <Button type="button" variant="outline" className="w-full justify-center" onClick={onPreviewImage}>
                    Ver imagen completa
                  </Button>
                ) : null}

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <InfoField label="Código" value={item.code} />
                  <InfoField label="Marca" value={item.brand || "General"} />
                  <InfoField label="Categoría" value={category} />
                  <InfoField label="Subcategoría" value={item.subcategory} />
                  <InfoField label="Variante" value={item.variant} />
                  <InfoField label="Unidad" value={item.unit} />
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 border-t border-border bg-background/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Button type="button" variant="outline" className="justify-center" onClick={onEdit}>
                  <Pencil className="h-4 w-4" />
                  Editar
                </Button>
                <Button type="button" variant="secondary" className="justify-center" onClick={onDuplicate}>
                  <Copy className="h-4 w-4" />
                  Duplicar
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="justify-center border-destructive/40 text-destructive hover:bg-destructive/5 hover:text-destructive"
                  onClick={onDelete}
                >
                  <Trash2 className="h-4 w-4" />
                  Eliminar
                </Button>
                <Button type="button" className="justify-center" onClick={onAddToQuotation}>
                  <Plus className="h-4 w-4" />
                  Agregar a Cotización
                </Button>
              </div>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
