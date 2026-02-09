"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { downloadDeliveryNotePDF, generateDeliveryNotePDFContent } from "@/lib/generate-delivery-note-pdf"
import { deleteDeliveryNote, getDeliveryNotes, saveDeliveryNote } from "@/lib/delivery-note-storage"
import type { DeliveryNoteData, DeliveryNoteItem } from "@/lib/delivery-note-types"
import { generateDeliveryNoteCode } from "@/lib/delivery-note-types"
import { Eye, FileDown, FilePlus, Pencil, RotateCcw, Save, Trash2 } from "lucide-react"
import { toast } from "sonner"

const EMPTY_ITEM = (): DeliveryNoteItem => ({
  id: crypto.randomUUID(),
  code: "S/N",
  description: "",
  quantity: 1,
})

interface DeliveryNotePreviewProps {
  data: DeliveryNoteData
}

function DeliveryNotePreview({ data }: DeliveryNotePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return

    try {
      const doc = iframe.contentDocument
      if (!doc) return
      doc.open()
      doc.write(generateDeliveryNotePDFContent(data))
      doc.close()
    } catch {
      // Preview errors are surfaced by the browser in the iframe itself.
    }
  }, [data])

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-2.5">
        <Eye className="h-3.5 w-3.5 text-muted-foreground" />
        <p className="text-xs font-medium text-muted-foreground">Vista Previa Nota de Entrega</p>
      </div>
      <iframe ref={iframeRef} title="Vista previa de nota de entrega" className="h-[700px] w-full bg-white" sandbox="allow-same-origin" />
    </div>
  )
}

