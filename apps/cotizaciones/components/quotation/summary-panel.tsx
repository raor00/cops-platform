"use client"

import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { formatCurrency, DEFAULT_TERMS, DEFAULT_TERMS_LLC } from "@/lib/quotation-types"
import type { DiscountMode } from "@/lib/quotation-types"
import { Calculator, FileCheck, StickyNote } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface SummaryPanelProps {
  subtotalEquipment: number
  subtotalMaterials: number
  subtotalLabor: number
  ivaRate: number
  ivaAmount: number
  total: number
  notes: string
  termsAndConditions: string
  onNotesChange: (notes: string) => void
  onTermsChange: (terms: string) => void
  companyFormat: "sa" | "llc"
  taxRate: number
  discountMode: DiscountMode
  discountValue: number
  discountAmount: number
  onDiscountModeChange: (mode: DiscountMode) => void
  onDiscountChange: (value: number) => void
  onTaxRateChange: (value: number) => void
}

export function SummaryPanel({
  subtotalEquipment,
  subtotalMaterials,
  subtotalLabor,
  ivaRate,
  ivaAmount,
  total,
  notes,
  termsAndConditions,
  onNotesChange,
  onTermsChange,
  companyFormat,
  taxRate,
  discountMode,
  discountValue,
  discountAmount,
  onDiscountModeChange,
  onDiscountChange,
  onTaxRateChange,
}: SummaryPanelProps) {
  const baseImponible = subtotalEquipment + subtotalMaterials + subtotalLabor

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Notes and Terms */}
      <div className="space-y-4">
        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <StickyNote className="h-4 w-4 text-[#4a72ef]" />
            {companyFormat === "llc" ? "Special Instructions" : "Notas Adicionales"}
          </h3>
          <Textarea
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder={companyFormat === "llc" ? "Special instructions..." : "Notas o comentarios adicionales para el cliente..."}
            rows={3}
            className="resize-none border-border bg-card text-sm text-foreground"
          />
        </div>
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <FileCheck className="h-4 w-4 text-[#4a72ef]" />
              {companyFormat === "llc" ? "Terms & Conditions" : "Terminos y Condiciones"}
            </h3>
            <button
              type="button"
              onClick={() => onTermsChange(companyFormat === "llc" ? DEFAULT_TERMS_LLC : DEFAULT_TERMS)}
              className="text-xs text-[#4a72ef] underline-offset-2 hover:underline"
            >
              {companyFormat === "llc" ? "Load defaults" : "Cargar predeterminados"}
            </button>
          </div>
          <Textarea
            value={termsAndConditions}
            onChange={(e) => onTermsChange(e.target.value)}
            placeholder={companyFormat === "llc" ? "Write terms and conditions..." : "Escriba los terminos y condiciones..."}
            rows={8}
            className="resize-none border-border bg-card text-sm leading-relaxed text-foreground"
          />
        </div>
      </div>

      {/* Totals */}
      <div className="flex flex-col justify-end">
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="mb-5 flex items-center gap-2 font-heading text-base font-semibold text-foreground">
            <Calculator className="h-5 w-5 text-[#4a72ef]" />
            {companyFormat === "llc" ? "Quote Summary" : "Resumen de Cotizacion"}
          </h3>

          <div className="mb-4 grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">{companyFormat === "llc" ? "Discount Type" : "Tipo de Descuento"}</Label>
              <Select value={discountMode} onValueChange={(value) => onDiscountModeChange(value as DiscountMode)}>
                <SelectTrigger className="h-9 border-input bg-muted/70 text-sm text-foreground shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="amount">{companyFormat === "llc" ? "Exact amount (USD)" : "Monto exacto (USD)"}</SelectItem>
                  <SelectItem value="percentage">{companyFormat === "llc" ? "Percentage (%)" : "Porcentaje (%)"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                {discountMode === "percentage"
                  ? (companyFormat === "llc" ? "Discount Value (%)" : "Valor del Descuento (%)")
                  : (companyFormat === "llc" ? "Discount Value (USD)" : "Valor del Descuento (USD)")}
              </Label>
              <input
                type="number"
                min={0}
                step={0.01}
                value={discountValue}
                onFocus={(e) => e.currentTarget.select()}
                onChange={(e) => onDiscountChange(Number(e.target.value))}
                className="h-9 w-full rounded-lg border border-input bg-muted/70 px-3 text-right text-sm text-foreground shadow-[0_1px_2px_rgba(15,23,42,0.06)]"
              />
            </div>
            {companyFormat === "llc" && (
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Tax Rate (%)</Label>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={taxRate}
                  onFocus={(e) => e.currentTarget.select()}
                  onChange={(e) => onTaxRateChange(Number(e.target.value))}
                  className="h-9 w-full rounded-lg border border-input bg-muted/70 px-3 text-right text-sm text-foreground shadow-[0_1px_2px_rgba(15,23,42,0.06)]"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-md bg-muted/40 px-4 py-2.5">
              <span className="text-sm text-muted-foreground">{companyFormat === "llc" ? "Equipment & Services" : "Equipos y Servicios"}</span>
              <span className="font-mono text-sm font-medium text-foreground">${formatCurrency(subtotalEquipment)}</span>
            </div>
            <div className="flex items-center justify-between rounded-md bg-muted/40 px-4 py-2.5">
              <span className="text-sm text-muted-foreground">{companyFormat === "llc" ? "Materials & Supplies" : "Materiales e Insumos"}</span>
              <span className="font-mono text-sm font-medium text-foreground">${formatCurrency(subtotalMaterials)}</span>
            </div>
            <div className="flex items-center justify-between rounded-md bg-muted/40 px-4 py-2.5">
              <span className="text-sm text-muted-foreground">{companyFormat === "llc" ? "Labor" : "Mano de Obra"}</span>
              <span className="font-mono text-sm font-medium text-foreground">${formatCurrency(subtotalLabor)}</span>
            </div>
            <div className="my-2 border-t border-border" />
            {companyFormat === "llc" ? (
              <>
                <div className="flex items-center justify-between rounded-md bg-muted/40 px-4 py-2.5">
                  <span className="text-sm font-medium text-foreground">Sub Total</span>
                  <span className="font-mono text-sm font-semibold text-foreground">${formatCurrency(baseImponible)}</span>
                </div>
                <div className="flex items-center justify-between rounded-md bg-muted/40 px-4 py-2.5">
                  <span className="text-sm text-muted-foreground">Discount</span>
                  <span className="font-mono text-sm font-medium text-foreground">-${formatCurrency(discountAmount)}</span>
                </div>
                <div className="flex items-center justify-between rounded-md bg-muted/40 px-4 py-2.5">
                  <span className="text-sm text-muted-foreground">Tax ({taxRate}%)</span>
                  <span className="font-mono text-sm font-medium text-foreground">${formatCurrency(ivaAmount)}</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between rounded-md bg-muted/40 px-4 py-2.5">
                  <span className="text-sm font-medium text-foreground">Base Imponible</span>
                  <span className="font-mono text-sm font-semibold text-foreground">${formatCurrency(baseImponible)}</span>
                </div>
                <div className="flex items-center justify-between rounded-md bg-muted/40 px-4 py-2.5">
                  <span className="text-sm text-muted-foreground">Descuento</span>
                  <span className="font-mono text-sm font-medium text-foreground">-${formatCurrency(discountAmount)}</span>
                </div>
                <div className="flex items-center justify-between rounded-md bg-muted/40 px-4 py-2.5">
                  <span className="text-sm text-muted-foreground">IVA ({ivaRate}%)</span>
                  <span className="font-mono text-sm font-medium text-foreground">${formatCurrency(ivaAmount)}</span>
                </div>
              </>
            )}
            <div className="mt-3 border-t-2 border-[#4a72ef] pt-3">
              <div className="flex items-center justify-between rounded-lg bg-[#153977] px-5 py-4">
                <span className="text-sm font-bold text-white">{companyFormat === "llc" ? "TOTAL" : "TOTAL USD"}</span>
                <span className="font-heading text-xl font-bold text-white">${formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}



