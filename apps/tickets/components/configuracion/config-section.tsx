"use client"

import { useState } from "react"
import { Pencil, ToggleLeft, ToggleRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ConfigEditDialog } from "./config-edit-dialog"
import type { SystemConfig } from "@/types"
import type { LucideIcon } from "lucide-react"

import type { ReactNode } from "react"

interface ConfigSectionProps {
  title: string
  icon: ReactNode
  items: SystemConfig[]
  canEdit: boolean
}

function formatValue(config: SystemConfig): React.ReactNode {
  if (config.tipo_dato === "boolean") {
    return config.valor === "true" ? (
      <span className="flex items-center gap-1.5 text-green-600 text-sm">
        <ToggleRight className="h-4 w-4" />
        Activado
      </span>
    ) : (
      <span className="flex items-center gap-1.5 text-slate-400 text-sm">
        <ToggleLeft className="h-4 w-4" />
        Desactivado
      </span>
    )
  }
  if (!config.valor) {
    return <span className="text-slate-400 text-sm italic">Sin configurar</span>
  }
  return <span className="text-slate-700 text-sm font-mono">{config.valor}</span>
}

export function ConfigSection({ title, icon, items, canEdit }: ConfigSectionProps) {
  const [editingConfig, setEditingConfig] = useState<SystemConfig | null>(null)

  return (
    <>
      <Card variant="glass" className="overflow-hidden">
        <CardHeader className="pb-0 px-6 pt-5 border-b border-slate-200">
          <CardTitle className="text-base text-slate-800 flex items-center gap-2.5 pb-4">
            {icon}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {items.map((item) => (
              <div key={item.clave} className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-800 truncate">
                    {item.descripcion ?? item.clave}
                  </p>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{item.clave}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">{formatValue(item)}</div>
                  {canEdit && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-slate-400 hover:text-slate-800 hover:bg-slate-200"
                      onClick={() => setEditingConfig(item)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {editingConfig && (
        <ConfigEditDialog
          config={editingConfig}
          open={!!editingConfig}
          onOpenChange={(open) => { if (!open) setEditingConfig(null) }}
        />
      )}
    </>
  )
}
