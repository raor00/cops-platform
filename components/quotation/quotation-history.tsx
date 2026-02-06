"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import type { QuotationData } from "@/lib/quotation-types"
import { formatCurrency } from "@/lib/quotation-types"
import { getQuotations, deleteQuotation, updateQuotationStatus } from "@/lib/quotation-storage"
import { downloadPDF } from "@/lib/generate-pdf"
import { Search, FileDown, Pencil, Trash2, Eye, Filter, FileText, Clock } from "lucide-react"
import { toast } from "sonner"

interface QuotationHistoryProps {
  onEdit: (data: QuotationData) => void
  refreshKey: number
}

function formatDate(dateStr: string): string {
  if (!dateStr) return ""
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString("es-VE", { day: "2-digit", month: "2-digit", year: "numeric" })
  } catch {
    return dateStr
  }
}

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  borrador: { label: "Borrador", className: "bg-muted text-muted-foreground" },
  enviada: { label: "Enviada", className: "bg-[#dbeafe] text-[#1a5276]" },
  aprobada: { label: "Aprobada", className: "bg-[#dcfce7] text-[#166534]" },
  rechazada: { label: "Rechazada", className: "bg-[#fce4ec] text-[#b71c1c]" },
}

const TYPE_MAP: Record<string, string> = {
  proyecto: "Proyecto",
  servicio: "Servicio",
  mantenimiento: "Mantenimiento",
}

