"use client"

import { useEffect, useMemo, useState } from "react"
import { Loader2, PackageSearch } from "lucide-react"
import type { CatalogoProducto } from "@cops/shared"

import { buscarProductoPorNombre } from "@/lib/actions/catalogo"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface MaterialCatalogSearchProps {
  onSelect: (producto: CatalogoProducto) => void
  excludeIds?: string[]
  disabled?: boolean
  placeholder?: string
}

export function MaterialCatalogSearch({
  onSelect,
  excludeIds = [],
  disabled = false,
  placeholder = "Buscar por código o descripción...",
}: MaterialCatalogSearchProps) {
  const [query, setQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<CatalogoProducto[]>([])
  const [error, setError] = useState<string | null>(null)
  const trimmedQuery = useMemo(() => query.trim(), [query])

  useEffect(() => {
    if (disabled) return

    if (trimmedQuery.length < 2) {
      setResults([])
      setError(null)
      return
    }

    const timeout = window.setTimeout(async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await buscarProductoPorNombre(trimmedQuery, excludeIds)
        if (!response.success) {
          setResults([])
          setError(response.error ?? "No se pudo buscar en el catálogo")
          return
        }

        setResults(response.data ?? [])
      } catch {
        setResults([])
        setError("No se pudo buscar en el catálogo")
      } finally {
        setIsLoading(false)
      }
    }, 250)

    return () => window.clearTimeout(timeout)
  }, [disabled, excludeIds, trimmedQuery])

  const handleSelect = (producto: CatalogoProducto) => {
    onSelect(producto)
    setQuery("")
    setResults([])
    setError(null)
  }

  return (
    <div className="relative space-y-2">
      <div className="relative">
        <PackageSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="pl-9"
        />
        {isLoading && <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-400" />}
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      {!error && trimmedQuery.length >= 2 && !isLoading && results.length === 0 && (
        <p className="text-xs text-slate-500">No hay productos coincidentes en el catálogo.</p>
      )}

      {results.length > 0 && (
        <div className="absolute z-50 mt-1 max-h-72 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl">
          {results.map((producto) => (
            <button
              key={producto.id}
              type="button"
              onClick={() => handleSelect(producto)}
              className={cn(
                "flex w-full flex-col gap-1 px-4 py-3 text-left transition-colors",
                "hover:bg-slate-50 focus:bg-slate-50 focus:outline-none",
              )}
            >
              <span className="text-sm font-medium text-slate-800">
                {producto.code} - {producto.description}
              </span>
              <span className="text-xs text-slate-500">
                Stock: {producto.stock} · Unidad: {producto.unit}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
