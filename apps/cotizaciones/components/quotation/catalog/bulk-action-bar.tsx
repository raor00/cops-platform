"use client"

import { Button } from "@/components/ui/button"
import { PencilLine, Trash2, Tags } from "lucide-react"

export interface BulkActionBarProps {
  selectedCount: number
  totalCount: number
  onSelectAll: () => void
  onClearSelection: () => void
  onAdjustPrices: () => void
  onChangeCategory: () => void
  onDelete: () => void
}

export function BulkActionBar({
  selectedCount,
  totalCount,
  onSelectAll,
  onClearSelection,
  onAdjustPrices,
  onChangeCategory,
  onDelete,
}: BulkActionBarProps) {
  if (selectedCount <= 0) {
    return null
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
      <div className="pointer-events-auto animate-slide-up w-full max-w-5xl rounded-2xl border border-border bg-white shadow-lg">
        <div className="flex flex-col gap-4 px-4 py-3 sm:px-5 sm:py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">{selectedCount} de {totalCount} seleccionados</p>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
              <button type="button" onClick={onSelectAll} className="font-medium text-primary transition-colors hover:text-primary/80">
                Seleccionar todos
              </button>
              <button type="button" onClick={onClearSelection} className="font-medium text-muted-foreground transition-colors hover:text-foreground">
                Limpiar
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="outline" onClick={onAdjustPrices}>
              <PencilLine className="h-4 w-4" />
              Ajustar Precio
            </Button>
            <Button type="button" variant="outline" onClick={onChangeCategory}>
              <Tags className="h-4 w-4" />
              Cambiar Categoría
            </Button>
            <Button
              type="button"
              variant="outline"
              className="border-destructive/40 text-destructive hover:bg-destructive/5 hover:text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
              Eliminar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