export function QuotationHistory({ onEdit, refreshKey }: QuotationHistoryProps) {
  const [quotations, setQuotations] = useState<QuotationData[]>([])
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterType, setFilterType] = useState<string>("all")
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    setQuotations(getQuotations())
  }, [refreshKey])

  const filtered = useMemo(() => {
    return quotations.filter((q) => {
      const matchSearch = !search ||
        q.code.toLowerCase().includes(search.toLowerCase()) ||
        q.clientInfo.name.toLowerCase().includes(search.toLowerCase()) ||
        q.subject.toLowerCase().includes(search.toLowerCase())
      const matchStatus = filterStatus === "all" || q.status === filterStatus
      const matchType = filterType === "all" || q.type === filterType
      return matchSearch && matchStatus && matchType
    })
  }, [quotations, search, filterStatus, filterType])

  const handleDelete = (id: string) => {
    deleteQuotation(id)
    setQuotations(getQuotations())
    setDeleteId(null)
    toast.success("Cotizacion eliminada")
  }

  const handleStatusChange = (id: string, status: QuotationData["status"]) => {
    updateQuotationStatus(id, status)
    setQuotations(getQuotations())
    toast.success("Estado actualizado")
  }

  const handleExport = (data: QuotationData) => {
    downloadPDF(data)
    toast.success("PDF generado")
  }

  const stats = useMemo(() => {
    const total = quotations.length
    const totalAmount = quotations.reduce((sum, q) => sum + q.total, 0)
    const approved = quotations.filter((q) => q.status === "aprobada").length
    return { total, totalAmount, approved }
  }, [quotations])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-heading text-2xl font-bold text-foreground">Historial de Cotizaciones</h2>
        <p className="mt-1 text-sm text-muted-foreground">{stats.total} cotizaciones registradas</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#1a5276]/10">
              <FileText className="h-4 w-4 text-[#1a5276]" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Cotizaciones</p>
              <p className="font-heading text-lg font-bold text-foreground">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#166534]/10">
              <Eye className="h-4 w-4 text-[#166534]" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Aprobadas</p>
              <p className="font-heading text-lg font-bold text-foreground">{stats.approved}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#1a5276]/10">
              <Clock className="h-4 w-4 text-[#1a5276]" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Monto Total</p>
              <p className="font-heading text-lg font-bold text-foreground">${formatCurrency(stats.totalAmount)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por codigo, cliente o asunto..."
            className="border-border bg-card pl-10 text-foreground"
          />
        </div>
        <div className="flex gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-36 border-border bg-card text-foreground">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="borrador">Borrador</SelectItem>
              <SelectItem value="enviada">Enviada</SelectItem>
              <SelectItem value="aprobada">Aprobada</SelectItem>
              <SelectItem value="rechazada">Rechazada</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-40 border-border bg-card text-foreground">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              <SelectItem value="proyecto">Proyecto</SelectItem>
              <SelectItem value="servicio">Servicio</SelectItem>
              <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="space-y-3 sm:hidden">
        {filtered.map((q) => (
          <div key={q.id} className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-mono text-xs font-semibold text-[#1a5276]">{q.code}</p>
                <p className="mt-1 truncate text-sm text-foreground">{q.clientInfo.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">{q.subject || "---"}</p>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={() => onEdit(q)} className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground" title="Editar">
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleExport(q)} className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground" title="Exportar PDF">
                  <FileDown className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setDeleteId(q.id)} className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive" title="Eliminar">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="rounded bg-muted px-2 py-0.5">{TYPE_MAP[q.type] || q.type}</span>
              <span className="rounded bg-muted px-2 py-0.5">{formatDate(q.createdAt)}</span>
              <span className="font-mono text-sm font-semibold text-foreground">${formatCurrency(q.total)}</span>
            </div>
            <div className="mt-3">
              <Select value={q.status} onValueChange={(v) => handleStatusChange(q.id, v as QuotationData["status"])}>
                <SelectTrigger className="h-8 w-full border-border bg-card text-xs text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="borrador">Borrador</SelectItem>
                  <SelectItem value="enviada">Enviada</SelectItem>
                  <SelectItem value="aprobada">Aprobada</SelectItem>
                  <SelectItem value="rechazada">Rechazada</SelectItem>
                </SelectContent>
              </Select>
              <div className="mt-2">
                <Badge className={STATUS_MAP[q.status]?.className || ""}>
                  {STATUS_MAP[q.status]?.label || q.status}
                </Badge>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            {quotations.length === 0
              ? "No hay cotizaciones registradas. Cree su primera cotizacion."
              : "No se encontraron cotizaciones con los filtros aplicados."}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="hidden overflow-hidden rounded-lg border border-border bg-card sm:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-[#0a1628]">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white">Codigo</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white">Cliente</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white">Asunto</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-white">Tipo</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-white">Fecha</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-white">Total USD</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-white">Estado</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-white">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((q) => (
                <tr key={q.id} className="group transition-colors hover:bg-muted/50">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-[#1a5276]">{q.code}</td>
                  <td className="max-w-[180px] truncate px-4 py-3 text-sm text-foreground">{q.clientInfo.name}</td>
                  <td className="max-w-[200px] truncate px-4 py-3 text-sm text-muted-foreground">{q.subject || "---"}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-xs text-muted-foreground">{TYPE_MAP[q.type] || q.type}</span>
                  </td>
                  <td className="px-4 py-3 text-center text-xs text-muted-foreground">{formatDate(q.createdAt)}</td>
                  <td className="px-4 py-3 text-right font-mono text-sm font-semibold text-foreground">${formatCurrency(q.total)}</td>
                  <td className="px-4 py-3 text-center">
                    <Select value={q.status} onValueChange={(v) => handleStatusChange(q.id, v as QuotationData["status"])}>
                      <SelectTrigger className="h-7 w-28 border-none bg-transparent p-0 text-xs">
                        <Badge className={STATUS_MAP[q.status]?.className || ""}>
                          {STATUS_MAP[q.status]?.label || q.status}
                        </Badge>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="borrador">Borrador</SelectItem>
                        <SelectItem value="enviada">Enviada</SelectItem>
                        <SelectItem value="aprobada">Aprobada</SelectItem>
                        <SelectItem value="rechazada">Rechazada</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button variant="ghost" size="sm" onClick={() => onEdit(q)} className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground" title="Editar">
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleExport(q)} className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground" title="Exportar PDF">
                        <FileDown className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteId(q.id)} className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive" title="Eliminar">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-sm text-muted-foreground">
                    {quotations.length === 0
                      ? "No hay cotizaciones registradas. Cree su primera cotizacion."
                      : "No se encontraron cotizaciones con los filtros aplicados."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete confirm */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="bg-card text-foreground sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-foreground">Confirmar eliminacion</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Esta cotizacion sera eliminada permanentemente. Esta accion no se puede deshacer.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)} className="border-border bg-transparent text-foreground">Cancelar</Button>
            <Button variant="destructive" onClick={() => deleteId && handleDelete(deleteId)}>Eliminar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
