"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Loader2, Plus, Trash2 } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { updateTicket } from "@/lib/actions/tickets"
import { ticketUpdateSchema, type TicketUpdateInput } from "@/lib/validations"
import { generateId, formatDateTimeInputValue, parseDateTimeLocalToISO } from "@/lib/utils"
import { PRIORITY_COLORS, PRIORITY_LABELS, STATUS_COLORS, STATUS_LABELS, type MaterialItem, type Ticket } from "@/types"

interface EditTicketFormProps {
  ticket: Ticket
  technicians: Array<{ id: string; nombre: string; apellido: string }>
}

export function EditTicketForm({ ticket, technicians }: EditTicketFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [materials, setMaterials] = useState<MaterialItem[]>(ticket.materiales_planificados ?? [])

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<TicketUpdateInput>({
    resolver: zodResolver(ticketUpdateSchema),
    defaultValues: {
      cliente_nombre: ticket.cliente_nombre,
      cliente_empresa: ticket.cliente_empresa ?? "",
      cliente_email: ticket.cliente_email ?? "",
      cliente_telefono: ticket.cliente_telefono,
      cliente_direccion: ticket.cliente_direccion,
      asunto: ticket.asunto,
      descripcion: ticket.descripcion,
      requerimientos: ticket.requerimientos ?? "",
      fecha_servicio: ticket.fecha_servicio ?? "",
      prioridad: ticket.prioridad,
      tecnico_id: ticket.tecnico_id ?? "",
      monto_servicio: ticket.monto_servicio,
      materiales_planificados: ticket.materiales_planificados ?? [],
    },
  })

  function addMaterial() {
    setMaterials((prev) => [
      ...prev,
      { id: generateId(), nombre: "", cantidad: 1, unidad: "UND" },
    ])
  }

  function removeMaterial(id: string) {
    setMaterials((prev) => prev.filter((material) => material.id !== id))
  }

  function updateMaterial(id: string, field: keyof MaterialItem, value: string | number) {
    setMaterials((prev) =>
      prev.map((material) => (material.id === id ? { ...material, [field]: value } : material))
    )
  }

  async function onSubmit(data: TicketUpdateInput) {
    setIsSubmitting(true)
    try {
      const result = await updateTicket(ticket.id, {
        ...data,
        fecha_servicio: parseDateTimeLocalToISO(data.fecha_servicio) || undefined,
        tecnico_id: data.tecnico_id || undefined,
        materiales_planificados: materials.length > 0 ? materials : undefined,
      })

      if (!result.success) {
        toast.error("No se pudo actualizar el ticket", {
          description: result.error ?? "Intenta nuevamente",
        })
        return
      }

      toast.success("Ticket actualizado", {
        description: result.message,
      })
      router.push(`/dashboard/tickets/${ticket.id}`)
      router.refresh()
    } catch {
      toast.error("No se pudo actualizar el ticket", {
        description: "Ocurrió un error inesperado",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-8"
    >
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
        <span className="text-sm font-medium text-slate-700">{ticket.numero_ticket}</span>
        <Badge className={STATUS_COLORS[ticket.estado]}>{STATUS_LABELS[ticket.estado]}</Badge>
        <Badge className={PRIORITY_COLORS[ticket.prioridad]}>{PRIORITY_LABELS[ticket.prioridad]}</Badge>
        <Badge variant="outline" className="capitalize">{ticket.tipo}</Badge>
        <span className="text-xs text-slate-500">
          Tipo y origen quedan fijos; aquí editas los datos operativos del ticket.
        </span>
      </div>

      <div className="form-section">
        <h3 className="form-section-title">Cliente</h3>
        <div className="form-row">
          <div className="form-group">
            <Label>Nombre del Cliente *</Label>
            <Input {...register("cliente_nombre")} error={errors.cliente_nombre?.message} />
          </div>
          <div className="form-group">
            <Label>Empresa</Label>
            <Input {...register("cliente_empresa")} error={errors.cliente_empresa?.message} />
          </div>

          <div className="form-group">
            <Label>Fecha y hora del servicio</Label>
            <Controller
              name="fecha_servicio"
              control={control}
              render={({ field }) => (
                <Input
                  type="datetime-local"
                  value={formatDateTimeInputValue(field.value)}
                  onChange={(event) => field.onChange(event.target.value)}
                  error={errors.fecha_servicio?.message}
                />
              )}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <Label>Correo Electrónico</Label>
            <Input type="email" {...register("cliente_email")} error={errors.cliente_email?.message} />
          </div>
          <div className="form-group">
            <Label>Teléfono *</Label>
            <Input {...register("cliente_telefono")} error={errors.cliente_telefono?.message} />
          </div>
        </div>

        <div className="form-group">
          <Label>Dirección *</Label>
          <Textarea {...register("cliente_direccion")} error={errors.cliente_direccion?.message} />
        </div>
      </div>

      <div className="form-section">
        <h3 className="form-section-title">Trabajo</h3>
        <div className="form-group">
          <Label>Asunto *</Label>
          <Input {...register("asunto")} error={errors.asunto?.message} />
        </div>
        <div className="form-group">
          <Label>Descripción *</Label>
          <Textarea className="min-h-[120px]" {...register("descripcion")} error={errors.descripcion?.message} />
        </div>
        <div className="form-group">
          <Label>Notas para el Técnico</Label>
          <Textarea className="min-h-[100px]" {...register("requerimientos")} error={errors.requerimientos?.message} />
        </div>
      </div>

      <div className="form-section">
        <h3 className="form-section-title">Planificación</h3>
        <div className="form-row">
          <div className="form-group">
            <Label>Prioridad *</Label>
            <Controller
              name="prioridad"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger error={errors.prioridad?.message}>
                    <SelectValue placeholder="Selecciona la prioridad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baja">Baja</SelectItem>
                    <SelectItem value="media">Media</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="form-group">
            <Label>Monto del Servicio ($)</Label>
            <Controller
              name="monto_servicio"
              control={control}
              render={({ field }) => (
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={field.value ?? ""}
                  onChange={(event) => field.onChange(event.target.value === "" ? undefined : Number(event.target.value))}
                  error={errors.monto_servicio?.message}
                />
              )}
            />
          </div>
        </div>

        <div className="form-group">
          <Label>Técnico asignado *</Label>
          <Controller
            name="tecnico_id"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value ?? ""}>
                <SelectTrigger error={errors.tecnico_id?.message}>
                  <SelectValue placeholder="Selecciona un técnico" />
                </SelectTrigger>
                <SelectContent>
                  {technicians.map((technician) => (
                    <SelectItem key={technician.id} value={technician.id}>
                      {technician.nombre} {technician.apellido}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <div className="form-section">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="form-section-title mb-0">Materiales planificados</h3>
          <Button type="button" variant="outline" size="sm" onClick={addMaterial}>
            <Plus className="mr-1 h-4 w-4" />
            Agregar
          </Button>
        </div>

        {materials.length === 0 ? (
          <p className="py-4 text-sm text-slate-500">Este ticket no tiene materiales planificados.</p>
        ) : (
          <div className="space-y-3">
            {materials.map((material) => (
              <div key={material.id} className="flex items-start gap-3">
                <div className="flex-1">
                  <Input
                    placeholder="Nombre del material"
                    value={material.nombre}
                    onChange={(event) => updateMaterial(material.id, "nombre", event.target.value)}
                  />
                </div>
                <div className="w-24">
                  <Input
                    type="number"
                    min="1"
                    value={material.cantidad}
                    onChange={(event) => updateMaterial(material.id, "cantidad", Number(event.target.value) || 1)}
                  />
                </div>
                <div className="w-28">
                  <Input
                    placeholder="Unidad"
                    value={material.unidad}
                    onChange={(event) => updateMaterial(material.id, "unidad", event.target.value)}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:bg-red-50 hover:text-red-600"
                  onClick={() => removeMaterial(material.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 pt-4">
        <Button
          type="button"
          variant="outline"
          disabled={isSubmitting}
          onClick={() => router.push(`/dashboard/tickets/${ticket.id}`)}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            "Guardar cambios"
          )}
        </Button>
      </div>
    </form>
  )
}
