"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Plus, Trash2, Star } from "lucide-react"
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
import { Badge } from "@/components/ui/badge"
import type { Cliente, ClienteCreateInput, ClienteContacto } from "@/types"
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

const emptyContact = (): Omit<ClienteContacto, "id"> => ({
  nombre: "",
  apellido: null,
  email: null,
  telefono: "",
  cargo: null,
  es_principal: false,
})

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

  // Contactos state
  const [contactos, setContactos] = useState<Omit<ClienteContacto, "id">[]>(
    () => (cliente?.contactos ?? []).map(({ id: _id, ...rest }) => rest)
  )
  const [showContactForm, setShowContactForm] = useState(false)
  const [newContact, setNewContact] = useState<Omit<ClienteContacto, "id">>(emptyContact())
  const [contactError, setContactError] = useState("")

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

  function handleAddContact() {
    if (!newContact.nombre.trim()) {
      setContactError("El nombre del contacto es requerido")
      return
    }
    if (!newContact.telefono.trim()) {
      setContactError("El teléfono del contacto es requerido")
      return
    }
    setContactError("")
    const esPrimero = contactos.length === 0
    const ct = { ...newContact, es_principal: esPrimero ? true : newContact.es_principal }
    // Solo uno puede ser principal
    const base = ct.es_principal
      ? contactos.map((c) => ({ ...c, es_principal: false }))
      : [...contactos]
    setContactos([...base, ct])
    setNewContact(emptyContact())
    setShowContactForm(false)
  }

  function handleRemoveContact(idx: number) {
    const updated = contactos.filter((_, i) => i !== idx)
    if (contactos[idx]?.es_principal && updated.length > 0) {
      updated[0] = { ...updated[0]!, es_principal: true }
    }
    setContactos(updated)
  }

  function handleSetPrincipal(idx: number) {
    setContactos(contactos.map((c, i) => ({ ...c, es_principal: i === idx })))
  }

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
        contactos: contactos.length > 0 ? contactos : undefined,
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
      setContactos([])
      setShowContactForm(false)
      onOpenChange(false)
      onSuccess?.()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg w-full mx-4 sm:mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Cliente" : "Nuevo Cliente"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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

          {/* ── Sección Contactos ── */}
          <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50/80 p-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Contactos</Label>
              {!showContactForm && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={() => setShowContactForm(true)}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Agregar contacto
                </Button>
              )}
            </div>

            {/* Lista de contactos existentes */}
            {contactos.length > 0 && (
              <div className="space-y-2">
                {contactos.map((ct, idx) => (
                  <div
                    key={idx}
                    className="flex items-start justify-between gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-medium">
                          {ct.nombre} {ct.apellido ?? ""}
                        </span>
                        {ct.es_principal && (
                          <Badge
                            variant="outline"
                            className="text-[10px] h-4 px-1 border-yellow-500/50 text-yellow-400"
                          >
                            Principal
                          </Badge>
                        )}
                      </div>
                      {ct.cargo && (
                        <p className="text-xs text-muted-foreground">{ct.cargo}</p>
                      )}
                      <p className="text-xs text-muted-foreground">{ct.telefono}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {!ct.es_principal && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          title="Marcar como principal"
                          onClick={() => handleSetPrincipal(idx)}
                        >
                          <Star className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-red-400 hover:text-red-300"
                        onClick={() => handleRemoveContact(idx)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Mini-form nuevo contacto */}
            {showContactForm && (
              <div className="space-y-2 rounded-md border border-slate-200 bg-white p-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Nuevo contacto
                </p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Nombre *</Label>
                    <Input
                      className="h-8 text-sm"
                      placeholder="Carlos"
                      value={newContact.nombre}
                      onChange={(e) =>
                        setNewContact({ ...newContact, nombre: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Apellido</Label>
                    <Input
                      className="h-8 text-sm"
                      placeholder="Rodríguez"
                      value={newContact.apellido ?? ""}
                      onChange={(e) =>
                        setNewContact({ ...newContact, apellido: e.target.value || null })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Teléfono *</Label>
                    <Input
                      className="h-8 text-sm"
                      placeholder="+58 412 000 0000"
                      value={newContact.telefono}
                      onChange={(e) =>
                        setNewContact({ ...newContact, telefono: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Cargo</Label>
                    <Input
                      className="h-8 text-sm"
                      placeholder="Gerente de TI"
                      value={newContact.cargo ?? ""}
                      onChange={(e) =>
                        setNewContact({ ...newContact, cargo: e.target.value || null })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Email</Label>
                  <Input
                    className="h-8 text-sm"
                    type="email"
                    placeholder="contacto@empresa.com"
                    value={newContact.email ?? ""}
                    onChange={(e) =>
                      setNewContact({ ...newContact, email: e.target.value || null })
                    }
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="ct-principal"
                    checked={newContact.es_principal}
                    onChange={(e) =>
                      setNewContact({ ...newContact, es_principal: e.target.checked })
                    }
                    className="rounded"
                  />
                  <Label htmlFor="ct-principal" className="text-xs cursor-pointer">
                    Contacto principal
                  </Label>
                </div>
                {contactError && <p className="text-xs text-red-400">{contactError}</p>}
                <div className="flex gap-2 pt-1">
                  <Button
                    type="button"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={handleAddContact}
                  >
                    Agregar
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => {
                      setShowContactForm(false)
                      setNewContact(emptyContact())
                      setContactError("")
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
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
