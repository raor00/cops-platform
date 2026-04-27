"use client"

import type { CatalogItem } from "@/lib/quotation-types"
import { cn } from "@/lib/utils"
import { ChevronDown, ChevronUp } from "lucide-react"
import { CatalogEmptyState } from "./catalog-empty-state"
import { ProductListRow } from "./product-list-row"

export type ProductListSortColumn = "code" | "description" | "category" | "brand" | "price"
export type ProductListSortDirection = "asc" | "desc"

interface ProductListProps {
  items: CatalogItem[]
  selectedIds: string[]
  onSelect: (id: string, selected: boolean) => void
  onQuickView: (item: CatalogItem) => void
  onEdit: (item: CatalogItem) => void
  onDelete: (item: CatalogItem) => void
  getEffectivePrice?: (item: CatalogItem) => number
  sortBy?: ProductListSortColumn
  sortDirection?: ProductListSortDirection
  onSort?: (column: ProductListSortColumn, direction: ProductListSortDirection) => void
}

interface SortableHeaderProps {
  label: string
  column: ProductListSortColumn
  align?: "left" | "right"
  activeColumn?: ProductListSortColumn
  direction?: ProductListSortDirection
  onSort?: (column: ProductListSortColumn, direction: ProductListSortDirection) => void
  className?: string
}

function SortableHeader({ label, column, align = "left", activeColumn, direction = "asc", onSort, className }: SortableHeaderProps) {
  const isActive = activeColumn === column
  const nextDirection: ProductListSortDirection = isActive && direction === "asc" ? "desc" : "asc"
  const Indicator = isActive ? (direction === "asc" ? ChevronUp : ChevronDown) : ChevronUp

  return (
    <button
      type="button"
      onClick={() => onSort?.(column, nextDirection)}
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground",
        align === "right" && "ml-auto flex-row-reverse",
        isActive && "text-foreground",
        className,
      )}
    >
      <span>{label}</span>
      <Indicator className={cn("h-3.5 w-3.5", !isActive && "opacity-30")} />
    </button>
  )
}

export function ProductList({
  items,
  selectedIds,
  onSelect,
  onQuickView,
  onEdit,
  onDelete,
  getEffectivePrice,
  sortBy,
  sortDirection = "asc",
  onSort,
}: ProductListProps) {
  if (items.length === 0) {
    return <CatalogEmptyState hasFilters={false} />
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="table-glass table-row-stagger w-full">
          <thead>
            <tr>
              <th className="w-8 px-2 py-2" />
              <th className="w-10 px-2 py-2 text-center">Img</th>
              <th className="w-28 px-2 py-2">
                <SortableHeader label="Código" column="code" activeColumn={sortBy} direction={sortDirection} onSort={onSort} />
              </th>
              <th className="min-w-[180px] px-2 py-2">
                <SortableHeader label="Descripción" column="description" activeColumn={sortBy} direction={sortDirection} onSort={onSort} />
              </th>
              <th className="hidden w-24 px-2 py-2 md:table-cell">
                <SortableHeader label="Categoría" column="category" activeColumn={sortBy} direction={sortDirection} onSort={onSort} />
              </th>
              <th className="hidden w-20 px-2 py-2 lg:table-cell">
                <SortableHeader label="Marca" column="brand" activeColumn={sortBy} direction={sortDirection} onSort={onSort} />
              </th>
              <th className="w-20 px-2 py-2 text-right">
                <SortableHeader label="Precio" column="price" align="right" activeColumn={sortBy} direction={sortDirection} onSort={onSort} />
              </th>
              <th className="w-28 px-2 py-2 text-left">Stock</th>
              <th className="w-16 px-2 py-2 text-right">Acc</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <ProductListRow
                key={item.id}
                item={item}
                isSelected={selectedIds.includes(item.id)}
                onSelect={(selected) => onSelect(item.id, selected)}
                onQuickView={() => onQuickView(item)}
                onEdit={() => onEdit(item)}
                onDelete={() => onDelete(item)}
                effectivePrice={getEffectivePrice?.(item)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
