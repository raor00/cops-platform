"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { updateTicketFoto } from "@/lib/actions/fotos"
import type { TicketFoto, TipoFoto } from "@/types"
import { TIPO_FOTO_LABELS } from "@/types"

interface FotoEditDialogProps {
  foto: TicketFoto
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function FotoEditDialog({
  foto,
  open,
  onOpenChange,
  onSuccess,
}: FotoEditDialogProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [tipoFoto, setTipoFoto] = useState<TipoFoto>(foto.tipo_foto)
  const [descripcion, setDescripcion] = useState(foto.descripcion || "")

  useEffect(() => {
    setTipoFoto(foto.tipo_foto)
    setDescripcion(foto.descripcion || "")
  }, [foto])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)

    try {
      const result = await updateTicketFoto(foto.id, {
        tipo_foto: tipoFoto,
        descripcion: descripcion || undefined,
      })

      if (result.success) {
        toast.success(result.message || "Foto actualizada exitosamente")
        onSuccess?.()
      } else {
        toast.error(result.error || "Error al actualizar la foto")
      }
    } catch (error) {
      console.error("[v0] Update error:", error)
      toast.error("Error inesperado al actualizar la foto")
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Información de Foto</DialogTitle>
          <DialogDescription>
            Modifica el tipo o descripción de la foto
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Preview de la foto */}
          {foto.url && (
            <div className="w-full h-48 rounded-lg overflow-hidden border border-white/10">
              <img
                src={foto.url}
                alt={foto.nombre_archivo}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Tipo de foto */}
          <div>
            <Label htmlFor="tipo-foto">Tipo de Foto</Label>
            <Select
              value={tipoFoto}
              onValueChange={(value) => setTipoFoto(value as TipoFoto)}
            >
              <SelectTrigger id="tipo-foto">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TIPO_FOTO_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Descripción */}
          <div>
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              placeholder="Describe el contenido de la foto..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={3}
            />
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isUpdating}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
