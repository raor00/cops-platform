"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import type { ClientInfo, QuotationType } from "@/lib/quotation-types"
import { PAYMENT_CONDITIONS } from "@/lib/quotation-types"
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

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <h2 className="mb-5 flex items-center gap-2 font-heading text-lg font-semibold text-foreground">
        <Building2 className="h-5 w-5 text-[#1a5276]" />
        Datos de la Cotizacion
      </h2>

      <div className="grid gap-5 md:grid-cols-3">
        {/* Row 1 */}
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <FileText className="h-3.5 w-3.5" />
            Tipo de Cotizacion
          </Label>
          <Select value={quotationType} onValueChange={(val) => onTypeChange(val as QuotationType)}>
            <SelectTrigger className="border-border bg-card text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="proyecto">Proyecto</SelectItem>
              <SelectItem value="servicio">Servicio</SelectItem>
              <SelectItem value="mantenimiento">Mantenimiento Preventivo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Hash className="h-3.5 w-3.5" />
            Codigo de Cotizacion
          </Label>
          <Input
            value={quotationCode}
            onChange={(e) => onCodeChange(e.target.value)}
            className="border-border bg-card font-mono text-sm text-foreground"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <FileText className="h-3.5 w-3.5" />
            Partida / Asunto
          </Label>
          <Input
            value={subject}
            onChange={(e) => onSubjectChange(e.target.value)}
            placeholder="Ej: SUMINISTRO E INSTALACION DE CCTV"
            className="border-border bg-card text-foreground"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Building2 className="h-3.5 w-3.5" />
            Formato / Empresa
          </Label>
          <div className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2">
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-foreground">
                {companyFormat === "llc" ? "COPS ELECTRONICS LLC" : "COP'S ELECTRONICS S.A."}
              </p>
              <p className="text-[10px] text-muted-foreground">
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
            Fecha de Emision
          </Label>
          <Input
            type="date"
            value={issueDate}
            onChange={(e) => onIssueDateChange(e.target.value)}
            className="border-border bg-card text-foreground"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            Valido Hasta
          </Label>
          <Input
            type="date"
            value={validUntil}
            onChange={(e) => onValidUntilChange(e.target.value)}
            className="border-border bg-card text-foreground"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <FileText className="h-3.5 w-3.5" />
            Condicion de Pago
          </Label>
          <Select value={paymentCondition} onValueChange={onPaymentConditionChange}>
            <SelectTrigger className="border-border bg-card text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_CONDITIONS.map((cond) => (
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
          <User className="h-4 w-4 text-[#1a5276]" />
          Datos del Cliente
        </h3>
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
      </div>
    </div>
  )
}