export function DeliveryNoteBuilder() {
  const today = new Date().toISOString().split("T")[0]
  const [noteId, setNoteId] = useState<string>(() => crypto.randomUUID())
  const [noteCode, setNoteCode] = useState<string>(() => generateDeliveryNoteCode())
  const [issueDate, setIssueDate] = useState<string>(today)
  const [clientName, setClientName] = useState<string>("")
  const [attention, setAttention] = useState<string>("")
  const [clientIdentification, setClientIdentification] = useState<string>("")
  const [receiverName, setReceiverName] = useState<string>("")
  const [receiverIdentification, setReceiverIdentification] = useState<string>("")
  const [deliveredBy, setDeliveredBy] = useState<string>("Rafael Oviedo")
  const [notes, setNotes] = useState<string>("")
  const [items, setItems] = useState<DeliveryNoteItem[]>([EMPTY_ITEM()])
  const [activeTab, setActiveTab] = useState<"editor" | "preview">("editor")
  const [savedNotes, setSavedNotes] = useState<DeliveryNoteData[]>([])

  const refreshSavedNotes = useCallback(() => {
    setSavedNotes(getDeliveryNotes())
  }, [])

  useEffect(() => {
    refreshSavedNotes()
  }, [refreshSavedNotes])

  const buildData = useCallback(
    (): DeliveryNoteData => ({
      id: noteId,
      code: noteCode,
      issueDate,
      clientName,
      attention,
      clientIdentification,
      receiverName,
      receiverIdentification,
      deliveredBy,
      notes,
      items,
      createdAt: new Date().toISOString(),
      status: "borrador",
    }),
    [noteId, noteCode, issueDate, clientName, attention, clientIdentification, receiverName, receiverIdentification, deliveredBy, notes, items],
  )

  const clearForm = useCallback(() => {
    setNoteId(crypto.randomUUID())
    setNoteCode(generateDeliveryNoteCode())
    setIssueDate(today)
    setClientName("")
    setAttention("")
    setClientIdentification("")
    setReceiverName("")
    setReceiverIdentification("")
    setDeliveredBy("Rafael Oviedo")
    setNotes("")
    setItems([EMPTY_ITEM()])
    setActiveTab("editor")
  }, [today])

  const validate = useCallback(() => {
    if (!clientName.trim()) {
      toast.error("Debe ingresar el cliente")
      return false
    }

    const hasValidItem = items.some((item) => item.description.trim() && item.quantity > 0)
    if (!hasValidItem) {
      toast.error("Debe agregar al menos un item con descripcion y cantidad")
      return false
    }

    return true
  }, [clientName, items])

  const handleSave = useCallback(() => {
    if (!validate()) return

    const data = buildData()
    saveDeliveryNote(data)
    refreshSavedNotes()
    toast.success("Nota de entrega guardada")
  }, [validate, buildData, refreshSavedNotes])

  const handleExport = useCallback(() => {
    if (!validate()) return

    const data = buildData()
    saveDeliveryNote(data)
    downloadDeliveryNotePDF(data)
    refreshSavedNotes()
    toast.success("Nota de entrega generada para PDF")
  }, [validate, buildData, refreshSavedNotes])

  const addItem = useCallback(() => {
    setItems((prev) => [...prev, EMPTY_ITEM()])
  }, [])

  const updateItem = useCallback((id: string, field: keyof DeliveryNoteItem, value: string | number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    )
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems((prev) => {
      if (prev.length === 1) return prev
      return prev.filter((item) => item.id !== id)
    })
  }, [])

  const loadSaved = useCallback((data: DeliveryNoteData) => {
    setNoteId(data.id)
    setNoteCode(data.code)
    setIssueDate(data.issueDate)
    setClientName(data.clientName)
    setAttention(data.attention)
    setClientIdentification(data.clientIdentification)
    setReceiverName(data.receiverName)
    setReceiverIdentification(data.receiverIdentification)
    setDeliveredBy(data.deliveredBy)
    setNotes(data.notes)
    setItems(data.items.length > 0 ? data.items : [EMPTY_ITEM()])
    setActiveTab("editor")
    toast.success("Nota de entrega cargada")
  }, [])

  const handleDeleteSaved = useCallback(
    (id: string) => {
      deleteDeliveryNote(id)
      refreshSavedNotes()
      toast.success("Nota de entrega eliminada")
    },
    [refreshSavedNotes],
  )

  const previewData = useMemo(() => buildData(), [buildData])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold text-foreground">Nota de Entrega</h2>
          <p className="mt-1 text-sm text-muted-foreground">Estructura basada en formato NE Excel (ATENCION, CLIENTE, C.I, FECHA, items, RECIBE, ENTREGA, FIRMA).</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" size="sm" onClick={clearForm} className="w-full border-border bg-transparent text-muted-foreground hover:bg-muted sm:w-auto">
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            Limpiar
          </Button>
          <Button variant="outline" size="sm" onClick={handleSave} className="w-full border-[#1a5276] bg-transparent text-[#1a5276] hover:bg-[#1a5276] hover:text-white sm:w-auto">
            <Save className="mr-1.5 h-3.5 w-3.5" />
            Guardar
          </Button>
          <Button size="sm" onClick={handleExport} className="w-full bg-[#1a5276] text-white hover:bg-[#0e3a57] sm:w-auto">
            <FileDown className="mr-1.5 h-3.5 w-3.5" />
            Exportar PDF
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "editor" | "preview")}>
        <TabsList className="grid w-full max-w-xs grid-cols-2 bg-muted">
          <TabsTrigger value="editor" className="text-xs data-[state=active]:bg-[#1a5276] data-[state=active]:text-white">Editor</TabsTrigger>
          <TabsTrigger value="preview" className="text-xs data-[state=active]:bg-[#1a5276] data-[state=active]:text-white">Vista Previa</TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="mt-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Datos de la Nota</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="ne-code">Codigo NE</Label>
                <Input id="ne-code" value={noteCode} onChange={(e) => setNoteCode(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ne-date">Fecha</Label>
                <Input id="ne-date" type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ne-attention">Atencion</Label>
                <Input id="ne-attention" value={attention} onChange={(e) => setAttention(e.target.value)} />
              </div>
              <div className="space-y-2 sm:col-span-2 lg:col-span-2">
                <Label htmlFor="ne-client">Cliente</Label>
                <Input id="ne-client" value={clientName} onChange={(e) => setClientName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ne-client-id">C.I / RIF</Label>
                <Input id="ne-client-id" value={clientIdentification} onChange={(e) => setClientIdentification(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ne-receiver-name">Recibe (Nombre y Apellido)</Label>
                <Input id="ne-receiver-name" value={receiverName} onChange={(e) => setReceiverName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ne-receiver-id">Recibe C.I</Label>
                <Input id="ne-receiver-id" value={receiverIdentification} onChange={(e) => setReceiverIdentification(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ne-delivered-by">Entrega</Label>
                <Input id="ne-delivered-by" value={deliveredBy} onChange={(e) => setDeliveredBy(e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">Items Entregados</CardTitle>
              <Button type="button" size="sm" onClick={addItem} className="bg-[#1a5276] text-white hover:bg-[#0e3a57]">
                <FilePlus className="mr-1.5 h-3.5 w-3.5" />
                Agregar Item
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="grid gap-3 rounded-md border border-border p-3 sm:grid-cols-[1.2fr_2fr_0.8fr_auto] sm:items-end">
                  <div className="space-y-2">
                    <Label>Codigo/Modelo</Label>
                    <Input value={item.code} onChange={(e) => updateItem(item.id, "code", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Descripcion</Label>
                    <Input value={item.description} onChange={(e) => updateItem(item.id, "description", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Cantidad</Label>
                    <Input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, "quantity", Number(e.target.value) || 0)}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(item.id)}
                    className="h-9 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Observaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notas internas o aclaratorias de la entrega..." className="min-h-[90px]" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notas Guardadas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {savedNotes.length === 0 && <p className="text-sm text-muted-foreground">Aun no hay notas guardadas.</p>}
              {savedNotes.map((note) => (
                <div key={note.id} className="flex flex-col gap-3 rounded-md border border-border p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-mono text-xs font-semibold text-[#1a5276]">{note.code}</p>
                    <p className="text-sm text-foreground">{note.clientName || "Sin cliente"}</p>
                    <p className="text-xs text-muted-foreground">{note.issueDate}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => loadSaved(note)}>
                      <Pencil className="mr-1.5 h-3.5 w-3.5" />
                      Abrir
                    </Button>
                    <Button type="button" variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive" onClick={() => handleDeleteSaved(note.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="mt-6">
          <DeliveryNotePreview data={previewData} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

