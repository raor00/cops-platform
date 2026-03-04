"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Loader2, UploadCloud, Database, RefreshCcw } from "lucide-react"
import { toast } from "sonner"

type DocRow = {
  id: string
  source_type: string
  source_name: string
  metadata: Record<string, unknown>
  created_at: string
}

export function KnowledgeManager() {
  const [file, setFile] = useState<File | null>(null)
  const [client, setClient] = useState("")
  const [date, setDate] = useState("")
  const [total, setTotal] = useState("")
  const [currency, setCurrency] = useState("USD")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [docs, setDocs] = useState<DocRow[]>([])

  const canUpload = useMemo(() => Boolean(file) && !loading, [file, loading])

  async function loadDocs() {
    const res = await fetch("/api/ai/knowledge/documents", { method: "GET" })
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; documents?: DocRow[] }
    setDocs(data.documents || [])
  }

  useEffect(() => {
    loadDocs().catch(() => {})
  }, [])

  async function handleUpload() {
    if (!file) return
    setLoading(true)
    try {
      const form = new FormData()
      form.set("file", file)
      if (client.trim()) form.set("client", client.trim())
      if (date.trim()) form.set("date", date.trim())
      if (total.trim()) form.set("total", total.trim())
      if (currency.trim()) form.set("currency", currency.trim())
      if (notes.trim()) form.set("notes", notes.trim())

      const res = await fetch("/api/ai/knowledge/ingest", { method: "POST", body: form })
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string; chunkCount?: number }
      if (!res.ok || !data.ok) {
        throw new Error(data.message || "No se pudo ingerir el documento.")
      }

      toast.success("Documento agregado a la Base de Conocimiento", {
        description: typeof data.chunkCount === "number" ? `Chunks indexados: ${data.chunkCount}` : undefined,
      })
      setFile(null)
      await loadDocs()
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error subiendo documento"
      toast.error("Error", { description: msg })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Database className="h-4 w-4 text-[#4a72ef]" />
              Base de Conocimiento (COPIBOT)
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Sube cotizaciones historicas (PDF/XLSX/CSV). COPIBOT las usa como referencias para generar borradores mas consistentes.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={loadDocs} disabled={loading}>
            <RefreshCcw className="mr-2 h-3.5 w-3.5" />
            Actualizar
          </Button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Input
              type="file"
              accept=".pdf,.xlsx,.xls,.csv,.txt,application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <p className="text-[11px] text-muted-foreground">
              Recomendado: PDF con texto seleccionable o Excel/CSV exportado desde tu sistema.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input value={client} onChange={(e) => setClient(e.target.value)} placeholder="Cliente (opcional)" />
            <Input value={date} onChange={(e) => setDate(e.target.value)} placeholder="Fecha (opcional)" />
            <Input value={total} onChange={(e) => setTotal(e.target.value)} placeholder="Total (opcional)" />
            <Input value={currency} onChange={(e) => setCurrency(e.target.value)} placeholder="Moneda (USD)" />
          </div>
        </div>

        <div className="mt-3">
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Notas (opcional)" />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button onClick={handleUpload} disabled={!canUpload} className="bg-[#4a72ef] hover:bg-[#2f54e0]">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
            Ingerir documento
          </Button>
          {file && (
            <Badge variant="secondary" className="max-w-full truncate">
              {file.name}
            </Badge>
          )}
          <span className="text-xs text-muted-foreground">
            Requiere Supabase + pgvector configurado.
          </span>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
        <h3 className="text-sm font-semibold">Documentos recientes</h3>
        <div className="mt-3 space-y-2 text-xs">
          {docs.length === 0 ? (
            <p className="text-muted-foreground">No hay documentos ingeridos aun.</p>
          ) : (
            docs.map((d) => (
              <div key={d.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2">
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">{d.source_name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {d.source_type} · {new Date(d.created_at).toLocaleString()}
                  </p>
                </div>
                <Badge variant="outline" className="text-[10px]">
                  {String((d.metadata || {}).client || "sin cliente")}
                </Badge>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

