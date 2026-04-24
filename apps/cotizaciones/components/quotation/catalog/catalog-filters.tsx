"use client"

import { useState, type ReactNode } from "react"
import { ChevronDown, FilterX } from "lucide-react"
import { BrandFilter } from "./brand-filter"
import { CategoryFilter } from "./category-filter"
import { PriceFilter } from "./price-filter"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

interface CatalogFiltersProps {
  categories: Array<{ name: string; count: number }>
  selectedCategory: string | null
  onCategoryChange: (cat: string | null) => void

  brands: Array<{ name: string; count: number }>
  selectedBrands: string[]
  onBrandsChange: (brands: string[]) => void

  priceRange: { min: number; max: number }
  selectedPriceRange: [number, number]
  onPriceRangeChange: (range: [number, number]) => void

  onClearAll: () => void
  hasActiveFilters: boolean
}

export function CatalogFilters({
  categories,
  selectedCategory,
  onCategoryChange,
  brands,
  selectedBrands,
  onBrandsChange,
  priceRange,
  selectedPriceRange,
  onPriceRangeChange,
  onClearAll,
  hasActiveFilters,
}: CatalogFiltersProps) {
  return (
    <div className="space-y-4">
      <FilterSection title="Categoría" defaultOpen>
        <CategoryFilter categories={categories} selected={selectedCategory} onSelect={onCategoryChange} />
      </FilterSection>

      <Separator />

      <FilterSection title="Marca" defaultOpen>
        <BrandFilter brands={brands} selected={selectedBrands} onChange={onBrandsChange} />
      </FilterSection>

      <Separator />

      <FilterSection title="Precio" defaultOpen>
        <PriceFilter
          min={priceRange.min}
          max={priceRange.max}
          value={selectedPriceRange}
          onChange={onPriceRangeChange}
        />
      </FilterSection>

      {hasActiveFilters ? (
        <>
          <Separator />
          <Button type="button" variant="outline" className="w-full justify-center text-xs" onClick={onClearAll}>
            <FilterX className="h-3.5 w-3.5" />
            Limpiar filtros
          </Button>
        </>
      ) : null}
    </div>
  )
}

interface FilterSectionProps {
  title: string
  children: ReactNode
  defaultOpen?: boolean
}

function FilterSection({ title, children, defaultOpen = true }: FilterSectionProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="space-y-3">
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex w-full items-center justify-between gap-2 text-left"
            aria-expanded={open}
          >
            <span className="text-sm font-semibold text-foreground">{title}</span>
            <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")} />
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>{children}</CollapsibleContent>
      </div>
    </Collapsible>
  )
}
