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

  subcategories: string[]
  selectedSubcategory: string | null
  onSubcategoryChange: (sub: string | null) => void

  brands: Array<{ name: string; count: number }>
  selectedBrands: string[]
  onBrandsChange: (brands: string[]) => void

  priceRange: { min: number; max: number }
  selectedPriceRange: [number, number]
  onPriceRangeChange: (range: [number, number]) => void

  stockFilter: "all" | "in-stock" | "low-stock"
  onStockFilterChange: (value: "all" | "in-stock" | "low-stock") => void

  onClearAll: () => void
  hasActiveFilters: boolean
}

export function CatalogFilters({
  categories,
  selectedCategory,
  onCategoryChange,
  subcategories,
  selectedSubcategory,
  onSubcategoryChange,
  brands,
  selectedBrands,
  onBrandsChange,
  priceRange,
  selectedPriceRange,
  onPriceRangeChange,
  stockFilter,
  onStockFilterChange,
  onClearAll,
  hasActiveFilters,
}: CatalogFiltersProps) {
  return (
    <div className="space-y-4">
      <FilterSection title="Categoría" defaultOpen>
        <CategoryFilter categories={categories} selected={selectedCategory} onSelect={onCategoryChange} />
      </FilterSection>

      {subcategories.length > 0 && (
        <>
          <Separator />
          <FilterSection title="Subcategoría" defaultOpen>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => onSubcategoryChange(null)}
                className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs transition-colors ${
                  selectedSubcategory === null ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                }`}
              >
                <span>Todas las subcategorías</span>
              </button>
              {subcategories.map((sub) => (
                <button
                  key={sub}
                  type="button"
                  onClick={() => onSubcategoryChange(sub)}
                  className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs transition-colors ${
                    selectedSubcategory === sub ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  }`}
                >
                  <span className="truncate">{sub}</span>
                </button>
              ))}
            </div>
          </FilterSection>
        </>
      )}

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

      <Separator />

      <FilterSection title="Stock" defaultOpen>
        <div className="space-y-1">
          {[
            { value: "all", label: "Todos" },
            { value: "in-stock", label: "Solo con stock" },
            { value: "low-stock", label: "Stock bajo" },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onStockFilterChange(option.value as "all" | "in-stock" | "low-stock")}
              className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs transition-colors ${
                stockFilter === option.value ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              }`}
            >
              <span>{option.label}</span>
            </button>
          ))}
        </div>
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
