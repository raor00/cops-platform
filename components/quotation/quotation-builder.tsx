"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ClientInfoForm } from "./client-info-form"
import { ItemsSection } from "./items-table"
import { LaborSection } from "./labor-section"
import { SummaryPanel } from "./summary-panel"
import { PDFPreview } from "./pdf-preview"
import { downloadPDF } from "@/lib/generate-pdf"
import { saveQuotation, getCatalog, getCatalogDiscountConfig } from "@/lib/quotation-storage"
import type { ClientInfo, QuotationItem, QuotationType, QuotationData, LaborItem, DiscountMode } from "@/lib/quotation-types"
import { generateQuotationCode, PAYMENT_CONDITIONS, DEFAULT_TERMS, PAYMENT_CONDITIONS_LLC, DEFAULT_TERMS_LLC } from "@/lib/quotation-types"
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
  const [paymentCondition, setPaymentCondition] = useState(
    initialData?.paymentCondition || (initialData?.companyFormat === "llc" ? PAYMENT_CONDITIONS_LLC[0] : PAYMENT_CONDITIONS[0])
  )

  const [clientInfo, setClientInfo] = useState<ClientInfo>(() => {
    const base: ClientInfo = {
      name: "",
      attention: "",
      email: "",
      rif: "",
      phone: "",
      address: "",
      customerId: "",
      billToName: "",
      billToAttention: "",
      billToEmail: "",
      billToPhone: "",
      billToAddress: "",
      shipToName: "",
      shipToAttention: "",
      shipToEmail: "",
      shipToPhone: "",
      shipToAddress: "",
    }
    return initialData?.clientInfo ? { ...base, ...initialData.clientInfo } : base
  })

  const [equipmentItems, setEquipmentItems] = useState<QuotationItem[]>(initialData?.items || [])
  const [materialItems, setMaterialItems] = useState<QuotationItem[]>(initialData?.materials || [])
  const [laborItems, setLaborItems] = useState<LaborItem[]>(initialData?.laborItems || [])
  const [notes, setNotes] = useState(initialData?.notes || "")
  const [discountMode, setDiscountMode] = useState<DiscountMode>(initialData?.discountMode || "amount")
  const [discountValue, setDiscountValue] = useState(initialData?.discountValue ?? initialData?.discountAmount ?? 0)
  const [llcTaxRate, setLlcTaxRate] = useState(() =>
    initialData?.companyFormat === "llc" ? (initialData?.ivaRate || 0) : 0
  )
  const [saTerms, setSaTerms] = useState(() =>
    initialData?.companyFormat === "sa"
      ? initialData?.termsAndConditions || DEFAULT_TERMS
      : DEFAULT_TERMS
  )
  const [llcTerms, setLlcTerms] = useState(() =>
    initialData?.companyFormat === "llc"
      ? initialData?.termsAndConditions || DEFAULT_TERMS_LLC
      : DEFAULT_TERMS_LLC
  )
  const [termsAndConditions, setTermsAndConditions] = useState(
    initialData?.termsAndConditions || (initialData?.companyFormat === "llc" ? DEFAULT_TERMS_LLC : DEFAULT_TERMS)
  )
  const [saPayment, setSaPayment] = useState(() =>
    initialData?.companyFormat === "sa"
      ? initialData?.paymentCondition || PAYMENT_CONDITIONS[0]
      : PAYMENT_CONDITIONS[0]
  )
  const [llcPayment, setLlcPayment] = useState(() =>
    initialData?.companyFormat === "llc"
      ? initialData?.paymentCondition || PAYMENT_CONDITIONS_LLC[0]
      : PAYMENT_CONDITIONS_LLC[0]
  )
  const [activeTab, setActiveTab] = useState("editor")

  const taxRate = companyFormat === "llc" ? llcTaxRate : 16

  const calculations = useMemo(() => {
    const subtotalEquipment = equipmentItems.reduce((sum, item) => sum + item.totalPrice, 0)
    const subtotalMaterials = materialItems.reduce((sum, item) => sum + item.totalPrice, 0)
    const subtotalLabor = laborItems.reduce((sum, item) => sum + item.cost, 0)
    const baseImponible = subtotalEquipment + subtotalMaterials + subtotalLabor
    const requestedDiscount = discountMode === "percentage"
      ? baseImponible * (Math.max(discountValue, 0) / 100)
      : Math.max(discountValue, 0)
    const safeDiscount = Math.min(requestedDiscount, baseImponible)
    const taxableBase = baseImponible - safeDiscount
    const ivaAmount = taxableBase * (taxRate / 100)
    const total = taxableBase + ivaAmount
    return { subtotalEquipment, subtotalMaterials, subtotalLabor, ivaAmount, total, baseImponible, safeDiscount, taxableBase }
  }, [equipmentItems, materialItems, laborItems, taxRate, discountMode, discountValue])

  useEffect(() => {
    const applyCatalogDiscounts = () => {
      const catalog = getCatalog()
      const config = getCatalogDiscountConfig()

      const catalogMap = new Map(
        catalog.map((item) => [item.code.trim().toLowerCase(), item]),
      )

      const applyList = (list: QuotationItem[]) =>
        list.map((item) => {
          const catalogItem = catalogMap.get(item.code.trim().toLowerCase())
          if (!catalogItem) return item

          const matchesScope =
            config.scope === "all" ||
            (config.scope === "category" && catalogItem.category === config.category) ||
            (config.scope === "subcategory" && (catalogItem.subcategory || "General") === config.subcategory)

          const basePrice = catalogItem.unitPrice
          const discounted = config.enabled && config.value > 0 && matchesScope
            ? (config.mode === "percentage"
              ? basePrice * (1 - config.value / 100)
              : basePrice - config.value)
            : basePrice
          const nextPrice = Math.max(0, Number(discounted.toFixed(2)))

          if (Math.abs(nextPrice - item.unitPrice) < 0.0001) return item

          return {
            ...item,
            unitPrice: nextPrice,
            totalPrice: Number((item.quantity * nextPrice).toFixed(2)),
            category: catalogItem.category,
            subcategory: catalogItem.subcategory || "General",
          }
        })

      setEquipmentItems((prev) => applyList(prev))
      setMaterialItems((prev) => applyList(prev))
    }

    applyCatalogDiscounts()
    window.addEventListener("catalog-updated", applyCatalogDiscounts)
    return () => window.removeEventListener("catalog-updated", applyCatalogDiscounts)
  }, [])

  const handleTypeChange = useCallback((type: QuotationType) => {
    setQuotationType(type)
    setQuotationCode(generateQuotationCode(type))
  }, [])

  const buildData = useCallback((): QuotationData => ({
    id: quotationId,
    code: quotationCode,
    type: quotationType,
    companyFormat,
    discountMode,
    discountValue: Math.max(discountValue, 0),
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
    discountAmount: calculations.safeDiscount,
    subtotalEquipment: calculations.subtotalEquipment,
    subtotalMaterials: calculations.subtotalMaterials,
    subtotalLabor: calculations.subtotalLabor,
    ivaRate: taxRate,
    ivaAmount: calculations.ivaAmount,
    total: calculations.total,
    createdAt: initialData?.createdAt || new Date().toISOString(),
    status: initialData?.status || "borrador",
  }), [quotationId, quotationCode, quotationType, companyFormat, discountMode, discountValue, subject, clientInfo, equipmentItems, materialItems, laborItems, issueDate, validUntil, notes, termsAndConditions, paymentCondition, calculations, taxRate, initialData])

  const handleSave = () => {
    const clientName = companyFormat === "llc" ? (clientInfo.billToName || clientInfo.name) : clientInfo.name
    if (!clientName) {
      toast.error(companyFormat === "llc" ? "Please enter the client name" : "Debe ingresar el nombre del cliente")
      return
    }
    const data = buildData()
    saveQuotation(data)
    toast.success(companyFormat === "llc" ? "Quote saved to history" : "Cotizacion guardada en el historial")
    onSaved?.()
  }

  const handleExportPDF = async () => {
    const clientName = companyFormat === "llc" ? (clientInfo.billToName || clientInfo.name) : clientInfo.name
    if (!clientName) {
      toast.error(companyFormat === "llc" ? "Please enter the client name" : "Debe ingresar el nombre del cliente")
      return
    }
    if (equipmentItems.length === 0 && materialItems.length === 0 && laborItems.length === 0) {
      toast.error(companyFormat === "llc" ? "Please add at least one item" : "Debe agregar al menos un item")
      return
    }
    const data = buildData()
    saveQuotation(data)
    try {
      await downloadPDF(data)
      toast.success(companyFormat === "llc" ? "Document generated for PDF download" : "Documento PDF generado")
      onSaved?.()
    } catch {
      toast.error(companyFormat === "llc" ? "Could not generate PDF" : "No se pudo generar el PDF")
    }
  }

  const handleReset = () => {
    setQuotationType("proyecto")
    setQuotationCode(generateQuotationCode("proyecto"))
    setCompanyFormat("sa")
    setSubject("")
    setIssueDate(today)
    setValidUntil(validDate)
    setPaymentCondition(PAYMENT_CONDITIONS[0])
    setClientInfo({
      name: "",
      attention: "",
      email: "",
      rif: "",
      phone: "",
      address: "",
      customerId: "",
      billToName: "",
      billToAttention: "",
      billToEmail: "",
      billToPhone: "",
      billToAddress: "",
      shipToName: "",
      shipToAttention: "",
      shipToEmail: "",
      shipToPhone: "",
      shipToAddress: "",
    })
    setEquipmentItems([])
    setMaterialItems([])
    setLaborItems([])
    setNotes("")
    setDiscountMode("amount")
    setDiscountValue(0)
    setLlcTaxRate(0)
    setTermsAndConditions(DEFAULT_TERMS)
    setSaTerms(DEFAULT_TERMS)
    setLlcTerms(DEFAULT_TERMS_LLC)
    setSaPayment(PAYMENT_CONDITIONS[0])
    setLlcPayment(PAYMENT_CONDITIONS_LLC[0])
    setActiveTab("editor")
    toast.info(companyFormat === "llc" ? "Form reset" : "Formulario reiniciado")
  }

  const handleCompanyFormatChange = useCallback((format: "sa" | "llc") => {
    setCompanyFormat(format)
    if (format === "llc") {
      setPaymentCondition(llcPayment)
      setTermsAndConditions(llcTerms)
    } else {
      setPaymentCondition(saPayment)
      setTermsAndConditions(saTerms)
    }
  }, [llcPayment, llcTerms, saPayment, saTerms])

  const handlePaymentConditionChange = useCallback((condition: string) => {
    setPaymentCondition(condition)
    if (companyFormat === "llc") {
      setLlcPayment(condition)
    } else {
      setSaPayment(condition)
    }
  }, [companyFormat])

  const handleTermsChange = useCallback((value: string) => {
    setTermsAndConditions(value)
    if (companyFormat === "llc") {
      setLlcTerms(value)
    } else {
      setSaTerms(value)
    }
  }, [companyFormat])

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold text-foreground">
            {companyFormat === "llc"
              ? (initialData ? "Edit Quote" : "New Quote")
              : (initialData ? "Editar Cotizacion" : "Nueva Cotizacion")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {quotationCode} &middot; {quotationType === "proyecto"
              ? (companyFormat === "llc" ? "Project" : "Proyecto")
              : quotationType === "servicio"
                ? (companyFormat === "llc" ? "Service" : "Servicio")
                : (companyFormat === "llc" ? "Preventive Maintenance" : "Mantenimiento Preventivo")}
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
            {companyFormat === "llc" ? "Reset" : "Limpiar"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            className="w-full border-[#1a5276] bg-transparent text-[#1a5276] hover:bg-[#1a5276] hover:text-white sm:w-auto"
          >
            <Save className="mr-1.5 h-3.5 w-3.5" />
            {companyFormat === "llc" ? "Save" : "Guardar"}
          </Button>
          <Button
            size="sm"
            onClick={handleExportPDF}
            className="w-full bg-[#1a5276] text-white hover:bg-[#0e3a57] sm:w-auto"
          >
            <FileDown className="mr-1.5 h-3.5 w-3.5" />
            {companyFormat === "llc" ? "Export PDF" : "Exportar PDF"}
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
            {companyFormat === "llc" ? "Preview" : "Vista Previa"}
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
            onCompanyFormatChange={handleCompanyFormatChange}
            onSubjectChange={setSubject}
            onIssueDateChange={setIssueDate}
            onValidUntilChange={setValidUntil}
            onPaymentConditionChange={handlePaymentConditionChange}
            onCodeChange={setQuotationCode}
          />

          <ItemsSection
            title={companyFormat === "llc" ? "Equipment & Services" : "Equipos y Servicios"}
            icon={<Package className="h-4 w-4 text-[#1a5276]" />}
            items={equipmentItems}
            onItemsChange={setEquipmentItems}
            catalogFilter="Equipos"
            companyFormat={companyFormat}
          />

          <ItemsSection
            title={companyFormat === "llc" ? "Materials & Supplies" : "Materiales e Insumos"}
            icon={<Cable className="h-4 w-4 text-[#1a5276]" />}
            items={materialItems}
            onItemsChange={setMaterialItems}
            catalogFilter="Materiales"
            companyFormat={companyFormat}
          />

          <LaborSection
            laborItems={laborItems}
            onLaborItemsChange={setLaborItems}
            companyFormat={companyFormat}
          />

          <SummaryPanel
            subtotalEquipment={calculations.subtotalEquipment}
            subtotalMaterials={calculations.subtotalMaterials}
            subtotalLabor={calculations.subtotalLabor}
            ivaRate={taxRate}
            ivaAmount={calculations.ivaAmount}
            total={calculations.total}
            notes={notes}
            termsAndConditions={termsAndConditions}
            onNotesChange={setNotes}
            onTermsChange={handleTermsChange}
            companyFormat={companyFormat}
            taxRate={taxRate}
            discountMode={discountMode}
            discountValue={discountValue}
            discountAmount={calculations.safeDiscount}
            onDiscountModeChange={setDiscountMode}
            onDiscountChange={setDiscountValue}
            onTaxRateChange={setLlcTaxRate}
          />
        </TabsContent>

        <TabsContent value="preview" className="mt-6">
          <PDFPreview data={buildData()} companyFormat={companyFormat} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

