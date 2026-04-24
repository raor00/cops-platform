"use client"

import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

interface CatalogSelectionSummaryProps {
  allPageSelected: boolean
  onTogglePageSelection: (checked: boolean) => void
  selectedCount: number
  filteredCount: number
  pageStart: number
  pageEnd: number
}

export function CatalogSelectionSummary({
  allPageSelected,
  onTogglePageSelection,
  selectedCount,
  filteredCount,
  pageStart,
  pageEnd,
}: CatalogSelectionSummaryProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <label className="inline-flex items-center gap-2">
          <Checkbox checked={allPageSelected} onCheckedChange={(checked) => onTogglePageSelection(checked === true)} />
          <span>Seleccionar página</span>
        </label>
        {selectedCount > 0 ? <Badge variant="secondary">{selectedCount} seleccionados</Badge> : null}
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span>{filteredCount > 0 ? `${pageStart}-${pageEnd} de ${filteredCount}` : "0 resultados"}</span>
        <span className="hidden sm:inline">•</span>
        <span>Atajos: / buscar · ↑↓ navegar · Enter vista rápida · E editar</span>
      </div>
    </div>
  )
}
