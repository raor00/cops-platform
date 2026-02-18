"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useCallback } from "react"
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

export function PipelineFilters({ technicians, currentTechId, currentPriority }: PipelineFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const createQueryString = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString())
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "") {
          params.delete(key)
        } else {
          params.set(key, value)
        }
      })
      return params.toString()
    },
    [searchParams]
  )

  const hasFilters = !!currentTechId || !!currentPriority

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Filter className="h-4 w-4 text-white/40 shrink-0" />

      {technicians.length > 0 && (
        <Select
          value={currentTechId ?? "all"}
          onValueChange={(val) => {
            router.push(
              pathname + "?" + createQueryString({ tecnico: val === "all" ? null : val })
            )
          }}
        >
          <SelectTrigger className="h-9 w-44 bg-white/5 border-white/20 text-white text-sm">
            <SelectValue placeholder="Todos los técnicos" />
          </SelectTrigger>
          <SelectContent className="bg-[#0e2f6f] border-white/20">
            <SelectItem value="all" className="text-white/70 hover:text-white">
              Todos los técnicos
            </SelectItem>
            {technicians.map((t) => (
              <SelectItem key={t.id} value={t.id} className="text-white hover:bg-white/10">
                {t.nombre} {t.apellido}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <Select
        value={currentPriority ?? "all"}
        onValueChange={(val) => {
          router.push(
            pathname + "?" + createQueryString({ prioridad: val === "all" ? null : val })
          )
        }}
      >
        <SelectTrigger className="h-9 w-40 bg-white/5 border-white/20 text-white text-sm">
          <SelectValue placeholder="Prioridad" />
        </SelectTrigger>
        <SelectContent className="bg-[#0e2f6f] border-white/20">
          <SelectItem value="all" className="text-white/70 hover:text-white">
            Todas las prioridades
          </SelectItem>
          {(Object.entries(PRIORITY_LABELS) as [string, string][]).map(([key, label]) => (
            <SelectItem key={key} value={key} className="text-white hover:bg-white/10">
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button
          size="sm"
          variant="ghost"
          className="h-9 text-white/50 hover:text-white border border-white/10 gap-1.5"
          onClick={() => router.push(pathname)}
        >
          <X className="h-3.5 w-3.5" />
          Limpiar
        </Button>
      )}
    </div>
  )
}
