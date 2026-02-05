"use client"

import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { formatCurrency, DEFAULT_TERMS } from "@/lib/quotation-types"
import { Calculator, FileCheck, StickyNote } from "lucide-react"

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
}: SummaryPanelProps) {
  const baseImponible = subtotalEquipment + subtotalMaterials + subtotalLabor

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Notes and Terms */}
      <div className="space-y-4">
        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <StickyNote className="h-4 w-4 text-[#1a5276]" />
            Notas Adicionales
          </h3>
          <Textarea
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Notas o comentarios adicionales para el cliente..."
            rows={3}
            className="resize-none border-border bg-card text-sm text-foreground"
          />
        </div>
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <FileCheck className="h-4 w-4 text-[#1a5276]" />
              Terminos y Condiciones
            </h3>
            <button
              type="button"
              onClick={() => onTermsChange(DEFAULT_TERMS)}
              className="text-xs text-[#1a5276] underline-offset-2 hover:underline"
            >
              Cargar predeterminados
            </button>
          </div>
          <Textarea
            value={termsAndConditions}
            onChange={(e) => onTermsChange(e.target.value)}
            placeholder="Escriba los terminos y condiciones..."
            rows={8}
            className="resize-none border-border bg-card text-sm leading-relaxed text-foreground"
          />
        </div>
      </div>

      {/* Totals */}
      <div className="flex flex-col justify-end">
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="mb-5 flex items-center gap-2 font-heading text-base font-semibold text-foreground">
            <Calculator className="h-5 w-5 text-[#1a5276]" />
            Resumen de Cotizacion
          </h3>

          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-md bg-muted/40 px-4 py-2.5">
              <span className="text-sm text-muted-foreground">Equipos y Servicios</span>
              <span className="font-mono text-sm font-medium text-foreground">${formatCurrency(subtotalEquipment)}</span>
            </div>
            <div className="flex items-center justify-between rounded-md bg-muted/40 px-4 py-2.5">
              <span className="text-sm text-muted-foreground">Materiales e Insumos</span>
              <span className="font-mono text-sm font-medium text-foreground">${formatCurrency(subtotalMaterials)}</span>
            </div>
            <div className="flex items-center justify-between rounded-md bg-muted/40 px-4 py-2.5">
              <span className="text-sm text-muted-foreground">Mano de Obra</span>
              <span className="font-mono text-sm font-medium text-foreground">${formatCurrency(subtotalLabor)}</span>
            </div>
            <div className="my-2 border-t border-border" />
            <div className="flex items-center justify-between rounded-md bg-muted/40 px-4 py-2.5">
              <span className="text-sm font-medium text-foreground">Base Imponible</span>
              <span className="font-mono text-sm font-semibold text-foreground">${formatCurrency(baseImponible)}</span>
            </div>
            <div className="flex items-center justify-between rounded-md bg-muted/40 px-4 py-2.5">
              <span className="text-sm text-muted-foreground">IVA ({ivaRate}%)</span>
              <span className="font-mono text-sm font-medium text-foreground">${formatCurrency(ivaAmount)}</span>
            </div>
            <div className="mt-3 border-t-2 border-[#1a5276] pt-3">
              <div className="flex items-center justify-between rounded-lg bg-[#0a1628] px-5 py-4">
                <span className="text-sm font-bold text-white">TOTAL USD</span>
                <span className="font-heading text-xl font-bold text-white">${formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
