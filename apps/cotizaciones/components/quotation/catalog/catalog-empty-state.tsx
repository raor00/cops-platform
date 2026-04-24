import { Package } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CatalogEmptyStateProps {
  message?: string
  hasFilters: boolean
  onClearFilters?: () => void
}

export function CatalogEmptyState({
  message = "No se encontraron productos",
  hasFilters,
  onClearFilters,
}: CatalogEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/60 px-6 py-14 text-center">
      <div className="rounded-full bg-muted/60 p-4">
        <Package className="h-10 w-10 text-muted-foreground/50" />
      </div>
      <p className="mt-4 text-sm text-muted-foreground">{message}</p>
      {hasFilters && onClearFilters ? (
        <Button type="button" variant="outline" className="mt-4" onClick={onClearFilters}>
          Limpiar filtros
        </Button>
      ) : null}
    </div>
  )
}
