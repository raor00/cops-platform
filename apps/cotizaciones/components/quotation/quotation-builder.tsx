"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ClientInfoForm } from "./client-info-form"
import { ItemsSection } from "./items-table"
import { LaborSection } from "./labor-section"
import { SummaryPanel } from "./summary-panel"
import { PDFPreview } from "./pdf-preview"
import { QuotationAIAssistant } from "./quotation-ai-assistant"
import { AutomationSuggestionsPanel } from "./automation-suggestions-panel"
import { downloadPDF } from "@/lib/generate-pdf"
import { saveQuotation, getCatalog, getCatalogDiscountConfig } from "@/lib/quotation-storage"
import type { ClientInfo, QuotationItem, QuotationType, QuotationData, LaborItem, DiscountMode } from "@/lib/quotation-types"
import type { AIDraftResponse } from "@/lib/quotation-ai-types"
import { toLaborItems, toQuotationItems } from "@/lib/quotation-ai-mapper"
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
  const [catalogSnapshot, setCatalogSnapshot] = useState(() => getCatalog())
  const [aiDraftTrace, setAiDraftTrace] = useState(initialData?.aiDraftTrace)
  const [automationTrace, setAutomationTrace] = useState(initialData?.automationTrace)

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
      setCatalogSnapshot(catalog)
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
            brand: catalogItem.brand || "General",
            category: catalogItem.category,
            subcategory: catalogItem.subcategory || "General",
            variant: catalogItem.variant || "",
          }
        })

      setEquipmentItems((prev) => applyList(prev))
      setMaterialItems((prev) => applyList(prev))
    }

    applyCatalogDiscounts()
    window.addEventListener("catalog-updated", applyCatalogDiscounts)
    return () => window.removeEventListener("catalog-updated", applyCatalogDiscounts)
  }, [])

  const handleApplyAIDraft = useCallback((result: AIDraftResponse, prompt: string) => {
    const patch = result.draftPatch
    let appliedCount = 0
    if (patch.clientInfo) {
      setClientInfo((prev) => {
        const merged = { ...prev, ...patch.clientInfo }
        if (merged.billToName) {
          merged.name = merged.billToName
        }
        return merged
      })
      appliedCount += 1
    }

    if (patch.subject !== undefined) setSubject(patch.subject)
    if (patch.issueDate !== undefined) setIssueDate(patch.issueDate)
    if (patch.validUntil !== undefined) setValidUntil(patch.validUntil)
    if (patch.paymentCondition !== undefined) {
      setPaymentCondition(patch.paymentCondition)
      if (companyFormat === "llc") {
        setLlcPayment(patch.paymentCondition)
      } else {
        setSaPayment(patch.paymentCondition)
      }
    }
    if (patch.discountMode !== undefined) setDiscountMode(patch.discountMode)
    if (patch.discountValue !== undefined) setDiscountValue(patch.discountValue)
    if (patch.subject !== undefined || patch.issueDate !== undefined || patch.validUntil !== undefined || patch.paymentCondition !== undefined) {
      appliedCount += 1
    }

    if (patch.equipmentItems) {
      if (patch.equipmentItems.length > 0) {
        setEquipmentItems(toQuotationItems(patch.equipmentItems))
        appliedCount += 1
      }
    }

    if (patch.materialItems) {
      if (patch.materialItems.length > 0) {
        setMaterialItems(toQuotationItems(patch.materialItems))
        appliedCount += 1
      }
    }

    if (patch.laborItems) {
      if (patch.laborItems.length > 0) {
        setLaborItems(toLaborItems(patch.laborItems))
        appliedCount += 1
      }
    }

    if (patch.notes !== undefined) setNotes(patch.notes)
    if (patch.termsAndConditions !== undefined) {
      setTermsAndConditions(patch.termsAndConditions)
      if (companyFormat === "llc") {
        setLlcTerms(patch.termsAndConditions)
      } else {
        setSaTerms(patch.termsAndConditions)
      }
    }
    if (patch.notes !== undefined || patch.termsAndConditions !== undefined) {
      appliedCount += 1
    }

    if (result.suggestedItemsOutsideCatalog.length > 0) {
      toast.info(
        companyFormat === "llc"
          ? `${result.suggestedItemsOutsideCatalog.length} item suggestions remain outside catalog`
          : `${result.suggestedItemsOutsideCatalog.length} sugerencias quedaron fuera del catalogo`,
      )
    }

    if (appliedCount === 0) {
      toast.warning(
        companyFormat === "llc"
          ? "Draft had no applicable changes. Check suggestions/warnings."
          : "El borrador no incluyo cambios aplicables. Revisa sugerencias/advertencias.",
      )
      return
    }

    setAiDraftTrace({
      prompt,
      provider: result.metadata.provider,
      model: result.metadata.model,
      confidence: result.confidence,
      fallbackUsed: result.metadata.fallbackUsed,
      warningCount: result.warnings.length,
      suggestionCount: result.suggestedItemsOutsideCatalog.length,
      generatedAt: new Date().toISOString(),
    })

    toast.success(
      companyFormat === "llc"
        ? `Draft applied (${appliedCount} sections updated)`
        : `Borrador aplicado (${appliedCount} secciones actualizadas)`,
    )
  }, [companyFormat])

  const handleApplyAutomation = useCallback((payload: { materialItems: QuotationItem[]; laborItems: LaborItem[]; trace: NonNullable<QuotationData["automationTrace"]> }) => {
    setMaterialItems(payload.materialItems)
    setLaborItems(payload.laborItems)
    setAutomationTrace(payload.trace)
    toast.success(companyFormat === "llc" ? "Automation suggestions applied" : "Sugerencias automáticas aplicadas")
  }, [companyFormat])

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
    aiDraftTrace,
    automationTrace,
  }), [quotationId, quotationCode, quotationType, companyFormat, discountMode, discountValue, subject, clientInfo, equipmentItems, materialItems, laborItems, issueDate, validUntil, notes, termsAndConditions, paymentCondition, calculations, taxRate, initialData, aiDraftTrace, automationTrace])

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
    setAiDraftTrace(undefined)
    setAutomationTrace(undefined)
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
    <div className="min-w-0 space-y-6">
      {/* Action Bar */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            {companyFormat === "llc"
              ? (initialData ? "Edit Quote" : "New Quote")
              : (initialData ? "Editar Cotizacion" : "Nueva Cotizacion")}
          </h1>
          <p className="page-description">
            {quotationCode} &middot; {quotationType === "proyecto"
              ? (companyFormat === "llc" ? "Project" : "Proyecto")
              : quotationType === "servicio"
                ? (companyFormat === "llc" ? "Service" : "Servicio")
                : (companyFormat === "llc" ? "Preventive Maintenance" : "Mantenimiento Preventivo")}
          </p>
        </div>
        <div className="page-actions">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="w-full sm:w-auto"
          >
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            {companyFormat === "llc" ? "Reset" : "Limpiar"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            className="w-full sm:w-auto border-primary text-primary hover:bg-primary/10"
          >
            <Save className="mr-1.5 h-3.5 w-3.5" />
            {companyFormat === "llc" ? "Save" : "Guardar"}
          </Button>
          <Button
            size="sm"
            onClick={handleExportPDF}
            className="w-full sm:w-auto"
          >
            <FileDown className="mr-1.5 h-3.5 w-3.5" />
            {companyFormat === "llc" ? "Export PDF" : "Exportar PDF"}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-xs grid-cols-2 bg-muted p-1">
          <TabsTrigger
            value="editor"
            className="flex items-center gap-1.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md transition-all"
          >
            <PenLine className="h-3.5 w-3.5" />
            Editor
          </TabsTrigger>
          <TabsTrigger
            value="preview"
            className="flex items-center gap-1.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md transition-all"
          >
            <Eye className="h-3.5 w-3.5" />
            {companyFormat === "llc" ? "Preview" : "Vista Previa"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="mt-6 space-y-4">
          <QuotationAIAssistant
            companyFormat={companyFormat}
            quotationType={quotationType}
            currentDraft={{
              subject,
              issueDate,
              validUntil,
              paymentCondition,
              notes,
              termsAndConditions,
              companyFormat,
              type: quotationType,
              clientInfo,
            }}
            catalog={catalogSnapshot}
            onApplyDraft={handleApplyAIDraft}
          />

          <AutomationSuggestionsPanel
            companyFormat={companyFormat}
            quotationType={quotationType}
            equipmentItems={equipmentItems}
            materialItems={materialItems}
            laborItems={laborItems}
            catalog={catalogSnapshot}
            onApply={handleApplyAutomation}
          />

          {(aiDraftTrace || automationTrace) && (
            <div className="rounded-2xl border border-border bg-card p-4">
              <h3 className="text-sm font-semibold text-foreground">{companyFormat === "llc" ? "Automation trace" : "Trazabilidad de automatización"}</h3>
              <div className="mt-3 grid gap-3 text-xs text-muted-foreground sm:grid-cols-2">
                <div className="rounded-lg border border-border bg-muted/20 p-3">
                  <p className="font-medium text-foreground">{companyFormat === "llc" ? "AI draft" : "Borrador IA"}</p>
                  {aiDraftTrace ? (
                    <>
                      <p className="mt-1">{aiDraftTrace.provider} · {aiDraftTrace.model}</p>
                      <p>Confianza: {Math.round(aiDraftTrace.confidence * 100)}%</p>
                      <p>Warnings: {aiDraftTrace.warningCount} · Suggestions: {aiDraftTrace.suggestionCount}</p>
                    </>
                  ) : (
                    <p className="mt-1">{companyFormat === "llc" ? "No AI draft applied yet." : "Aún no se ha aplicado un borrador IA."}</p>
                  )}
                </div>
                <div className="rounded-lg border border-border bg-muted/20 p-3">
                  <p className="font-medium text-foreground">{companyFormat === "llc" ? "Rule engine" : "Motor de reglas"}</p>
                  {automationTrace ? (
                    <>
                      <p className="mt-1">{automationTrace.summary}</p>
                      <p>{automationTrace.quotationType}</p>
                    </>
                  ) : (
                    <p className="mt-1">{companyFormat === "llc" ? "No rule-based automation applied yet." : "Aún no se han aplicado sugerencias por reglas."}</p>
                  )}
                </div>
              </div>
            </div>
          )}

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
            icon={<Package className="h-4 w-4 text-[#4a72ef]" />}
            items={equipmentItems}
            onItemsChange={setEquipmentItems}
            catalogFilter="Equipos"
            companyFormat={companyFormat}
          />

          <ItemsSection
            title={companyFormat === "llc" ? "Materials & Supplies" : "Materiales e Insumos"}
            icon={<Cable className="h-4 w-4 text-[#4a72ef]" />}
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


