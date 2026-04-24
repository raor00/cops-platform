"use client"

import { useEffect, useState } from "react"
import { ArrowUpDown, Grid3X3, List, Plus, Search, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

export type CatalogSortOption = "price-asc" | "price-desc" | "code-asc" | "description-asc"
export type CatalogViewMode = "grid" | "list"

export interface CatalogActiveFilter {
  key: string
  label: string
  onRemove: () => void
}

interface CatalogToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  sort: CatalogSortOption
  onSortChange: (value: CatalogSortOption) => void
  view: CatalogViewMode
  onViewChange: (value: CatalogViewMode) => void
  onNewClick: () => void
  activeFilters?: CatalogActiveFilter[]
  resultCount: number
}

export function CatalogToolbar({
  search,
  onSearchChange,
  sort,
  onSortChange,
  view,
  onViewChange,
  onNewClick,
  activeFilters = [],
  resultCount,
}: CatalogToolbarProps) {
  const [searchValue, setSearchValue] = useState(search)

  useEffect(() => {
    setSearchValue(search)
  }, [search])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (searchValue !== search) {
        onSearchChange(searchValue)
      }
    }, 300)

    return () => window.clearTimeout(timeoutId)
  }, [onSearchChange, search, searchValue])

  const clearSearch = () => {
    setSearchValue("")
    onSearchChange("")
  }

  return (
    <div className="space-y-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Buscar por código o descripción"
              className="pr-10 pl-10"
            />
            {searchValue ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={clearSearch}
                className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Limpiar búsqueda</span>
              </Button>
            ) : null}
          </div>

          <div className="flex items-center gap-2 sm:w-[220px]">
            <ArrowUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
            <Select value={sort} onValueChange={(value) => onSortChange(value as CatalogSortOption)}>
              <SelectTrigger>
                <SelectValue placeholder="Ordenar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price-asc">Precio ↑</SelectItem>
                <SelectItem value="price-desc">Precio ↓</SelectItem>
                <SelectItem value="code-asc">Código A-Z</SelectItem>
                <SelectItem value="description-asc">Descripción A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center rounded-lg border border-border bg-muted/30 p-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onViewChange("grid")}
              className={cn("h-8 px-2", view === "grid" && "bg-background shadow-sm")}
            >
              <Grid3X3 className="h-4 w-4" />
              <span className="sr-only">Vista de cuadrícula</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onViewChange("list")}
              className={cn("h-8 px-2", view === "list" && "bg-background shadow-sm")}
            >
              <List className="h-4 w-4" />
              <span className="sr-only">Vista de lista</span>
            </Button>
          </div>

          <Button type="button" onClick={onNewClick}>
            <Plus className="h-4 w-4" />
            Nuevo
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {resultCount} {resultCount === 1 ? "resultado" : "resultados"}
        </p>

        {activeFilters.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            {activeFilters.map((filter) => (
              <Badge key={filter.key} variant="secondary" className="gap-1 pr-1">
                <span>{filter.label}</span>
                <button
                  type="button"
                  onClick={filter.onRemove}
                  className="rounded-full p-0.5 transition-colors hover:bg-black/10"
                  aria-label={`Eliminar filtro ${filter.label}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}
