"use client"

import { useState } from "react"
import { ClipboardCheck, Save, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import {
  createInspeccion,
  updateInspeccion,
  completarInspeccion,
} from "@/lib/actions/inspecciones"
import type { Inspeccion, ChecklistItem } from "@/types"
import { DEFAULT_CHECKLIST_CATEGORIAS } from "@/types"

interface InspeccionFormProps {
  ticketId: string
  inspeccion?: Inspeccion | null
  onSuccess?: () => void
}

export function InspeccionForm({ ticketId, inspeccion, onSuccess }: InspeccionFormProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  // Estado del checklist
  const [checklist, setChecklist] = useState<ChecklistItem[]>(
    inspeccion?.datos_checklist || initializeChecklist()
  )

  // Estados de campos de texto
  const [observaciones, setObservaciones] = useState(
    inspeccion?.observaciones_generales || ""
  )
  const [recomendaciones, setRecomendaciones] = useState(
    inspeccion?.recomendaciones || ""
  )

  const isCompleted = inspeccion?.estado === "completada"
  const isReported = inspeccion?.estado === "reportada"
  const canEdit = !isCompleted && !isReported

  function initializeChecklist(): ChecklistItem[] {
    return DEFAULT_CHECKLIST_CATEGORIAS.flatMap((cat) =>
      cat.items.map((item) => ({
        categoria: cat.categoria,
        item,
        cumple: false,
        observacion: "",
      }))
    )
  }

  function handleCheckChange(index: number, checked: boolean) {
    const updated = [...checklist]
    updated[index].cumple = checked
    setChecklist(updated)
  }

  function handleObservacionChange(index: number, value: string) {
    const updated = [...checklist]
    updated[index].observacion = value
    setChecklist(updated)
  }

  async function handleSave() {
    setLoading(true)
    try {
      const input = {
        datos_checklist: checklist,
        observaciones_generales: observaciones,
        recomendaciones,
      }

      const result = inspeccion
        ? await updateInspeccion(inspeccion.id, input)
        : await createInspeccion(ticketId, input)

      if (result.success) {
        toast({
          title: "Guardado",
          description: result.message,
        })
        onSuccess?.()
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleComplete() {
    if (!inspeccion) {
      toast({
        title: "Error",
        description: "Debe guardar la inspección antes de completarla",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const result = await completarInspeccion(inspeccion.id)

      if (result.success) {
        toast({
          title: "Completada",
          description: result.message,
        })
        onSuccess?.()
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  // Agrupar checklist por categoría
  const groupedChecklist = checklist.reduce((acc, item, index) => {
    if (!acc[item.categoria]) {
      acc[item.categoria] = []
    }
    acc[item.categoria].push({ ...item, index })
    return acc
  }, {} as Record<string, (ChecklistItem & { index: number })[]>)

  const totalItems = checklist.length
  const completedItems = checklist.filter((item) => item.cumple).length
  const completionPercentage = Math.round((completedItems / totalItems) * 100)

  return (
    <div className="space-y-6">
      {/* Header con progreso */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-blue-400" />
            Inspección Técnica
          </h2>
          <p className="text-sm text-white/60 mt-1">
            Formulario de levantamiento de información
          </p>
        </div>
        {inspeccion && (
          <div className="text-right">
            <div className="text-2xl font-bold text-white">
              {completionPercentage}%
            </div>
            <div className="text-xs text-white/60">
              {completedItems} de {totalItems} completados
            </div>
          </div>
        )}
      </div>

      {/* Estado badge */}
      {inspeccion && (
        <div className="flex items-center gap-2">
          {inspeccion.estado === "borrador" && (
            <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-300 text-xs font-semibold border border-yellow-500/30">
              Borrador
            </span>
          )}
          {inspeccion.estado === "completada" && (
            <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-300 text-xs font-semibold border border-green-500/30 flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Completada
            </span>
          )}
          {inspeccion.estado === "reportada" && (
            <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-500/30">
              Reportada
            </span>
          )}
        </div>
      )}

      {/* Checklist por categorías */}
      <div className="space-y-4">
        {Object.entries(groupedChecklist).map(([categoria, items]) => {
          const categoryCompleted = items.filter((i) => i.cumple).length
          const categoryTotal = items.length
          const categoryPercentage = Math.round((categoryCompleted / categoryTotal) * 100)

          return (
            <Card key={categoria} variant="glass">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold text-white">
                    {categoria}
                  </CardTitle>
                  <span className="text-sm text-white/60">
                    {categoryCompleted}/{categoryTotal} ({categoryPercentage}%)
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {items.map((item) => (
                  <div key={item.index} className="space-y-2">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id={`item-${item.index}`}
                        checked={item.cumple}
                        onCheckedChange={(checked) =>
                          handleCheckChange(item.index, checked === true)
                        }
                        disabled={!canEdit}
                        className="mt-0.5"
                      />
                      <Label
                        htmlFor={`item-${item.index}`}
                        className={`text-sm flex-1 cursor-pointer ${
                          item.cumple ? "text-white/90" : "text-white/70"
                        }`}
                      >
                        {item.item}
                      </Label>
                    </div>
                    {!item.cumple && (
                      <Textarea
                        placeholder="Observación (opcional)"
                        value={item.observacion}
                        onChange={(e) =>
                          handleObservacionChange(item.index, e.target.value)
                        }
                        disabled={!canEdit}
                        className="ml-8 text-xs"
                        rows={2}
                      />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Observaciones Generales */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-white">
            Observaciones Generales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Observaciones generales de la inspección..."
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            disabled={!canEdit}
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Recomendaciones */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-white">
            Recomendaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Recomendaciones técnicas..."
            value={recomendaciones}
            onChange={(e) => setRecomendaciones(e.target.value)}
            disabled={!canEdit}
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Advertencias */}
      {completedItems < totalItems && canEdit && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
          <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-yellow-300">
              Inspección incompleta
            </p>
            <p className="text-xs text-yellow-300/80 mt-1">
              Aún quedan {totalItems - completedItems} elementos sin revisar. 
              Asegúrate de completar todos los items antes de finalizar la inspección.
            </p>
          </div>
        </div>
      )}

      {/* Acciones */}
      {canEdit && (
        <div className="flex items-center gap-3">
          <Button
            onClick={handleSave}
            disabled={loading}
            className="flex-1"
            variant="outline"
          >
            <Save className="h-4 w-4 mr-2" />
            Guardar Borrador
          </Button>
          {inspeccion && completedItems === totalItems && (
            <Button
              onClick={handleComplete}
              disabled={loading}
              className="flex-1"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Completar Inspección
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
