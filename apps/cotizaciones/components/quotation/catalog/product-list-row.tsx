"use client"

import type { CatalogItem } from "@/lib/quotation-types"
import { formatCurrency } from "@/lib/quotation-types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, Package, Pencil, Trash2 } from "lucide-react"
import { getCategoryIcon, normalizeCatalogCategory } from "./catalog-utils"

interface ProductListRowProps {
  item: CatalogItem
  isSelected: boolean
  onSelect: (selected: boolean) => void
  onQuickView: () => void
  onEdit: () => void
  onDelete: () => void
  effectivePrice?: number
}

export function ProductListRow({
  item,
  isSelected,
  onSelect,
  onQuickView,
  onEdit,
  onDelete,
  effectivePrice,
}: ProductListRowProps) {
  const category = normalizeCatalogCategory(item)
  const CategoryIcon = getCategoryIcon(category)
  const hasDiscount = typeof effectivePrice === "number" && effectivePrice !== item.unitPrice
  const displayPrice = hasDiscount ? effectivePrice : item.unitPrice
  const brand = item.brand?.trim() || "—"

  return (
    <tr className="border-b border-border transition-colors hover:bg-muted/50">
      <td className="w-10 px-3 py-2 align-middle">
        <Checkbox checked={isSelected} onCheckedChange={(checked) => onSelect(checked === true)} aria-label={`Seleccionar ${item.code}`} />
      </td>

      <td className="w-12 px-3 py-2 align-middle">
        <button
          type="button"
          onClick={onQuickView}
          className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg border border-border bg-gradient-to-br from-slate-50 to-slate-100"
        >
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.description} className="h-full w-full object-contain p-1.5" />
          ) : (
            <Package className="h-5 w-5 text-slate-400" />
          )}
        </button>
      </td>

      <td className="w-32 px-3 py-2 align-middle">
        <p className="truncate font-mono text-xs font-semibold text-primary">{item.code}</p>
      </td>

      <td className="px-3 py-2 align-middle">
        <p className="truncate text-xs text-foreground">{item.description}</p>
      </td>

      <td className="w-28 px-3 py-2 align-middle">
        <Badge variant="secondary" className="inline-flex max-w-full gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium">
          <CategoryIcon className="h-3 w-3 shrink-0" />
          <span className="truncate">{category}</span>
        </Badge>
      </td>

      <td className="w-24 px-3 py-2 align-middle">
        <p className="truncate text-xs text-muted-foreground">{brand}</p>
      </td>

      <td className="w-24 px-3 py-2 text-right align-middle">
        {hasDiscount ? (
          <div className="space-y-0.5">
            <p className="font-mono text-[10px] text-muted-foreground line-through">${formatCurrency(item.unitPrice)}</p>
            <p className="font-mono text-sm font-bold text-emerald-600">${formatCurrency(displayPrice)}</p>
          </div>
        ) : (
          <p className="font-mono text-sm font-bold text-foreground">${formatCurrency(displayPrice)}</p>
        )}
      </td>

      <td className="w-20 px-3 py-2 align-middle">
        <div className="flex items-center justify-end gap-1">
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={onQuickView}>
            <Eye className="h-4 w-4" />
            <span className="sr-only">Vista rápida</span>
          </Button>
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Editar producto</span>
          </Button>
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Eliminar producto</span>
          </Button>
        </div>
      </td>
    </tr>
  )
}
