"use client"

import { useState, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ClientInfoForm } from "./client-info-form"
import { ItemsTable } from "./items-table"
import { SummaryPanel } from "./summary-panel"
import { PDFPreview } from "./pdf-preview"
import { downloadPDF } from "@/lib/generate-pdf"
import type { ClientInfo, QuotationItem, QuotationType, QuotationData } from "@/lib/quotation-types"
import { generateQuotationCode, PAYMENT_CONDITIONS, DEFAULT_TERMS } from "@/lib/quotation-types"
import { FileDown, Eye, PenLine, RotateCcw } from "lucide-react"
import { toast } from "sonner"

export function QuotationBuilder() {
  const today = new Date().toISOString().split("T")[0]
  const validDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

  const [quotationType, setQuotationType] = useState<QuotationType>("proyecto")
  const [quotationCode, setQuotationCode] = useState(() => generateQuotationCode("proyecto"))
  const [subject, setSubject] = useState("")
  const [issueDate, setIssueDate] = useState(today)
  const [validUntil, setValidUntil] = useState(validDate)
  const [paymentCondition, setPaymentCondition] = useState(PAYMENT_CONDITIONS[0])

  const [clientInfo, setClientInfo] = useState<ClientInfo>({
    name: "",
    attention: "",
    email: "",
    rif: "",
    phone: "",
    address: "",
  })

  const [items, setItems] = useState<QuotationItem[]>([])
  const [laborCost, setLaborCost] = useState(0)
  const [laborDescription, setLaborDescription] = useState("")
  const [notes, setNotes] = useState("")
  const [termsAndConditions, setTermsAndConditions] = useState(DEFAULT_TERMS)
  const [activeTab, setActiveTab] = useState("editor")

  const ivaRate = 16

  const calculations = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0)
    const baseImponible = subtotal + laborCost
    const ivaAmount = baseImponible * (ivaRate / 100)
    const total = baseImponible + ivaAmount
    return { subtotal, ivaAmount, total }
  }, [items, laborCost, ivaRate])

  const handleTypeChange = useCallback((type: QuotationType) => {
    setQuotationType(type)
    setQuotationCode(generateQuotationCode(type))
  }, [])

  const quotationData: QuotationData = useMemo(
    () => ({
      code: quotationCode,
      type: quotationType,
      subject,
      clientInfo,
      items,
      laborCost,
      laborDescription,
      issueDate,
      validUntil,
      notes,
      termsAndConditions,
      paymentCondition,
      subtotal: calculations.subtotal,
      ivaRate,
      ivaAmount: calculations.ivaAmount,
      total: calculations.total,
    }),
    [
      quotationCode,
      quotationType,
      subject,
      clientInfo,
      items,
      laborCost,
      laborDescription,
      issueDate,
      validUntil,
      notes,
      termsAndConditions,
      paymentCondition,
      calculations,
      ivaRate,
    ]
  )

  const handleExportPDF = () => {
    if (!clientInfo.name) {
      toast.error("Debe ingresar el nombre del cliente")
      return
    }
    if (items.length === 0) {
      toast.error("Debe agregar al menos un item")
      return
    }
    downloadPDF(quotationData)
    toast.success("Documento generado. Use Ctrl+P o Cmd+P para guardar como PDF.")
  }

  const handleReset = () => {
    setQuotationType("proyecto")
    setQuotationCode(generateQuotationCode("proyecto"))
    setSubject("")
    setIssueDate(today)
    setValidUntil(validDate)
    setPaymentCondition(PAYMENT_CONDITIONS[0])
    setClientInfo({ name: "", attention: "", email: "", rif: "", phone: "", address: "" })
    setItems([])
    setLaborCost(0)
    setLaborDescription("")
    setNotes("")
    setTermsAndConditions(DEFAULT_TERMS)
    setActiveTab("editor")
    toast.info("Formulario reiniciado")
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {/* Action Bar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold text-foreground">
            Nueva Cotizacion
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Complete los datos para generar su cotizacion profesional
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="border-border text-muted-foreground hover:bg-muted bg-transparent"
          >
            <RotateCcw className="mr-1.5 h-4 w-4" />
            Limpiar
          </Button>
          <Button
            size="sm"
            onClick={handleExportPDF}
            className="bg-[#1a5276] text-white hover:bg-[#0e3a57]"
          >
            <FileDown className="mr-1.5 h-4 w-4" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 grid w-full max-w-md grid-cols-2 bg-muted">
          <TabsTrigger
            value="editor"
            className="flex items-center gap-1.5 data-[state=active]:bg-[#1a5276] data-[state=active]:text-white"
          >
            <PenLine className="h-4 w-4" />
            Editor
          </TabsTrigger>
          <TabsTrigger
            value="preview"
            className="flex items-center gap-1.5 data-[state=active]:bg-[#1a5276] data-[state=active]:text-white"
          >
            <Eye className="h-4 w-4" />
            Vista Previa
          </TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="space-y-6">
          <ClientInfoForm
            clientInfo={clientInfo}
            quotationCode={quotationCode}
            quotationType={quotationType}
            subject={subject}
            issueDate={issueDate}
            validUntil={validUntil}
            paymentCondition={paymentCondition}
            onClientInfoChange={setClientInfo}
            onTypeChange={handleTypeChange}
            onSubjectChange={setSubject}
            onIssueDateChange={setIssueDate}
            onValidUntilChange={setValidUntil}
            onPaymentConditionChange={setPaymentCondition}
            onCodeChange={setQuotationCode}
          />

          <ItemsTable
            items={items}
            laborCost={laborCost}
            laborDescription={laborDescription}
            onItemsChange={setItems}
            onLaborCostChange={setLaborCost}
            onLaborDescriptionChange={setLaborDescription}
          />

          <SummaryPanel
            subtotal={calculations.subtotal}
            laborCost={laborCost}
            ivaRate={ivaRate}
            ivaAmount={calculations.ivaAmount}
            total={calculations.total}
            notes={notes}
            termsAndConditions={termsAndConditions}
            onNotesChange={setNotes}
            onTermsChange={setTermsAndConditions}
          />
        </TabsContent>

        <TabsContent value="preview">
          <PDFPreview data={quotationData} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
