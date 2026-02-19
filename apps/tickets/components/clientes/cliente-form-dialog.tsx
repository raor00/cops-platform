"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Cliente, ClienteCreateInput } from "@/types"
import { createCliente, updateCliente } from "@/lib/actions/clientes"

const clienteSchema = z.object({
  nombre: z.string().min(2, "Nombre requerido"),
  apellido: z.string().optional(),
  empresa: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  telefono: z.string().min(7, "Teléfono requerido"),
  direccion: z.string().min(5, "Dirección requerida"),
  rif_cedula: z.string().optional(),
  observaciones: z.string().optional(),
})

type ClienteFormValues = z.infer<typeof clienteSchema>

interface ClienteFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cliente?: Cliente
  onSuccess?: () => void
}

export function ClienteFormDialog({
  open,
  onOpenChange,
  cliente,
  onSuccess,
}: ClienteFormDialogProps) {
  const [loading, setLoading] = useState(false)
  const isEdit = !!cliente

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClienteFormValues>({
    resolver: zodResolver(clienteSchema),
    defaultValues: cliente
      ? {
          nombre: cliente.nombre,
          apellido: cliente.apellido ?? "",
          empresa: cliente.empresa ?? "",
          email: cliente.email ?? "",
          telefono: cliente.telefono,
          direccion: cliente.direccion,
          rif_cedula: cliente.rif_cedula ?? "",
          observaciones: cliente.observaciones ?? "",
        }
      : {
          nombre: "",
          apellido: "",
          empresa: "",
          email: "",
          telefono: "",
          direccion: "",
          rif_cedula: "",
          observaciones: "",
        },
  })

  async function onSubmit(values: ClienteFormValues) {
    setLoading(true)
    try {
      const input: ClienteCreateInput = {
        nombre: values.nombre,
        apellido: values.apellido || undefined,
        empresa: values.empresa || undefined,
        email: values.email || undefined,
        telefono: values.telefono,
        direccion: values.direccion,
        rif_cedula: values.rif_cedula || undefined,
        observaciones: values.observaciones || undefined,
      }

      const result = isEdit
        ? await updateCliente(cliente!.id, input)
        : await createCliente(input)

      if (!result.success) {
        toast.error(result.error ?? "Error al guardar cliente")
        return
      }

      toast.success(result.message ?? (isEdit ? "Cliente actualizado" : "Cliente creado"))
      reset()
      onOpenChange(false)
      onSuccess?.()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Cliente" : "Nuevo Cliente"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Nombre *</Label>
              <Input {...register("nombre")} placeholder="Juan" />
              {errors.nombre && <p className="text-xs text-red-400">{errors.nombre.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Apellido</Label>
              <Input {...register("apellido")} placeholder="Pérez" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Empresa</Label>
            <Input {...register("empresa")} placeholder="Empresa S.A." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>RIF / Cédula</Label>
              <Input {...register("rif_cedula")} placeholder="J-12345678-9" />
            </div>
            <div className="space-y-1.5">
              <Label>Teléfono *</Label>
              <Input {...register("telefono")} placeholder="+58 412 000 0000" />
              {errors.telefono && <p className="text-xs text-red-400">{errors.telefono.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input {...register("email")} type="email" placeholder="contacto@empresa.com" />
            {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Dirección *</Label>
            <Input {...register("direccion")} placeholder="Av. Principal, Caracas, Venezuela" />
            {errors.direccion && <p className="text-xs text-red-400">{errors.direccion.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Observaciones</Label>
            <Textarea
              {...register("observaciones")}
              placeholder="Notas adicionales sobre el cliente..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear cliente"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
