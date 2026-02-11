"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { deleteTransportGuide, getTransportGuides, saveTransportGuide } from "@/lib/transport-guide-storage"
import { downloadTransportGuidePDF, generateTransportGuidePDFContent } from "@/lib/generate-transport-guide-pdf"
import type { TransportGuideData, TransportGuideItem } from "@/lib/transport-guide-types"
import { generateTransportGuideCode } from "@/lib/transport-guide-types"
import { Eye, FileDown, FilePlus, Pencil, RotateCcw, Save, Trash2 } from "lucide-react"
import { toast } from "sonner"

const EMPTY_ITEM = (): TransportGuideItem => ({
  id: crypto.randomUUID(),
  description: "",
  quantity: 1,
})

function buildDefaultBody(params: {
  authorizedName: string
  authorizedIdentification: string
  vehicleDescription: string
  origin: string
  destination: string
  companyName: string
  companyRif: string
  contacts: string
}): string {
  return `Se notifica que ${params.authorizedName || "[NOMBRE AUTORIZADO]"}, portador de la cédula de identidad ${params.authorizedIdentification || "[CI]"}, está autorizado para transportar en ${params.vehicleDescription || "[VEHICULO]"} equipos propiedad de ${params.companyName || "COP'S ELECTRONICS, S.A."}, R.I.F ${params.companyRif || "J-30513629-7"}.

Dichos equipos están siendo transportados desde ${params.origin || "[ORIGEN]"} hacia ${params.destination || "[DESTINO]"}.

Solicitamos a las autoridades competentes prestar la colaboración pertinente.

Para información adicional favor comunicarse a: ${params.contacts || "0212-7934136 / 0212-7940316"}.`
}

function TransportGuidePreview({ data }: { data: TransportGuideData }) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return
    try {
      const doc = iframe.contentDocument
      if (!doc) return
      doc.open()
      doc.write(generateTransportGuidePDFContent(data))
      doc.close()
    } catch {
      // Browser handles iframe rendering errors.
    }
  }, [data])

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-2.5">
        <Eye className="h-3.5 w-3.5 text-muted-foreground" />
        <p className="text-xs font-medium text-muted-foreground">Vista Previa Guia de Transporte</p>
      </div>
      <iframe ref={iframeRef} title="Vista previa de guia de transporte" className="h-[700px] w-full bg-white" sandbox="allow-same-origin" />
    </div>
  )
}

