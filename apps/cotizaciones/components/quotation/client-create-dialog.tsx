"use client"

import { useMemo, useState } from "react"
import type { Cliente, ClienteCreateInput } from "@cops/shared"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createCliente } from "@/lib/clientes-firestore"
import { toast } from "sonner"

interface ClientCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (cliente: Cliente) => void
}

const EMPTY_FORM: ClienteCreateInput = {
  nombre: "",
  apellido: "",
  empresa: "",
  email: "",
  telefono: "",
  direccion: "",
  rif_cedula: "",
  estado: "activo",
  observaciones: "",
  contactos: [],
}

export function ClientCreateDialog({ open, onOpenChange, onCreated }: ClientCreateDialogProps) {
  const [form, setForm] = useState<ClienteCreateInput>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const canSave = useMemo(
    () => Boolean(form.nombre.trim() && form.telefono.trim() && form.direccion.trim()),
    [form.direccion, form.nombre, form.telefono],
  )

  const reset = () => {
    setForm(EMPTY_FORM)
    setSaving(false)
  }

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen)
    if (!nextOpen) reset()
  }

  const handleSave = async () => {
    setSaving(true)

    const result = await createCliente({
      ...form,
      nombre: form.nombre.trim(),
      apellido: form.apellido?.trim() || "",
      empresa: form.empresa?.trim() || "",
      email: form.email?.trim() || "",
      telefono: form.telefono.trim(),
      direccion: form.direccion.trim(),
      rif_cedula: form.rif_cedula?.trim() || "",
      observaciones: "",
      contactos: [],
      estado: "activo",
    })

    setSaving(false)

    if (!result.success || !result.data) {
      toast.error(result.error || "No se pudo crear el cliente")
      return
    }

    toast.success(result.message || "Cliente creado")
    onCreated(result.data)
    handleOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Nuevo cliente</DialogTitle>
        </DialogHeader>

        <div className="grid gap-3 py-2 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Nombre</Label>
            <Input value={form.nombre} onChange={(event) => setForm((current) => ({ ...current, nombre: event.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label>Apellido</Label>
            <Input value={form.apellido || ""} onChange={(event) => setForm((current) => ({ ...current, apellido: event.target.value }))} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Empresa</Label>
            <Input value={form.empresa || ""} onChange={(event) => setForm((current) => ({ ...current, empresa: event.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input type="email" value={form.email || ""} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label>Teléfono</Label>
            <Input value={form.telefono} onChange={(event) => setForm((current) => ({ ...current, telefono: event.target.value }))} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Dirección</Label>
            <Input value={form.direccion} onChange={(event) => setForm((current) => ({ ...current, direccion: event.target.value }))} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>RIF / Cédula</Label>
            <Input value={form.rif_cedula || ""} onChange={(event) => setForm((current) => ({ ...current, rif_cedula: event.target.value }))} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!canSave || saving}>
            {saving ? "Guardando..." : "Guardar cliente"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
