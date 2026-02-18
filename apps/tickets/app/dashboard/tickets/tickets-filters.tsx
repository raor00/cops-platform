"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Search, X } from "lucide-react"
import { useState, useTransition } from "react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { STATUS_LABELS, PRIORITY_LABELS } from "@/types"

interface TicketsFiltersProps {
  currentStatus?: string
  currentPriority?: string
  currentSearch?: string
}

export function TicketsFilters({
  currentStatus,
  currentPriority,
  currentSearch,
}: TicketsFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState(currentSearch || "")

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (value && value !== "all") {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    
    // Reset page when filtering
    params.delete("page")
    
    startTransition(() => {
      router.push(`/dashboard/tickets?${params.toString()}`)
    })
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilter("search", search || null)
  }

  const clearFilters = () => {
    setSearch("")
    startTransition(() => {
      router.push("/dashboard/tickets")
    })
  }

  const hasFilters = currentStatus || currentPriority || currentSearch

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Search */}
      <form onSubmit={handleSearch} className="flex-1 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <Input
            placeholder="Buscar por número, cliente o asunto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button type="submit" variant="outline" disabled={isPending}>
          Buscar
        </Button>
      </form>

      {/* Status Filter */}
      <Select
        value={currentStatus || "all"}
        onValueChange={(value) => updateFilter("status", value)}
      >
        <SelectTrigger className="w-full sm:w-[160px]">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los estados</SelectItem>
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Priority Filter */}
      <Select
        value={currentPriority || "all"}
        onValueChange={(value) => updateFilter("priority", value)}
      >
        <SelectTrigger className="w-full sm:w-[160px]">
          <SelectValue placeholder="Prioridad" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas las prioridades</SelectItem>
          {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Clear Filters */}
      {hasFilters && (
        <Button
          variant="ghost"
          size="icon"
          onClick={clearFilters}
          className="text-white/60 hover:text-white"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
