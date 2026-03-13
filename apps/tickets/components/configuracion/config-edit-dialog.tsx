"use client"

import { useState, useEffect } from "react"
import { Pencil, Loader2, Check } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { updateConfigValue } from "@/lib/actions/configuracion"
import type { SystemConfig } from "@/types"

interface ConfigEditDialogProps {
  config: SystemConfig
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ConfigEditDialog({ config, open, onOpenChange }: ConfigEditDialogProps) {
  const [valor, setValor] = useState(config.valor)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) setValor(config.valor)
  }, [open, config.valor])

  async function handleSave() {
    setSaving(true)
    try {
      const result = await updateConfigValue(config.clave, valor)
      if (result.success) {
        toast.success("Configuración actualizada")
        onOpenChange(false)
      } else {
        toast.error(result.error ?? "Error al guardar")
      }
    } finally {
      setSaving(false)
    }
  }

  const isMultiline = config.clave.endsWith("_direccion") || config.clave.endsWith("_url") || config.tipo_dato === "json"
  const isBoolean = config.tipo_dato === "boolean"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border border-slate-200 bg-white text-slate-900 shadow-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-4 w-4 text-sky-500" />
            Editar configuración
          </DialogTitle>
          <DialogDescription className="text-slate-500">
            {config.descripcion ?? config.clave}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div>
            <Label className="mb-1.5 block text-xs text-slate-500">
              Clave: <span className="font-mono text-sky-600">{config.clave}</span>
            </Label>

            {isBoolean ? (
              <div className="flex gap-3">
                <Button
                  type="button"
                  size="sm"
                  variant={valor === "true" ? "default" : "ghost"}
                  className={valor === "true" ? "border-0 bg-green-600 hover:bg-green-500" : "border border-slate-200 text-slate-600"}
                  onClick={() => setValor("true")}
                >
                  <Check className="h-3.5 w-3.5 mr-1.5" />
                  Activado
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={valor === "false" ? "default" : "ghost"}
                  className={valor === "false" ? "border-0 bg-red-600 hover:bg-red-500" : "border border-slate-200 text-slate-600"}
                  onClick={() => setValor("false")}
                >
                  Desactivado
                </Button>
              </div>
            ) : isMultiline ? (
              <Textarea
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                className="min-h-[80px] border-slate-200 bg-white text-slate-900 placeholder:text-slate-400"
                placeholder={`Valor de ${config.clave}`}
              />
            ) : (
              <Input
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                type={config.tipo_dato === "number" ? "number" : "text"}
                className="border-slate-200 bg-white text-slate-900 placeholder:text-slate-400"
                placeholder={`Valor de ${config.clave}`}
              />
            )}
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 border-0 shadow-lg shadow-blue-500/25"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              Guardar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

