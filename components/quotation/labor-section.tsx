"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { LaborItem } from "@/lib/quotation-types"
import { formatCurrency } from "@/lib/quotation-types"
import { Plus, Trash2, Wrench, ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"

interface LaborSectionProps {
  laborItems: LaborItem[]
  onLaborItemsChange: (items: LaborItem[]) => void
  companyFormat?: "sa" | "llc"
}

export function LaborSection({ laborItems, onLaborItemsChange, companyFormat = "sa" }: LaborSectionProps) {
  const [collapsed, setCollapsed] = useState(false)

  const addLabor = () => {
    onLaborItemsChange([
      ...laborItems,
      { id: crypto.randomUUID(), description: "", cost: 0 },
    ])
  }

  const updateLabor = (id: string, field: keyof LaborItem, value: string | number) => {
    onLaborItemsChange(
      laborItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    )
  }

  const removeLabor = (id: string) => {
    onLaborItemsChange(laborItems.filter((item) => item.id !== id))
  }

  const totalLabor = laborItems.reduce((sum, item) => sum + item.cost, 0)

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex flex-col gap-3 border-b border-border px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-2 text-foreground"
        >
          <Wrench className="h-4 w-4 text-[#1a5276]" />
          <span className="font-heading text-sm font-semibold">{companyFormat === "llc" ? "Labor" : "Mano de Obra"}</span>
          <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
            {laborItems.length}
          </span>
          {collapsed ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronUp className="h-4 w-4 text-muted-foreground" />}
        </button>
        <div className="flex flex-wrap items-center gap-2">
          {laborItems.length > 0 && (
            <span className="text-xs font-medium text-muted-foreground">
              {companyFormat === "llc" ? "Subtotal" : "Subtotal"}: <span className="font-mono text-foreground">${formatCurrency(totalLabor)}</span>
            </span>
          )}
          <Button
            size="sm"
            onClick={addLabor}
            className="h-7 bg-[#1a5276] text-xs text-white hover:bg-[#0e3a57]"
          >
            <Plus className="mr-1 h-3 w-3" />
            {companyFormat === "llc" ? "Add" : "Agregar"}
          </Button>
        </div>
      </div>

      {!collapsed && (
        <div className="space-y-3 p-4 sm:hidden">
          {laborItems.map((item) => (
            <div key={item.id} className="rounded-md border border-border bg-card p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">{companyFormat === "llc" ? "Labor" : "Mano de Obra"}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeLabor(item.id)}
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="mt-3 grid gap-3">
                <div className="grid gap-1.5">
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{companyFormat === "llc" ? "Description" : "Descripcion"}</span>
                  <Input
                    value={item.description}
                    onChange={(e) => updateLabor(item.id, "description", e.target.value)}
                    placeholder="Ej: Instalacion y configuracion de sistema CCTV"
                    className="h-9 border-border bg-card text-sm text-foreground"
                  />
                </div>
                <div className="grid gap-1.5">
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{companyFormat === "llc" ? "Amount USD" : "Monto USD"}</span>
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    value={item.cost}
                    onChange={(e) => updateLabor(item.id, "cost", Number(e.target.value))}
                    className="h-9 border-border bg-card text-right text-sm text-foreground"
                  />
                </div>
              </div>
            </div>
          ))}
          {laborItems.length === 0 && (
            <div className="rounded-md border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
              {companyFormat === "llc" ? 'No labor items. Use "Add" to include items.' : 'Sin conceptos de mano de obra. Use "Agregar" para incluir items.'}
            </div>
          )}
        </div>
      )}

      {!collapsed && (
        <div className="hidden overflow-x-auto sm:block">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{companyFormat === "llc" ? "Description" : "Concepto / Descripcion"}</th>
                <th className="px-3 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground" style={{ width: 140 }}>{companyFormat === "llc" ? "Amount USD" : "Monto USD"}</th>
                <th className="px-3 py-2.5" style={{ width: 40 }}><span className="sr-only">Acciones</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {laborItems.map((item) => (
                <tr key={item.id} className="group transition-colors hover:bg-muted/30">
                  <td className="px-3 py-2">
                    <Input
                      value={item.description}
                      onChange={(e) => updateLabor(item.id, "description", e.target.value)}
                    placeholder={companyFormat === "llc" ? "Example: Installation and configuration of CCTV system" : "Ej: Instalacion y configuracion de sistema CCTV"}
                    className="h-8 border-border bg-card text-xs text-foreground"
                  />
                </td>
                  <td className="px-3 py-2">
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      value={item.cost}
                      onChange={(e) => updateLabor(item.id, "cost", Number(e.target.value))}
                      className="h-8 w-32 border-border bg-card text-right text-xs text-foreground"
                    />
                  </td>
                  <td className="px-3 py-2 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLabor(item.id)}
                      className="h-7 w-7 p-0 text-muted-foreground opacity-0 hover:text-destructive group-hover:opacity-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
              {laborItems.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-xs text-muted-foreground">
                    {companyFormat === "llc" ? 'No labor items. Use "Add" to include items.' : 'Sin conceptos de mano de obra. Use "Agregar" para incluir items.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
