"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { QuotationData } from "@/lib/quotation-types"
import { formatCurrency } from "@/lib/quotation-types"
import { deleteQuotation, getQuotations, updateQuotationStatus } from "@/lib/quotation-storage"
import { downloadPDF } from "@/lib/generate-pdf"
import { deleteDeliveryNote, getDeliveryNotes } from "@/lib/delivery-note-storage"
import { downloadDeliveryNotePDF } from "@/lib/generate-delivery-note-pdf"
import { deleteTransportGuide, getTransportGuides } from "@/lib/transport-guide-storage"
import { downloadTransportGuidePDF } from "@/lib/generate-transport-guide-pdf"
import type { DeliveryNoteData } from "@/lib/delivery-note-types"
import type { TransportGuideData } from "@/lib/transport-guide-types"
import { FileDown, FileText, Pencil, Search, Trash2 } from "lucide-react"
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
  enviada: { label: "Enviada", className: "bg-[#dbeafe] text-[#4a72ef]" },
  aprobada: { label: "Aprobada", className: "bg-[#dcfce7] text-[#166534]" },
  rechazada: { label: "Rechazada", className: "bg-[#fce4ec] text-[#b71c1c]" },
  anulado: { label: "Anulado", className: "bg-[#f3f4f6] text-[#6b7280]" },
}

