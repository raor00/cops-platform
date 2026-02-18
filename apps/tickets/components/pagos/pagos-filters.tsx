"use client"

import { useState } from "react"
import { Filter, Download, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Card, CardContent } from "@/components/ui/card"
import type { PaymentExportData } from "@/lib/utils/csv-export"
import {
  generatePaymentsCSV,
  downloadCSV,
  generatePaymentsFilename,
} from "@/lib/utils/csv-export"
import { useToast } from "@/hooks/use-toast"

export interface PagosFilters {
  estado?: "pendiente" | "pagado" | "all"
  tecnico?: string
  metodo_pago?: string
  fecha_desde?: string
  fecha_hasta?: string
  monto_min?: number
  monto_max?: number
}

interface PagosFiltersBarProps {
  filters: PagosFilters
  onFiltersChange: (filters: PagosFilters) => void
  technicians: Array<{ id: string; nombre: string; apellido: string }>
  paymentsForExport: PaymentExportData[]
}

export function PagosFiltersBar({
  filters,
  onFiltersChange,
  technicians,
  paymentsForExport,
}: PagosFiltersBarProps) {
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)

  const activeFiltersCount = Object.entries(filters).filter(
    ([key, value]) =>
      value !== undefined &&
      value !== "all" &&
      value !== "" &&
      !(key === "estado" && value === "all")
  ).length

  function handleExportCSV() {
    try {
      const csvContent = generatePaymentsCSV(paymentsForExport)
      const filename = generatePaymentsFilename("pagos_tecnicos")
      downloadCSV(csvContent, filename)

      toast({
        title: "Exportado exitosamente",
        description: `Se ha descargado el archivo ${filename}`,
      })
    } catch (error) {
      toast({
        title: "Error al exportar",
        description: "No se pudo generar el archivo CSV",
        variant: "destructive",
      })
    }
  }

  function clearFilters() {
    onFiltersChange({
      estado: "all",
      tecnico: undefined,
      metodo_pago: undefined,
      fecha_desde: undefined,
      fecha_hasta: undefined,
      monto_min: undefined,
      monto_max: undefined,
    })
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Estado rápido */}
      <Select
        value={filters.estado || "all"}
        onValueChange={(value) =>
          onFiltersChange({ ...filters, estado: value as PagosFilters["estado"] })
        }
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="pendiente">Pendientes</SelectItem>
          <SelectItem value="pagado">Pagados</SelectItem>
        </SelectContent>
      </Select>

      {/* Filtros avanzados */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filtros
            {activeFiltersCount > 0 && (
              <span className="ml-1 rounded-full bg-blue-500/30 px-2 py-0.5 text-xs font-semibold text-blue-300">
                {activeFiltersCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="start">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-white">Filtros Avanzados</h4>
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-8 text-xs"
                >
                  <X className="h-3 w-3 mr-1" />
                  Limpiar
                </Button>
              )}
            </div>

            {/* Técnico */}
            <div className="space-y-2">
              <Label>Técnico</Label>
              <Select
                value={filters.tecnico || "all"}
                onValueChange={(value) =>
                  onFiltersChange({
                    ...filters,
                    tecnico: value === "all" ? undefined : value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los técnicos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los técnicos</SelectItem>
                  {technicians.map((tech) => (
                    <SelectItem key={tech.id} value={tech.id}>
                      {tech.nombre} {tech.apellido}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Método de pago */}
            <div className="space-y-2">
              <Label>Método de Pago</Label>
              <Select
                value={filters.metodo_pago || "all"}
                onValueChange={(value) =>
                  onFiltersChange({
                    ...filters,
                    metodo_pago: value === "all" ? undefined : value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="efectivo">Efectivo</SelectItem>
                  <SelectItem value="transferencia">Transferencia</SelectItem>
                  <SelectItem value="pago_movil">Pago Móvil</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Rango de fechas */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Desde</Label>
                <Input
                  type="date"
                  value={filters.fecha_desde || ""}
                  onChange={(e) =>
                    onFiltersChange({ ...filters, fecha_desde: e.target.value || undefined })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Hasta</Label>
                <Input
                  type="date"
                  value={filters.fecha_hasta || ""}
                  onChange={(e) =>
                    onFiltersChange({ ...filters, fecha_hasta: e.target.value || undefined })
                  }
                />
              </div>
            </div>

            {/* Rango de montos */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Monto Mín.</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={filters.monto_min || ""}
                  onChange={(e) =>
                    onFiltersChange({
                      ...filters,
                      monto_min: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Monto Máx.</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={filters.monto_max || ""}
                  onChange={(e) =>
                    onFiltersChange({
                      ...filters,
                      monto_max: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                />
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Export CSV */}
      <Button
        variant="outline"
        onClick={handleExportCSV}
        disabled={paymentsForExport.length === 0}
        className="gap-2 ml-auto"
      >
        <Download className="h-4 w-4" />
        Exportar CSV
      </Button>
    </div>
  )
}

// Componente para mostrar filtros activos
export function ActiveFiltersDisplay({ filters, onRemoveFilter }: {
  filters: PagosFilters
  onRemoveFilter: (key: keyof PagosFilters) => void
}) {
  const activeFilters: Array<{ key: keyof PagosFilters; label: string; value: string }> = []

  if (filters.tecnico) {
    activeFilters.push({ key: "tecnico", label: "Técnico", value: filters.tecnico })
  }
  if (filters.metodo_pago) {
    activeFilters.push({ key: "metodo_pago", label: "Método", value: filters.metodo_pago })
  }
  if (filters.fecha_desde) {
    activeFilters.push({ key: "fecha_desde", label: "Desde", value: filters.fecha_desde })
  }
  if (filters.fecha_hasta) {
    activeFilters.push({ key: "fecha_hasta", label: "Hasta", value: filters.fecha_hasta })
  }
  if (filters.monto_min) {
    activeFilters.push({
      key: "monto_min",
      label: "Min",
      value: `$${filters.monto_min}`,
    })
  }
  if (filters.monto_max) {
    activeFilters.push({
      key: "monto_max",
      label: "Max",
      value: `$${filters.monto_max}`,
    })
  }

  if (activeFilters.length === 0) return null

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm text-white/50">Filtros activos:</span>
      {activeFilters.map((filter) => (
        <button
          key={filter.key}
          onClick={() => onRemoveFilter(filter.key)}
          className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-medium border border-blue-500/30 hover:bg-blue-500/30 transition-colors"
        >
          <span>
            {filter.label}: {filter.value}
          </span>
          <X className="h-3 w-3" />
        </button>
      ))}
    </div>
  )
}
