"use client"

import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

interface BrandFilterProps {
  brands: Array<{ name: string; count: number }>
  selected: string[]
  onChange: (brands: string[]) => void
}

export function BrandFilter({ brands, selected, onChange }: BrandFilterProps) {
  const allSelected = selected.length === 0
  const totalCount = brands.reduce((sum, brand) => sum + brand.count, 0)

  const toggleBrand = (brandName: string, checked: boolean) => {
    const next = checked
      ? Array.from(new Set([...selected, brandName]))
      : selected.filter((brand) => brand !== brandName)

    onChange(next.length === 0 || next.length === brands.length ? [] : next)
  }

  return (
    <div className="space-y-1">
      <BrandOption
        label="Todas las marcas"
        count={totalCount}
        checked={allSelected}
        onCheckedChange={() => onChange([])}
      />

      {brands.map((brand) => {
        const checked = allSelected || selected.includes(brand.name)

        return (
          <BrandOption
            key={brand.name}
            label={brand.name}
            count={brand.count}
            checked={checked}
            onCheckedChange={(value) => toggleBrand(brand.name, value)}
          />
        )
      })}
    </div>
  )
}

interface BrandOptionProps {
  label: string
  count: number
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}

function BrandOption({ label, count, checked, onCheckedChange }: BrandOptionProps) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center justify-between gap-3 rounded-md px-2 py-1.5 text-xs transition-colors",
        checked ? "bg-primary/10" : "hover:bg-muted/50",
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        <Checkbox checked={checked} onCheckedChange={(value) => onCheckedChange(value === true)} />
        <span className="truncate text-foreground">{label}</span>
      </div>

      <Badge variant="secondary" className="shrink-0 px-1.5 py-0 text-[11px] font-medium">
        {count}
      </Badge>
    </label>
  )
}
