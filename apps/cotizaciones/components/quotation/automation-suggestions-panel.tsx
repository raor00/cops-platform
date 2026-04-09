"use client"

import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { CatalogItem } from "@/lib/quotation-types"
import type { LaborItem, QuotationAutomationTrace, QuotationItem, QuotationType } from "@/lib/quotation-types"
import { formatCurrency } from "@/lib/quotation-types"
import { buildAutomationSuggestions } from "@/lib/quotation-automation"
import { Bot, Cable, Wrench } from "lucide-react"

interface AutomationSuggestionsPanelProps {
  companyFormat: "sa" | "llc"
  quotationType: QuotationType
  equipmentItems: QuotationItem[]
  materialItems: QuotationItem[]
  laborItems: LaborItem[]
  catalog: CatalogItem[]
  onApply: (payload: { materialItems: QuotationItem[]; laborItems: LaborItem[]; trace: QuotationAutomationTrace }) => void
}

export function AutomationSuggestionsPanel({
  companyFormat,
  quotationType,
  equipmentItems,
  materialItems,
  laborItems,
  catalog,
  onApply,
}: AutomationSuggestionsPanelProps) {
  const result = useMemo(
    () => buildAutomationSuggestions({ equipmentItems, materialItems, laborItems, quotationType, companyFormat, catalog }),
    [equipmentItems, materialItems, laborItems, quotationType, companyFormat, catalog],
  )

  const newLabor = Math.max(0, result.laborItems.length - laborItems.length)
  const newMaterials = Math.max(0, result.materialItems.length - materialItems.length)
  const canApply = equipmentItems.length > 0 && (newLabor > 0 || newMaterials > 0)

  if (equipmentItems.length === 0) return null

  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Bot className="h-4 w-4 text-primary" />
            {companyFormat === "llc" ? "Automation Suggestions" : "Sugerencias de Automatización"}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {companyFormat === "llc"
              ? "Rule engine estimates labor and support materials from selected equipment."
              : "El motor de reglas estima mano de obra y materiales de apoyo según los equipos seleccionados."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{result.meta.summary}</Badge>
          <Badge variant="secondary">{quotationType}</Badge>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-muted/20 p-3">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
            <Wrench className="h-4 w-4 text-primary" />
            {companyFormat === "llc" ? "Suggested labor" : "Mano de obra sugerida"}
          </div>
          <div className="space-y-2 text-xs">
            {result.laborItems.slice(laborItems.length).length === 0 ? (
              <p className="text-muted-foreground">
                {companyFormat === "llc" ? "No new labor suggestions." : "No hay nueva mano de obra sugerida."}
              </p>
            ) : (
              result.laborItems.slice(laborItems.length).map((item) => (
                <div key={item.id} className="rounded-lg border border-border bg-card px-3 py-2">
                  <p className="font-medium text-foreground">{item.description}</p>
                  <p className="mt-1 text-muted-foreground">${formatCurrency(item.cost)}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-muted/20 p-3">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
            <Cable className="h-4 w-4 text-primary" />
            {companyFormat === "llc" ? "Suggested materials" : "Materiales sugeridos"}
          </div>
          <div className="space-y-2 text-xs">
            {result.materialItems.slice(materialItems.length).length === 0 ? (
              <p className="text-muted-foreground">
                {companyFormat === "llc" ? "No new material suggestions." : "No hay nuevos materiales sugeridos."}
              </p>
            ) : (
              result.materialItems.slice(materialItems.length).map((item) => (
                <div key={item.id} className="rounded-lg border border-border bg-card px-3 py-2">
                  <p className="font-medium text-foreground">{item.description}</p>
                  <p className="mt-1 text-muted-foreground">
                    {companyFormat === "llc" ? "Qty" : "Cant."}: {item.quantity} · ${formatCurrency(item.totalPrice)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button
          type="button"
          onClick={() => onApply({ materialItems: result.materialItems, laborItems: result.laborItems, trace: result.meta })}
          disabled={!canApply}
        >
          {companyFormat === "llc" ? "Apply suggestions" : "Aplicar sugerencias"}
        </Button>
        <span className="text-xs text-muted-foreground">
          {companyFormat === "llc"
            ? `${newLabor} labor suggestions · ${newMaterials} material suggestions`
            : `${newLabor} sugerencias de mano de obra · ${newMaterials} sugerencias de materiales`}
        </span>
      </div>
    </div>
  )
}