export function TransportGuideBuilder() {
  const today = new Date().toISOString().split("T")[0]

  const [guideId, setGuideId] = useState<string>(() => crypto.randomUUID())
  const [code, setCode] = useState<string>(() => generateTransportGuideCode())
  const [issueDate, setIssueDate] = useState<string>(today)
  const [recipient, setRecipient] = useState<string>("A QUIEN PUEDA INTERESAR")
  const [authorizedName, setAuthorizedName] = useState<string>("")
  const [authorizedIdentification, setAuthorizedIdentification] = useState<string>("")
  const [vehicleDescription, setVehicleDescription] = useState<string>("")
  const [origin, setOrigin] = useState<string>("")
  const [destination, setDestination] = useState<string>("")
  const [companyName, setCompanyName] = useState<string>("COP'S ELECTRONICS, S.A")
  const [companyRif, setCompanyRif] = useState<string>("J-30513629-7")
  const [contacts, setContacts] = useState<string>("0212-7934136 / 0212-7940316 / 0414-3217923 / 0414-1102544")
  const [signName, setSignName] = useState<string>("Rafael Oviedo")
  const [signIdentification, setSignIdentification] = useState<string>("26.953.856")
  const [signTitle, setSignTitle] = useState<string>("Coordinador de Proyectos y Servicios")
  const [items, setItems] = useState<TransportGuideItem[]>([EMPTY_ITEM()])
  const [bodyText, setBodyText] = useState<string>("")
  const [extraNotes, setExtraNotes] = useState<string>("")
  const [activeTab, setActiveTab] = useState<"editor" | "preview">("editor")
  const [savedGuides, setSavedGuides] = useState<TransportGuideData[]>([])

  const refreshSavedGuides = useCallback(() => {
    setSavedGuides(getTransportGuides())
  }, [])

  useEffect(() => {
    refreshSavedGuides()
  }, [refreshSavedGuides])

  useEffect(() => {
    if (!bodyText.trim()) {
      setBodyText(
        buildDefaultBody({
          authorizedName,
          authorizedIdentification,
          vehicleDescription,
          origin,
          destination,
          companyName,
          companyRif,
          contacts,
        }),
      )
    }
  }, [bodyText, authorizedName, authorizedIdentification, vehicleDescription, origin, destination, companyName, companyRif, contacts])

  const applyTemplate = useCallback(() => {
    setBodyText(
      buildDefaultBody({
        authorizedName,
        authorizedIdentification,
        vehicleDescription,
        origin,
        destination,
        companyName,
        companyRif,
        contacts,
      }),
    )
  }, [authorizedName, authorizedIdentification, vehicleDescription, origin, destination, companyName, companyRif, contacts])

  const buildData = useCallback(
    (): TransportGuideData => ({
      id: guideId,
      code,
      issueDate,
      recipient,
      authorizedName,
      authorizedIdentification,
      vehicleDescription,
      origin,
      destination,
      companyName,
      companyRif,
      contacts,
      signName,
      signIdentification,
      signTitle,
      items,
      bodyText,
      extraNotes,
      createdAt: new Date().toISOString(),
      status: "borrador",
    }),
    [guideId, code, issueDate, recipient, authorizedName, authorizedIdentification, vehicleDescription, origin, destination, companyName, companyRif, contacts, signName, signIdentification, signTitle, items, bodyText, extraNotes],
  )

  const clearForm = useCallback(() => {
    setGuideId(crypto.randomUUID())
    setCode(generateTransportGuideCode())
    setIssueDate(today)
    setRecipient("A QUIEN PUEDA INTERESAR")
    setAuthorizedName("")
    setAuthorizedIdentification("")
    setVehicleDescription("")
    setOrigin("")
    setDestination("")
    setCompanyName("COP'S ELECTRONICS, S.A")
    setCompanyRif("J-30513629-7")
    setContacts("0212-7934136 / 0212-7940316 / 0414-3217923 / 0414-1102544")
    setSignName("Rafael Oviedo")
    setSignIdentification("26.953.856")
    setSignTitle("Coordinador de Proyectos y Servicios")
    setItems([EMPTY_ITEM()])
    setBodyText("")
    setExtraNotes("")
    setActiveTab("editor")
  }, [today])

  const validate = useCallback(() => {
    if (!authorizedName.trim()) {
      toast.error("Debe indicar la persona autorizada")
      return false
    }
    if (!bodyText.trim()) {
      toast.error("Debe completar el texto de la guia")
      return false
    }
    return true
  }, [authorizedName, bodyText])

  const handleSave = useCallback(() => {
    if (!validate()) return
    const data = buildData()
    saveTransportGuide(data)
    refreshSavedGuides()
    toast.success("Guia de transporte guardada")
  }, [validate, buildData, refreshSavedGuides])

  const handleExport = useCallback(async () => {
    if (!validate()) return
    const data = buildData()
    saveTransportGuide(data)
    try {
      await downloadTransportGuidePDF(data)
      refreshSavedGuides()
      toast.success("Guia de transporte PDF generada")
    } catch {
      toast.error("No se pudo generar el PDF de la guia")
    }
  }, [validate, buildData, refreshSavedGuides])

  const updateItem = useCallback((id: string, field: keyof TransportGuideItem, value: string | number) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }, [])

  const addItem = useCallback(() => setItems((prev) => [...prev, EMPTY_ITEM()]), [])
  const removeItem = useCallback((id: string) => {
    setItems((prev) => (prev.length === 1 ? prev : prev.filter((item) => item.id !== id)))
  }, [])

  const openSaved = useCallback((data: TransportGuideData) => {
    setGuideId(data.id)
    setCode(data.code)
    setIssueDate(data.issueDate)
    setRecipient(data.recipient)
    setAuthorizedName(data.authorizedName)
    setAuthorizedIdentification(data.authorizedIdentification)
    setVehicleDescription(data.vehicleDescription)
    setOrigin(data.origin)
    setDestination(data.destination)
    setCompanyName(data.companyName)
    setCompanyRif(data.companyRif)
    setContacts(data.contacts)
    setSignName(data.signName)
    setSignIdentification(data.signIdentification)
    setSignTitle(data.signTitle)
    setItems(data.items.length > 0 ? data.items : [EMPTY_ITEM()])
    setBodyText(data.bodyText)
    setExtraNotes(data.extraNotes)
    setActiveTab("editor")
    toast.success("Guia cargada")
  }, [])

  const handleDeleteSaved = useCallback((id: string) => {
    deleteTransportGuide(id)
    refreshSavedGuides()
    toast.success("Guia eliminada")
  }, [refreshSavedGuides])

  const previewData = useMemo(() => buildData(), [buildData])

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold text-foreground">Guia de Transporte</h2>
          <p className="mt-1 text-sm text-muted-foreground">Documento predeterminado editable, basado en tu formato oficial 2025.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Button variant="outline" size="sm" onClick={clearForm} className="w-full border-border bg-transparent text-muted-foreground hover:bg-muted sm:w-auto">
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            Limpiar
          </Button>
          <Button variant="outline" size="sm" onClick={handleSave} className="w-full border-[#4a72ef] bg-transparent text-[#4a72ef] hover:bg-[#4a72ef] hover:text-white sm:w-auto">
            <Save className="mr-1.5 h-3.5 w-3.5" />
            Guardar
          </Button>
          <Button size="sm" onClick={handleExport} className="w-full bg-[#4a72ef] text-white hover:bg-[#2f54e0] sm:w-auto">
            <FileDown className="mr-1.5 h-3.5 w-3.5" />
            Exportar PDF
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "editor" | "preview")}>
        <TabsList className="grid w-full max-w-xs grid-cols-2 bg-muted">
          <TabsTrigger value="editor" className="text-xs data-[state=active]:bg-[#4a72ef] data-[state=active]:text-white">Editor</TabsTrigger>
          <TabsTrigger value="preview" className="text-xs data-[state=active]:bg-[#4a72ef] data-[state=active]:text-white">Vista Previa</TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="mt-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Datos Principales</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2"><Label>Codigo GT</Label><Input value={code} onChange={(e) => setCode(e.target.value)} /></div>
              <div className="space-y-2"><Label>Fecha</Label><Input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} /></div>
              <div className="space-y-2 lg:col-span-1"><Label>Dirigido a</Label><Input value={recipient} onChange={(e) => setRecipient(e.target.value)} /></div>
              <div className="space-y-2"><Label>Persona autorizada</Label><Input value={authorizedName} onChange={(e) => setAuthorizedName(e.target.value)} /></div>
              <div className="space-y-2"><Label>C.I autorizada</Label><Input value={authorizedIdentification} onChange={(e) => setAuthorizedIdentification(e.target.value)} /></div>
              <div className="space-y-2"><Label>Vehiculo</Label><Input value={vehicleDescription} onChange={(e) => setVehicleDescription(e.target.value)} /></div>
              <div className="space-y-2"><Label>Origen</Label><Input value={origin} onChange={(e) => setOrigin(e.target.value)} /></div>
              <div className="space-y-2"><Label>Destino</Label><Input value={destination} onChange={(e) => setDestination(e.target.value)} /></div>
              <div className="space-y-2"><Label>Empresa</Label><Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} /></div>
              <div className="space-y-2"><Label>RIF</Label><Input value={companyRif} onChange={(e) => setCompanyRif(e.target.value)} /></div>
              <div className="space-y-2 sm:col-span-2"><Label>Contactos</Label><Input value={contacts} onChange={(e) => setContacts(e.target.value)} /></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">Productos a Transportar</CardTitle>
              <Button type="button" size="sm" onClick={addItem} className="bg-[#4a72ef] text-white hover:bg-[#2f54e0]"><FilePlus className="mr-1.5 h-3.5 w-3.5" />Agregar Item</Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="grid gap-3 rounded-md border border-border p-3 sm:grid-cols-[0.8fr_2fr_auto] sm:items-end">
                  <div className="space-y-2"><Label>Cantidad</Label><Input type="number" min={1} value={item.quantity} onFocus={(e) => e.currentTarget.select()} onChange={(e) => updateItem(item.id, "quantity", e.target.value === "" ? 0 : Number(e.target.value))} /></div>
                  <div className="space-y-2"><Label>Descripcion</Label><Input value={item.description} onChange={(e) => updateItem(item.id, "description", e.target.value)} /></div>
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(item.id)} className="h-9 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">Texto Predeterminado (Editable)</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={applyTemplate}>Actualizar con Datos</Button>
            </CardHeader>
            <CardContent>
              <Textarea value={bodyText} onChange={(e) => setBodyText(e.target.value)} className="min-h-[180px]" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Firma y Notas</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Firmante</Label><Input value={signName} onChange={(e) => setSignName(e.target.value)} /></div>
              <div className="space-y-2"><Label>C.I Firmante</Label><Input value={signIdentification} onChange={(e) => setSignIdentification(e.target.value)} /></div>
              <div className="space-y-2 sm:col-span-2"><Label>Cargo</Label><Input value={signTitle} onChange={(e) => setSignTitle(e.target.value)} /></div>
              <div className="space-y-2 sm:col-span-2"><Label>Notas adicionales</Label><Textarea value={extraNotes} onChange={(e) => setExtraNotes(e.target.value)} className="min-h-[90px]" /></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Guias Guardadas</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {savedGuides.length === 0 && <p className="text-sm text-muted-foreground">Aun no hay guias guardadas.</p>}
              {savedGuides.map((guide) => (
                <div key={guide.id} className="flex flex-col gap-3 rounded-md border border-border p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-mono text-xs font-semibold text-[#4a72ef]">{guide.code}</p>
                    <p className="text-sm text-foreground">{guide.authorizedName || "Sin autorizado"}</p>
                    <p className="text-xs text-muted-foreground">{guide.issueDate}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => openSaved(guide)}><Pencil className="mr-1.5 h-3.5 w-3.5" />Abrir</Button>
                    <Button type="button" variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive" onClick={() => handleDeleteSaved(guide.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="mt-6">
          <TransportGuidePreview data={previewData} />
        </TabsContent>
      </Tabs>
    </div>
  )
}




