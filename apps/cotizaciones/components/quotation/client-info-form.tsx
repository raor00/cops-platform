"use client"

import type { MouseEvent } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import type { ClientInfo, QuotationType } from "@/lib/quotation-types"
import { PAYMENT_CONDITIONS, PAYMENT_CONDITIONS_LLC } from "@/lib/quotation-types"
import { Building2, Calendar, FileText, Hash, Mail, MapPin, Phone, User } from "lucide-react"

interface ClientInfoFormProps {
  clientInfo: ClientInfo
  quotationCode: string
  quotationType: QuotationType
  companyFormat: "sa" | "llc"
  subject: string
  issueDate: string
  validUntil: string
  paymentCondition: string
  onClientInfoChange: (info: ClientInfo) => void
  onTypeChange: (type: QuotationType) => void
  onCompanyFormatChange: (format: "sa" | "llc") => void
  onSubjectChange: (subject: string) => void
  onIssueDateChange: (date: string) => void
  onValidUntilChange: (date: string) => void
  onPaymentConditionChange: (condition: string) => void
  onCodeChange: (code: string) => void
}

export function ClientInfoForm({
  clientInfo,
  quotationCode,
  quotationType,
  companyFormat,
  subject,
  issueDate,
  validUntil,
  paymentCondition,
  onClientInfoChange,
  onTypeChange,
  onCompanyFormatChange,
  onSubjectChange,
  onIssueDateChange,
  onValidUntilChange,
  onPaymentConditionChange,
  onCodeChange,
}: ClientInfoFormProps) {
  const updateField = (field: keyof ClientInfo, value: string) => {
    onClientInfoChange({ ...clientInfo, [field]: value })
  }

  const updateLLCField = (field: keyof ClientInfo, value: string) => {
    const updated = { ...clientInfo, [field]: value }
    if (field === "billToName") {
      updated.name = value
    }
    onClientInfoChange(updated)
  }

  const toggleCompanyFormat = (e?: MouseEvent) => {
    if (e) {
      const target = e.target as HTMLElement
      if (target.closest('[role="switch"]')) return
    }
    onCompanyFormatChange(companyFormat === "llc" ? "sa" : "llc")
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6">
      <h2 className="mb-5 flex items-center gap-2 font-heading text-lg font-semibold text-foreground">
        <Building2 className="h-5 w-5 text-[#4a72ef]" />
        {companyFormat === "llc" ? "Quote Details" : "Datos de la Cotizacion"}
      </h2>

      <div className="grid gap-5 md:grid-cols-3">
        {/* Row 1 */}
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <FileText className="h-3.5 w-3.5" />
            {companyFormat === "llc" ? "Quote Type" : "Tipo de Cotizacion"}
          </Label>
          <Select value={quotationType} onValueChange={(val) => onTypeChange(val as QuotationType)}>
            <SelectTrigger className="h-12 border-border bg-card text-base text-foreground sm:h-10 sm:text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="proyecto">{companyFormat === "llc" ? "Project" : "Proyecto"}</SelectItem>
              <SelectItem value="servicio">{companyFormat === "llc" ? "Service" : "Servicio"}</SelectItem>
              <SelectItem value="mantenimiento">{companyFormat === "llc" ? "Preventive Maintenance" : "Mantenimiento Preventivo"}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Hash className="h-3.5 w-3.5" />
            {companyFormat === "llc" ? "Quote Code" : "Codigo de Cotizacion"}
          </Label>
          <Input
            value={quotationCode}
            onChange={(e) => onCodeChange(e.target.value)}
            className="h-12 border-border bg-card font-mono text-base text-foreground sm:h-10 sm:text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <FileText className="h-3.5 w-3.5" />
            {companyFormat === "llc" ? "Project / Subject" : "Partida / Asunto"}
          </Label>
          <Input
            value={subject}
            onChange={(e) => onSubjectChange(e.target.value)}
            placeholder={companyFormat === "llc" ? "Example: Supply and installation of CCTV" : "Ej: SUMINISTRO E INSTALACION DE CCTV"}
            className="h-12 border-border bg-card text-base text-foreground sm:h-10 sm:text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Building2 className="h-3.5 w-3.5" />
            {companyFormat === "llc" ? "Format / Company" : "Formato / Empresa"}
          </Label>
          <div
            className="flex min-h-12 cursor-pointer items-center justify-between rounded-lg border border-border bg-card px-3 py-2 sm:min-h-10"
            onClick={toggleCompanyFormat}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                toggleCompanyFormat()
              }
            }}
          >
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-foreground sm:text-xs">
                {companyFormat === "llc" ? "COPS ELECTRONICS LLC" : "COP'S ELECTRONICS S.A."}
              </p>
              <p className="text-xs text-muted-foreground sm:text-[10px]">
                {companyFormat === "llc" ? "Formato USA (Invoice)" : "Formato Venezuela"}
              </p>
            </div>
            <Switch
              checked={companyFormat === "llc"}
              onCheckedChange={(checked) => onCompanyFormatChange(checked ? "llc" : "sa")}
            />
          </div>
        </div>

        {/* Row 2 */}
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            {companyFormat === "llc" ? "Date" : "Fecha de Emision"}
          </Label>
          <Input
            type="date"
            value={issueDate}
            onChange={(e) => onIssueDateChange(e.target.value)}
            className="h-12 border-border bg-card text-base text-foreground sm:h-10 sm:text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            {companyFormat === "llc" ? "Valid Until" : "Valido Hasta"}
          </Label>
          <Input
            type="date"
            value={validUntil}
            onChange={(e) => onValidUntilChange(e.target.value)}
            className="h-12 border-border bg-card text-base text-foreground sm:h-10 sm:text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <FileText className="h-3.5 w-3.5" />
            {companyFormat === "llc" ? "Terms" : "Condicion de Pago"}
          </Label>
          <Select value={paymentCondition} onValueChange={onPaymentConditionChange}>
            <SelectTrigger className="h-12 border-border bg-card text-base text-foreground sm:h-10 sm:text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(companyFormat === "llc" ? PAYMENT_CONDITIONS_LLC : PAYMENT_CONDITIONS).map((cond) => (
                <SelectItem key={cond} value={cond}>
                  {cond}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-6 border-t border-border pt-5">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
          <User className="h-4 w-4 text-[#4a72ef]" />
          {companyFormat === "llc" ? "Bill To / Ship To" : "Datos del Cliente"}
        </h3>

        {companyFormat === "llc" ? (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Hash className="h-3.5 w-3.5" />
                  Customer ID
                </Label>
                <Input
                  value={clientInfo.customerId}
                  onChange={(e) => updateLLCField("customerId", e.target.value)}
                  placeholder="U. 20172"
                  className="border-border bg-card text-foreground"
                />
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Building2 className="h-3.5 w-3.5" />
                  Bill To - Company
                </Label>
                <Input
                  value={clientInfo.billToName}
                  onChange={(e) => updateLLCField("billToName", e.target.value)}
                  placeholder="Smart Power Instruments SL"
                  className="border-border bg-card text-foreground"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <User className="h-3.5 w-3.5" />
                  Bill To - Attention
                </Label>
                <Input
                  value={clientInfo.billToAttention}
                  onChange={(e) => updateLLCField("billToAttention", e.target.value)}
                  placeholder="Contact name"
                  className="border-border bg-card text-foreground"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  Bill To - Email
                </Label>
                <Input
                  type="email"
                  value={clientInfo.billToEmail}
                  onChange={(e) => updateLLCField("billToEmail", e.target.value)}
                  placeholder="email@company.com"
                  className="border-border bg-card text-foreground"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" />
                  Bill To - Phone
                </Label>
                <Input
                  value={clientInfo.billToPhone}
                  onChange={(e) => updateLLCField("billToPhone", e.target.value)}
                  placeholder="+1 (305) 000-0000"
                  className="border-border bg-card text-foreground"
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  Bill To - Address
                </Label>
                <Input
                  value={clientInfo.billToAddress}
                  onChange={(e) => updateLLCField("billToAddress", e.target.value)}
                  placeholder="Address, City, State, ZIP"
                  className="border-border bg-card text-foreground"
                />
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Building2 className="h-3.5 w-3.5" />
                  Ship To - Company
                </Label>
                <Input
                  value={clientInfo.shipToName}
                  onChange={(e) => updateLLCField("shipToName", e.target.value)}
                  placeholder="Smart Power Instruments SL"
                  className="border-border bg-card text-foreground"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <User className="h-3.5 w-3.5" />
                  Ship To - Attention
                </Label>
                <Input
                  value={clientInfo.shipToAttention}
                  onChange={(e) => updateLLCField("shipToAttention", e.target.value)}
                  placeholder="Contact name"
                  className="border-border bg-card text-foreground"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  Ship To - Email
                </Label>
                <Input
                  type="email"
                  value={clientInfo.shipToEmail}
                  onChange={(e) => updateLLCField("shipToEmail", e.target.value)}
                  placeholder="email@company.com"
                  className="border-border bg-card text-foreground"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" />
                  Ship To - Phone
                </Label>
                <Input
                  value={clientInfo.shipToPhone}
                  onChange={(e) => updateLLCField("shipToPhone", e.target.value)}
                  placeholder="+1 (305) 000-0000"
                  className="border-border bg-card text-foreground"
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  Ship To - Address
                </Label>
                <Input
                  value={clientInfo.shipToAddress}
                  onChange={(e) => updateLLCField("shipToAddress", e.target.value)}
                  placeholder="Address, City, State, ZIP"
                  className="border-border bg-card text-foreground"
                />
              </div>
            </div>
          </>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Building2 className="h-3.5 w-3.5" />
                Empresa / Cliente
              </Label>
              <Input
                value={clientInfo.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="Nombre de la empresa"
                className="border-border bg-card text-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <User className="h-3.5 w-3.5" />
                Atencion
              </Label>
              <Input
                value={clientInfo.attention}
                onChange={(e) => updateField("attention", e.target.value)}
                placeholder="Sr./Sra. Nombre Apellido"
                className="border-border bg-card text-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Hash className="h-3.5 w-3.5" />
                RIF
              </Label>
              <Input
                value={clientInfo.rif}
                onChange={(e) => updateField("rif", e.target.value)}
                placeholder="J-12345678-9"
                className="border-border bg-card text-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Mail className="h-3.5 w-3.5" />
                Email
              </Label>
              <Input
                type="email"
                value={clientInfo.email}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="email@empresa.com"
                className="border-border bg-card text-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Phone className="h-3.5 w-3.5" />
                Telefono
              </Label>
              <Input
                value={clientInfo.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                placeholder="0212-1234567"
                className="border-border bg-card text-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                Direccion / Agencia
              </Label>
              <Input
                value={clientInfo.address}
                onChange={(e) => updateField("address", e.target.value)}
                placeholder="Direccion del cliente"
                className="border-border bg-card text-foreground"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


