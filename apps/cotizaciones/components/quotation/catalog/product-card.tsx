"use client"

import type { ReactNode } from "react"
import type { CatalogItem } from "@/lib/quotation-types"
import { formatCurrency } from "@/lib/quotation-types"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, Package, Pencil, Trash2 } from "lucide-react"
import { getCategoryIcon, normalizeCatalogCategory } from "./catalog-utils"

interface ProductCardProps {
  item: CatalogItem
  index: number
  isSelected: boolean
  onSelect: (selected: boolean) => void
  onQuickView: () => void
  onEdit: () => void
  onDelete: () => void
  effectivePrice?: number
  hideHoverActions?: boolean
  selectionDisabled?: boolean
  selectionAriaLabel?: string
  footer?: ReactNode
}

export function ProductCard({
  item,
  index,
  isSelected,
  onSelect,
  onQuickView,
  onEdit,
  onDelete,
  effectivePrice,
  hideHoverActions = false,
  selectionDisabled = false,
  selectionAriaLabel,
  footer,
}: ProductCardProps) {
  const category = normalizeCatalogCategory(item)
  const CategoryIcon = getCategoryIcon(category)
  const hasDiscount = typeof effectivePrice === "number" && effectivePrice !== item.unitPrice
  const displayPrice = hasDiscount ? effectivePrice : item.unitPrice
  const showBrand = Boolean(item.brand && item.brand.trim() && item.brand.trim().toLowerCase() !== "general")

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md",
        "animate-card-enter",
        `stagger-${(index % 6) + 1}`,
        isSelected && "ring-2 ring-primary/20",
      )}
    >
      <div className="absolute left-3 top-3 z-10 rounded-md bg-white/95 p-1 shadow-sm ring-1 ring-slate-200">
        <Checkbox
          checked={isSelected}
          disabled={selectionDisabled}
          onCheckedChange={(checked) => onSelect(checked === true)}
          aria-label={selectionAriaLabel || `Seleccionar ${item.code}`}
        />
      </div>

      <button
        type="button"
        onClick={onQuickView}
        className="relative block aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 p-3 text-left"
      >
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.description} className="h-full w-full object-contain" />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-400">
            <Package className="h-10 w-10" />
            <span className="text-xs font-medium">Sin imagen</span>
          </div>
        )}
      </button>

      <div className="space-y-2 p-3">
        <div className="space-y-1">
          <p className="truncate font-mono text-xs font-semibold text-primary">{item.code}</p>
          <p className="line-clamp-2 min-h-8 text-xs text-muted-foreground">{item.description}</p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <Badge variant="secondary" className="gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium">
            <CategoryIcon className="h-3 w-3 shrink-0" />
            <span className="truncate">{category}</span>
          </Badge>

          {showBrand ? (
            <Badge className="rounded-md border border-sky-200 bg-sky-50 px-2 py-0.5 text-[10px] font-medium text-sky-700 hover:bg-sky-100">
              {item.brand}
            </Badge>
          ) : null}
        </div>

        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            {hasDiscount ? (
              <div className="space-y-0.5">
                <p className="font-mono text-[11px] text-muted-foreground line-through">${formatCurrency(item.unitPrice)}</p>
                <p className="font-mono text-sm font-bold text-emerald-600">${formatCurrency(displayPrice)}</p>
              </div>
            ) : (
              <p className="font-mono text-sm font-bold text-foreground">${formatCurrency(displayPrice)}</p>
            )}
          </div>

          <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            {item.unit}
          </span>
        </div>
      </div>

      {!hideHoverActions ? (
        <div className="absolute inset-0 hidden items-center justify-center bg-white/75 opacity-0 backdrop-blur-[2px] transition-opacity duration-200 group-hover:opacity-100 md:flex">
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="icon" className="h-9 w-9 bg-white" onClick={onQuickView}>
              <Eye className="h-4 w-4" />
              <span className="sr-only">Vista rápida</span>
            </Button>
            <Button type="button" variant="outline" size="icon" className="h-9 w-9 bg-white" onClick={onEdit}>
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Editar producto</span>
            </Button>
            <Button type="button" variant="outline" size="icon" className="h-9 w-9 bg-white text-destructive hover:text-destructive" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Eliminar producto</span>
            </Button>
          </div>
        </div>
      ) : null}

      {footer ? <div className="border-t border-border/70 bg-muted/20 p-3">{footer}</div> : null}
    </article>
  )
}
