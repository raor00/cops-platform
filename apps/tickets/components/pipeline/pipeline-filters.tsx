"use client"

import { useCallback } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Filter, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PRIORITY_LABELS } from "@/types"

interface PipelineFiltersProps {
  technicians: Array<{ id: string; nombre: string; apellido: string }>
  currentTechId?: string
  currentPriority?: string
}

export function PipelineFilters({
  technicians,
  currentTechId,
  currentPriority,
}: PipelineFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const createQueryString = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString())
      Object.entries(updates).forEach(([key, value]) => {
        if (!value) {
          params.delete(key)
        } else {
          params.set(key, value)
        }
      })
      return params.toString()
    },
    [searchParams]
  )

  const hasFilters = Boolean(currentTechId || currentPriority)

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Filter className="h-4 w-4 shrink-0 text-slate-400" />

      {technicians.length > 0 && (
        <Select
          value={currentTechId ?? "all"}
          onValueChange={(value) => {
            router.push(pathname + "?" + createQueryString({ tecnico: value === "all" ? null : value }))
          }}
        >
          <SelectTrigger className="h-9 w-44 border-slate-200 bg-white text-sm text-slate-800">
            <SelectValue placeholder="Todos los tecnicos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tecnicos</SelectItem>
            {technicians.map((technician) => (
              <SelectItem key={technician.id} value={technician.id}>
                {technician.nombre} {technician.apellido}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <Select
        value={currentPriority ?? "all"}
        onValueChange={(value) => {
          router.push(pathname + "?" + createQueryString({ prioridad: value === "all" ? null : value }))
        }}
      >
        <SelectTrigger className="h-9 w-40 border-slate-200 bg-white text-sm text-slate-800">
          <SelectValue placeholder="Prioridad" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas las prioridades</SelectItem>
          {(Object.entries(PRIORITY_LABELS) as [string, string][]).map(([key, label]) => (
            <SelectItem key={key} value={key}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button
          size="sm"
          variant="ghost"
          className="h-9 gap-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          onClick={() => router.push(pathname)}
        >
          <X className="h-3.5 w-3.5" />
          Limpiar
        </Button>
      )}
    </div>
  )
}
