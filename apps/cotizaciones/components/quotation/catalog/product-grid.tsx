"use client"

import type { CatalogItem } from "@/lib/quotation-types"
import { CatalogEmptyState } from "./catalog-empty-state"
import { ProductCard } from "./product-card"

interface ProductGridProps {
  items: CatalogItem[]
  selectedIds: string[]
  onSelect: (id: string, selected: boolean) => void
  onQuickView: (item: CatalogItem) => void
  onEdit: (item: CatalogItem) => void
  onDelete: (item: CatalogItem) => void
  getEffectivePrice?: (item: CatalogItem) => number
}

export function ProductGrid({
  items,
  selectedIds,
  onSelect,
  onQuickView,
  onEdit,
  onDelete,
  getEffectivePrice,
}: ProductGridProps) {
  if (items.length === 0) {
    return <CatalogEmptyState hasFilters={false} />
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((item, index) => (
        <ProductCard
          key={item.id}
          item={item}
          index={index}
          isSelected={selectedIds.includes(item.id)}
          onSelect={(selected) => onSelect(item.id, selected)}
          onQuickView={() => onQuickView(item)}
          onEdit={() => onEdit(item)}
          onDelete={() => onDelete(item)}
          effectivePrice={getEffectivePrice?.(item)}
        />
      ))}
    </div>
  )
}
