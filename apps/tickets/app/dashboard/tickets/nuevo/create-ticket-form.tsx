"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Plus, Trash2, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ticketCreateSchema, type TicketCreateInput } from "@/lib/validations"
import { createTicket } from "@/lib/actions/tickets"
import { generateId } from "@/lib/utils"
import type { MaterialItem } from "@/types"

interface CreateTicketFormProps {
  technicians: Array<{ id: string; nombre: string; apellido: string }>
}

export function CreateTicketForm({ technicians }: CreateTicketFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [materials, setMaterials] = useState<MaterialItem[]>([])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TicketCreateInput>({
    resolver: zodResolver(ticketCreateSchema),
    defaultValues: {
      tipo: "servicio",
      prioridad: "media",
      origen: "email",
      monto_servicio: 40,
    },
  })

  const tipoTicket = watch("tipo")

  const addMaterial = () => {
    setMaterials([
      ...materials,
      { id: generateId(), nombre: "", cantidad: 1, unidad: "unidad" },
    ])
  }

  const removeMaterial = (id: string) => {
    setMaterials(materials.filter((m) => m.id !== id))
  }

  const updateMaterial = (id: string, field: keyof MaterialItem, value: string | number) => {
    setMaterials(
      materials.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    )
  }

  const onSubmit = async (data: TicketCreateInput) => {
    setIsSubmitting(true)
    try {
      // Agregar materiales al data
      const submitData = {
        ...data,
        materiales_planificados: materials.length > 0 ? materials : undefined,
        tecnico_id: data.tecnico_id || undefined,
      }

      const result = await createTicket(submitData)

      if (result.success) {
        toast.success("Ticket creado", {
          description: result.message,
        })
        router.push("/dashboard/tickets")
      } else {
        toast.error("Error", {
          description: result.error || "No se pudo crear el ticket",
        })
      }
    } catch {
      toast.error("Error", {
        description: "Ocurrió un error inesperado",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Tipo y Origen */}
      <div className="form-section">
        <h3 className="form-section-title">Tipo de Ticket</h3>
        <div className="form-row">
          <div className="form-group">
            <Label>Tipo *</Label>
            <Select
              defaultValue="servicio"
              onValueChange={(value) => setValue("tipo", value as "servicio" | "proyecto")}
            >
              <SelectTrigger error={errors.tipo?.message}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="servicio">Servicio ($40 fijo)</SelectItem>
                <SelectItem value="proyecto">Proyecto (monto variable)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="form-group">
            <Label>Origen *</Label>
            <Select
              defaultValue="email"
              onValueChange={(value) => setValue("origen", value as "email" | "telefono" | "carta_aceptacion")}
            >
              <SelectTrigger error={errors.origen?.message}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Correo electrónico</SelectItem>
                <SelectItem value="telefono">Llamada telefónica</SelectItem>
                <SelectItem value="carta_aceptacion">Carta de aceptación</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <Label>Prioridad *</Label>
            <Select
              defaultValue="media"
              onValueChange={(value) => setValue("prioridad", value as "baja" | "media" | "alta" | "urgente")}
            >
              <SelectTrigger error={errors.prioridad?.message}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="baja">Baja</SelectItem>
                <SelectItem value="media">Media</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
                <SelectItem value="urgente">Urgente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {tipoTicket === "proyecto" && (
            <div className="form-group">
              <Label>Monto del Proyecto ($) *</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                error={errors.monto_servicio?.message}
                {...register("monto_servicio", { valueAsNumber: true })}
              />
            </div>
          )}
        </div>
      </div>

      {/* Datos del Cliente */}
      <div className="form-section">
        <h3 className="form-section-title">Datos del Cliente</h3>
        <div className="form-row">
          <div className="form-group">
            <Label>Nombre del Cliente *</Label>
            <Input
              placeholder="Nombre completo"
              error={errors.cliente_nombre?.message}
              {...register("cliente_nombre")}
            />
          </div>
          <div className="form-group">
            <Label>Empresa</Label>
            <Input
              placeholder="Nombre de la empresa"
              error={errors.cliente_empresa?.message}
              {...register("cliente_empresa")}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <Label>Correo Electrónico</Label>
            <Input
              type="email"
              placeholder="correo@ejemplo.com"
              error={errors.cliente_email?.message}
              {...register("cliente_email")}
            />
          </div>
          <div className="form-group">
            <Label>Teléfono *</Label>
            <Input
              type="tel"
              placeholder="+58 412 123 4567"
              error={errors.cliente_telefono?.message}
              {...register("cliente_telefono")}
            />
          </div>
        </div>

        <div className="form-group">
          <Label>Dirección *</Label>
          <Textarea
            placeholder="Dirección completa del cliente"
            error={errors.cliente_direccion?.message}
            {...register("cliente_direccion")}
          />
        </div>
      </div>

      {/* Descripción del Trabajo */}
      <div className="form-section">
        <h3 className="form-section-title">Descripción del Trabajo</h3>
        <div className="form-group">
          <Label>Asunto *</Label>
          <Input
            placeholder="Breve descripción del servicio"
            error={errors.asunto?.message}
            {...register("asunto")}
          />
        </div>

        <div className="form-group">
          <Label>Descripción Detallada *</Label>
          <Textarea
            placeholder="Describe detalladamente el trabajo a realizar"
            className="min-h-[120px]"
            error={errors.descripcion?.message}
            {...register("descripcion")}
          />
        </div>

        <div className="form-group">
          <Label>Requerimientos Técnicos *</Label>
          <Textarea
            placeholder="Especifica los requerimientos técnicos necesarios"
            className="min-h-[100px]"
            error={errors.requerimientos?.message}
            {...register("requerimientos")}
          />
        </div>
      </div>

      {/* Materiales Planificados */}
      <div className="form-section">
        <div className="flex items-center justify-between mb-4">
          <h3 className="form-section-title mb-0">Materiales Planificados</h3>
          <Button type="button" variant="outline" size="sm" onClick={addMaterial}>
            <Plus className="h-4 w-4 mr-1" />
            Agregar
          </Button>
        </div>

        {materials.length === 0 ? (
          <p className="text-sm text-white/50 text-center py-4">
            No hay materiales planificados. Haz clic en &quot;Agregar&quot; para incluir materiales.
          </p>
        ) : (
          <div className="space-y-3">
            {materials.map((material, index) => (
              <div key={material.id} className="flex gap-3 items-start">
                <div className="flex-1">
                  <Input
                    placeholder="Nombre del material"
                    value={material.nombre}
                    onChange={(e) => updateMaterial(material.id, "nombre", e.target.value)}
                  />
                </div>
                <div className="w-24">
                  <Input
                    type="number"
                    min="1"
                    placeholder="Cant."
                    value={material.cantidad}
                    onChange={(e) => updateMaterial(material.id, "cantidad", parseInt(e.target.value) || 1)}
                  />
                </div>
                <div className="w-28">
                  <Input
                    placeholder="Unidad"
                    value={material.unidad}
                    onChange={(e) => updateMaterial(material.id, "unidad", e.target.value)}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeMaterial(material.id)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Asignación */}
      <div className="form-section">
        <h3 className="form-section-title">Asignación</h3>
        <div className="form-group">
          <Label>Técnico Asignado</Label>
          <Select onValueChange={(value) => setValue("tecnico_id", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar técnico (opcional)" />
            </SelectTrigger>
            <SelectContent>
              {technicians.length === 0 ? (
                <SelectItem value="" disabled>
                  No hay técnicos disponibles
                </SelectItem>
              ) : (
                technicians.map((tech) => (
                  <SelectItem key={tech.id} value={tech.id}>
                    {tech.nombre} {tech.apellido}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <p className="text-xs text-white/50 mt-1">
            Puedes asignar el técnico ahora o hacerlo después
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creando...
            </>
          ) : (
            "Crear Ticket"
          )}
        </Button>
      </div>
    </form>
  )
}