export function QuotationHistory({ onEdit, refreshKey }: QuotationHistoryProps) {
  const [quotations, setQuotations] = useState<QuotationData[]>([])
  const [deliveryNotes, setDeliveryNotes] = useState<DeliveryNoteData[]>([])
  const [transportGuides, setTransportGuides] = useState<TransportGuideData[]>([])
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [deleteItem, setDeleteItem] = useState<{ type: "quote" | "delivery" | "transport"; id: string } | null>(null)

  const refreshAll = () => {
    setQuotations(getQuotations())
    setDeliveryNotes(getDeliveryNotes())
    setTransportGuides(getTransportGuides())
  }

  useEffect(() => {
    refreshAll()
  }, [refreshKey])

  const filteredQuotes = useMemo(
    () =>
      quotations.filter((q) => {
        const clientName = q.clientInfo.billToName || q.clientInfo.name
        const text = `${q.code} ${clientName} ${q.subject}`.toLowerCase()
        const matchSearch = !search || text.includes(search.toLowerCase())
        const matchStatus = filterStatus === "all" || q.status === filterStatus
        return matchSearch && matchStatus
      }),
    [quotations, search, filterStatus],
  )

  const filteredDelivery = useMemo(
    () =>
      deliveryNotes.filter((note) => {
        const text = `${note.code} ${note.clientName} ${note.attention}`.toLowerCase()
        return !search || text.includes(search.toLowerCase())
      }),
    [deliveryNotes, search],
  )

  const filteredTransport = useMemo(
    () =>
      transportGuides.filter((guide) => {
        const text = `${guide.code} ${guide.authorizedName} ${guide.recipient}`.toLowerCase()
        return !search || text.includes(search.toLowerCase())
      }),
    [transportGuides, search],
  )

  const handleDelete = () => {
    if (!deleteItem) return
    if (deleteItem.type === "quote") deleteQuotation(deleteItem.id)
    if (deleteItem.type === "delivery") deleteDeliveryNote(deleteItem.id)
    if (deleteItem.type === "transport") deleteTransportGuide(deleteItem.id)
    setDeleteItem(null)
    refreshAll()
    toast.success("Documento eliminado")
  }

  const handleExportQuote = async (data: QuotationData) => {
    try {
      await downloadPDF(data)
      toast.success("PDF generado")
    } catch {
      toast.error("No se pudo generar el PDF")
    }
  }

  const handleExportDelivery = async (data: DeliveryNoteData) => {
    try {
      await downloadDeliveryNotePDF(data)
      toast.success("PDF generado")
    } catch {
      toast.error("No se pudo generar el PDF")
    }
  }

  const handleExportTransport = async (data: TransportGuideData) => {
    try {
      await downloadTransportGuidePDF(data)
      toast.success("PDF generado")
    } catch {
      toast.error("No se pudo generar el PDF")
    }
  }

  const handleStatusChange = (id: string, status: QuotationData["status"]) => {
    updateQuotationStatus(id, status)
    refreshAll()
    toast.success("Estado actualizado")
  }

  return (
    <div className="min-w-0 space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold text-foreground">Historial</h2>
        <p className="mt-1 text-sm text-muted-foreground">Seccionado por tipo de documento</p>
      </div>

      <div className="flex min-w-0 flex-col gap-3 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por codigo, cliente, autorizado..."
            className="border-border bg-card pl-10 text-foreground"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full border-border bg-card text-foreground sm:w-36">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="borrador">Borrador</SelectItem>
            <SelectItem value="enviada">Enviada</SelectItem>
            <SelectItem value="aprobada">Aprobada</SelectItem>
            <SelectItem value="rechazada">Rechazada</SelectItem>
            <SelectItem value="anulado">Anulado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="quotes">
        <div className="overflow-x-auto pb-1">
          <TabsList className="inline-flex min-w-full bg-muted sm:grid sm:w-full sm:max-w-md sm:grid-cols-3">
            <TabsTrigger value="quotes" className="whitespace-nowrap px-4 text-xs sm:text-sm">Cotizaciones</TabsTrigger>
            <TabsTrigger value="delivery" className="whitespace-nowrap px-4 text-xs sm:text-sm">Notas de Entrega</TabsTrigger>
            <TabsTrigger value="transport" className="whitespace-nowrap px-4 text-xs sm:text-sm">Guias de Transporte</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="quotes" className="mt-4">
          <div className="overflow-x-auto rounded-lg border border-border bg-card">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="border-b border-border bg-[#153977]">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-white">Codigo</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-white">Cliente</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-white">Total</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-white">Estado</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-white">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredQuotes.map((q) => (
                  <tr key={q.id} className="hover:bg-muted/40">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-[#4a72ef]">{q.code}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{q.clientInfo.billToName || q.clientInfo.name}</td>
                    <td className="px-4 py-3 text-right font-mono text-sm text-foreground">${formatCurrency(q.total)}</td>
                    <td className="px-4 py-3 text-center">
                      <Select value={q.status} onValueChange={(v) => handleStatusChange(q.id, v as QuotationData["status"])}>
                        <SelectTrigger className="h-8 w-28 border-none bg-transparent p-0 text-xs">
                          <Badge className={STATUS_MAP[q.status]?.className || ""}>{STATUS_MAP[q.status]?.label || q.status}</Badge>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="borrador">Borrador</SelectItem>
                          <SelectItem value="enviada">Enviada</SelectItem>
                          <SelectItem value="aprobada">Aprobada</SelectItem>
                          <SelectItem value="rechazada">Rechazada</SelectItem>
                          <SelectItem value="anulado">Anulado</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => onEdit(q)} className="h-7 w-7 p-0"><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleExportQuote(q)} className="h-7 w-7 p-0"><FileDown className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => setDeleteItem({ type: "quote", id: q.id })} className="h-7 w-7 p-0 hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredQuotes.length === 0 && (
                  <tr><td colSpan={5} className="py-10 text-center text-sm text-muted-foreground">No hay cotizaciones.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="delivery" className="mt-4">
          <div className="overflow-x-auto rounded-lg border border-border bg-card">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="border-b border-border bg-[#153977]">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-white">Codigo</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-white">Cliente</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-white">Atencion</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-white">Fecha</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-white">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredDelivery.map((note) => (
                  <tr key={note.id} className="hover:bg-muted/40">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-[#4a72ef]">{note.code}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{note.clientName}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{note.attention || "-"}</td>
                    <td className="px-4 py-3 text-center text-xs text-muted-foreground">{formatDate(note.issueDate)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleExportDelivery(note)} className="h-7 w-7 p-0"><FileDown className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => setDeleteItem({ type: "delivery", id: note.id })} className="h-7 w-7 p-0 hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredDelivery.length === 0 && (
                  <tr><td colSpan={5} className="py-10 text-center text-sm text-muted-foreground">No hay notas de entrega.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="transport" className="mt-4">
          <div className="overflow-x-auto rounded-lg border border-border bg-card">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="border-b border-border bg-[#153977]">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-white">Codigo</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-white">Autorizado</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-white">Dirigido a</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-white">Fecha</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-white">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTransport.map((guide) => (
                  <tr key={guide.id} className="hover:bg-muted/40">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-[#4a72ef]">{guide.code}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{guide.authorizedName}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{guide.recipient}</td>
                    <td className="px-4 py-3 text-center text-xs text-muted-foreground">{formatDate(guide.issueDate)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleExportTransport(guide)} className="h-7 w-7 p-0"><FileDown className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => setDeleteItem({ type: "transport", id: guide.id })} className="h-7 w-7 p-0 hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredTransport.length === 0 && (
                  <tr><td colSpan={5} className="py-10 text-center text-sm text-muted-foreground">No hay guias de transporte.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <DialogContent className="bg-card text-foreground sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirmar eliminacion</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Este documento sera eliminado permanentemente.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteItem(null)} className="border-border bg-transparent text-foreground">Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete}>Eliminar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}




