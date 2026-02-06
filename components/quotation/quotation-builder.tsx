"use client"

import { useState, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ClientInfoForm } from "./client-info-form"
import { ItemsSection } from "./items-table"
import { LaborSection } from "./labor-section"
import { SummaryPanel } from "./summary-panel"
import { PDFPreview } from "./pdf-preview"
import { downloadPDF } from "@/lib/generate-pdf"
import { saveQuotation } from "@/lib/quotation-storage"
import type { ClientInfo, QuotationItem, QuotationType, QuotationData, LaborItem } from "@/lib/quotation-types"
import { generateQuotationCode, PAYMENT_CONDITIONS, DEFAULT_TERMS } from "@/lib/quotation-types"
import { FileDown, Eye, PenLine, RotateCcw, Save, Package, Cable } from "lucide-react"
import { toast } from "sonner"

interface QuotationBuilderProps {
  initialData?: QuotationData | null
  onSaved?: () => void
}

export function QuotationBuilder({ initialData, onSaved }: QuotationBuilderProps) {
  const today = new Date().toISOString().split("T")[0]
  const validDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

  const [quotationId] = useState(() => initialData?.id || crypto.randomUUID())
  const [quotationType, setQuotationType] = useState<QuotationType>(initialData?.type || "proyecto")
  const [quotationCode, setQuotationCode] = useState(() => initialData?.code || generateQuotationCode("proyecto"))
  const [companyFormat, setCompanyFormat] = useState<"sa" | "llc">(initialData?.companyFormat || "sa")
  const [subject, setSubject] = useState(initialData?.subject || "")
  const [issueDate, setIssueDate] = useState(initialData?.issueDate || today)
  const [validUntil, setValidUntil] = useState(initialData?.validUntil || validDate)
  const [paymentCondition, setPaymentCondition] = useState(initialData?.paymentCondition || PAYMENT_CONDITIONS[0])

  const [clientInfo, setClientInfo] = useState<ClientInfo>(
    initialData?.clientInfo || { name: "", attention: "", email: "", rif: "", phone: "", address: "" }
  )

  const [equipmentItems, setEquipmentItems] = useState<QuotationItem[]>(initialData?.items || [])
  const [materialItems, setMaterialItems] = useState<QuotationItem[]>(initialData?.materials || [])
  const [laborItems, setLaborItems] = useState<LaborItem[]>(initialData?.laborItems || [])
  const [notes, setNotes] = useState(initialData?.notes || "")
  const [termsAndConditions, setTermsAndConditions] = useState(initialData?.termsAndConditions || DEFAULT_TERMS)
  const [activeTab, setActiveTab] = useState("editor")

  const ivaRate = 16

  const calculations = useMemo(() => {
    const subtotalEquipment = equipmentItems.reduce((sum, item) => sum + item.totalPrice, 0)
    const subtotalMaterials = materialItems.reduce((sum, item) => sum + item.totalPrice, 0)
    const subtotalLabor = laborItems.reduce((sum, item) => sum + item.cost, 0)
    const baseImponible = subtotalEquipment + subtotalMaterials + subtotalLabor
    const ivaAmount = baseImponible * (ivaRate / 100)
    const total = baseImponible + ivaAmount
    return { subtotalEquipment, subtotalMaterials, subtotalLabor, ivaAmount, total }
  }, [equipmentItems, materialItems, laborItems, ivaRate])

  const handleTypeChange = useCallback((type: QuotationType) => {
    setQuotationType(type)
    setQuotationCode(generateQuotationCode(type))
  }, [])

  const buildData = useCallback((): QuotationData => ({
    id: quotationId,
    code: quotationCode,
    type: quotationType,
    companyFormat,
    subject,
    clientInfo,
    items: equipmentItems,
    materials: materialItems,
    laborItems,
    issueDate,
    validUntil,
    notes,
    termsAndConditions,
    paymentCondition,
    subtotalEquipment: calculations.subtotalEquipment,
    subtotalMaterials: calculations.subtotalMaterials,
    subtotalLabor: calculations.subtotalLabor,
    ivaRate,
    ivaAmount: calculations.ivaAmount,
    total: calculations.total,
    createdAt: initialData?.createdAt || new Date().toISOString(),
    status: initialData?.status || "borrador",
  }), [quotationId, quotationCode, quotationType, companyFormat, subject, clientInfo, equipmentItems, materialItems, laborItems, issueDate, validUntil, notes, termsAndConditions, paymentCondition, calculations, ivaRate, initialData])

  const handleSave = () => {
    if (!clientInfo.name) {
      toast.error("Debe ingresar el nombre del cliente")
      return
    }
    const data = buildData()
    saveQuotation(data)
    toast.success("Cotizacion guardada en el historial")
    onSaved?.()
  }

  const handleExportPDF = () => {
    if (!clientInfo.name) {
      toast.error("Debe ingresar el nombre del cliente")
      return
    }
    if (equipmentItems.length === 0 && materialItems.length === 0) {
      toast.error("Debe agregar al menos un item")
      return
    }
    const data = buildData()
    saveQuotation(data)
    downloadPDF(data)
    toast.success("Documento generado para impresion/PDF")
    onSaved?.()
  }

  const handleReset = () => {
    setQuotationType("proyecto")
    setQuotationCode(generateQuotationCode("proyecto"))
    setCompanyFormat("sa")
    setSubject("")
    setIssueDate(today)
    setValidUntil(validDate)
    setPaymentCondition(PAYMENT_CONDITIONS[0])
    setClientInfo({ name: "", attention: "", email: "", rif: "", phone: "", address: "" })
    setEquipmentItems([])
    setMaterialItems([])
    setLaborItems([])
    setNotes("")
    setTermsAndConditions(DEFAULT_TERMS)
    setActiveTab("editor")
    toast.info("Formulario reiniciado")
  }

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold text-foreground">
            {initialData ? "Editar Cotizacion" : "Nueva Cotizacion"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {quotationCode} &middot; {quotationType === "proyecto" ? "Proyecto" : quotationType === "servicio" ? "Servicio" : "Mantenimiento Preventivo"}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="w-full border-border bg-transparent text-muted-foreground hover:bg-muted sm:w-auto"
          >
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            Limpiar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            className="w-full border-[#1a5276] bg-transparent text-[#1a5276] hover:bg-[#1a5276] hover:text-white sm:w-auto"
          >
            <Save className="mr-1.5 h-3.5 w-3.5" />
            Guardar
          </Button>
          <Button
            size="sm"
            onClick={handleExportPDF}
            className="w-full bg-[#1a5276] text-white hover:bg-[#0e3a57] sm:w-auto"
          >
            <FileDown className="mr-1.5 h-3.5 w-3.5" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-xs grid-cols-2 bg-muted">
          <TabsTrigger
            value="editor"
            className="flex items-center gap-1.5 text-xs data-[state=active]:bg-[#1a5276] data-[state=active]:text-white"
          >
            <PenLine className="h-3.5 w-3.5" />
            Editor
          </TabsTrigger>
          <TabsTrigger
            value="preview"
            className="flex items-center gap-1.5 text-xs data-[state=active]:bg-[#1a5276] data-[state=active]:text-white"
          >
            <Eye className="h-3.5 w-3.5" />
            Vista Previa
          </TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="mt-6 space-y-4">
          <ClientInfoForm
            clientInfo={clientInfo}
            quotationCode={quotationCode}
            quotationType={quotationType}
            companyFormat={companyFormat}
            subject={subject}
            issueDate={issueDate}
            validUntil={validUntil}
            paymentCondition={paymentCondition}
            onClientInfoChange={setClientInfo}
            onTypeChange={handleTypeChange}
            onCompanyFormatChange={setCompanyFormat}
            onSubjectChange={setSubject}
            onIssueDateChange={setIssueDate}
            onValidUntilChange={setValidUntil}
            onPaymentConditionChange={setPaymentCondition}
            onCodeChange={setQuotationCode}
          />

          <ItemsSection
            title="Equipos y Servicios"
            icon={<Package className="h-4 w-4 text-[#1a5276]" />}
            items={equipmentItems}
            onItemsChange={setEquipmentItems}
            catalogFilter="Equipos"
          />

          <ItemsSection
            title="Materiales e Insumos"
            icon={<Cable className="h-4 w-4 text-[#1a5276]" />}
            items={materialItems}
            onItemsChange={setMaterialItems}
            catalogFilter="Materiales"
          />

          <LaborSection
            laborItems={laborItems}
            onLaborItemsChange={setLaborItems}
          />

          <SummaryPanel
            subtotalEquipment={calculations.subtotalEquipment}
            subtotalMaterials={calculations.subtotalMaterials}
            subtotalLabor={calculations.subtotalLabor}
            ivaRate={ivaRate}
            ivaAmount={calculations.ivaAmount}
            total={calculations.total}
            notes={notes}
            termsAndConditions={termsAndConditions}
            onNotesChange={setNotes}
            onTermsChange={setTermsAndConditions}
          />
        </TabsContent>

        <TabsContent value="preview" className="mt-6">
          <PDFPreview data={buildData()} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
