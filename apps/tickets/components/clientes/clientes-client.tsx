"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Plus, Search, Building2, User, Phone, Mail, MapPin, Trash2, Pencil, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { ClienteFormDialog } from "./cliente-form-dialog"
import { deleteCliente } from "@/lib/actions/clientes"
import type { Cliente, PaginatedResponse, UserRole } from "@/types"
import { hasPermission } from "@/types"
import { cn } from "@/lib/utils"

interface ClientesClientProps {
  initialData: PaginatedResponse<Cliente>
  userRole: UserRole
}

export function ClientesClient({ initialData, userRole }: ClientesClientProps) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCliente, setEditingCliente] = useState<Cliente | undefined>()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const canCreate = hasPermission(userRole, "clients:create")
  const canEdit = hasPermission(userRole, "clients:edit")
  const canDelete = userRole === "gerente" || userRole === "vicepresidente" || userRole === "presidente"

  // Client-side filtering (for demo; server-side in production)
  const filtered = initialData.data.filter((c) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      c.nombre.toLowerCase().includes(q) ||
      (c.empresa && c.empresa.toLowerCase().includes(q)) ||
      (c.rif_cedula && c.rif_cedula.toLowerCase().includes(q)) ||
      c.telefono.includes(q) ||
      (c.email && c.email.toLowerCase().includes(q))
    )
  })

  const selectedCliente = selectedId ? filtered.find((c) => c.id === selectedId) : null

  function handleCreate() {
    setEditingCliente(undefined)
    setDialogOpen(true)
  }

  function handleEdit(cliente: Cliente, e: React.MouseEvent) {
    e.stopPropagation()
    setEditingCliente(cliente)
    setDialogOpen(true)
  }

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirm("¿Eliminar este cliente? Esta acción no se puede deshacer.")) return
    const result = await deleteCliente(id)
    if (result.success) {
      toast.success("Cliente eliminado")
      if (selectedId === id) setSelectedId(null)
      startTransition(() => router.refresh())
    } else {
      toast.error(result.error ?? "Error al eliminar")
    }
  }

  function handleSuccess() {
    startTransition(() => router.refresh())
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Clientes</h1>
          <p className="page-description">{initialData.total} clientes registrados</p>
        </div>
        {canCreate && (
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Cliente
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre, empresa, RIF..."
          className="pl-9"
        />
      </div>

      {/* Content */}
      <div className={cn("grid gap-4", selectedCliente ? "md:grid-cols-[1fr_360px]" : "")}>
        {/* Table */}
        <Card variant="glass" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-4 py-3 text-white/50 font-medium">Cliente</th>
                  <th className="text-left px-4 py-3 text-white/50 font-medium hidden md:table-cell">
                    RIF / Cédula
                  </th>
                  <th className="text-left px-4 py-3 text-white/50 font-medium hidden lg:table-cell">
                    Contacto
                  </th>
                  <th className="text-left px-4 py-3 text-white/50 font-medium hidden xl:table-cell">
                    Tickets
                  </th>
                  <th className="text-left px-4 py-3 text-white/50 font-medium">Estado</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-white/40">
                      No se encontraron clientes
                    </td>
                  </tr>
                ) : (
                  filtered.map((cliente) => (
                    <tr
                      key={cliente.id}
                      onClick={() => setSelectedId(selectedId === cliente.id ? null : cliente.id)}
                      className={cn(
                        "border-b border-white/5 cursor-pointer transition-colors",
                        selectedId === cliente.id
                          ? "bg-sky-500/10"
                          : "hover:bg-white/5"
                      )}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-lg bg-sky-500/15 border border-sky-500/20 flex items-center justify-center shrink-0">
                            {cliente.empresa ? (
                              <Building2 className="h-4 w-4 text-sky-400" />
                            ) : (
                              <User className="h-4 w-4 text-sky-400" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-white">
                              {cliente.empresa ?? `${cliente.nombre}${cliente.apellido ? " " + cliente.apellido : ""}`}
                            </div>
                            {cliente.empresa && (
                              <div className="text-xs text-white/50">
                                {cliente.nombre}{cliente.apellido ? ` ${cliente.apellido}` : ""}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-white/60 hidden md:table-cell">
                        {cliente.rif_cedula ?? "—"}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-white/70">
                            <Phone className="h-3 w-3" />
                            {cliente.telefono}
                          </div>
                          {cliente.email && (
                            <div className="flex items-center gap-1.5 text-white/50 text-xs">
                              <Mail className="h-3 w-3" />
                              {cliente.email}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden xl:table-cell">
                        <span className="text-white/60">{cliente.tickets_count ?? 0}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs",
                            cliente.estado === "activo"
                              ? "bg-green-500/15 text-green-400 border-green-500/30"
                              : "bg-red-500/15 text-red-400 border-red-500/30"
                          )}
                        >
                          {cliente.estado === "activo" ? "Activo" : "Inactivo"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          {canEdit && (
                            <button
                              onClick={(e) => handleEdit(cliente, e)}
                              className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={(e) => handleDelete(cliente.id, e)}
                              className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <ChevronRight className="h-4 w-4 text-white/20" />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Detail Panel */}
        {selectedCliente && (
          <Card variant="glass" className="p-5 space-y-4 animate-scale-in self-start">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-xl bg-sky-500/15 border border-sky-500/20 flex items-center justify-center">
                  {selectedCliente.empresa ? (
                    <Building2 className="h-5 w-5 text-sky-400" />
                  ) : (
                    <User className="h-5 w-5 text-sky-400" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-white">
                    {selectedCliente.empresa ?? selectedCliente.nombre}
                  </h3>
                  <p className="text-xs text-white/50">
                    {selectedCliente.empresa
                      ? `${selectedCliente.nombre}${selectedCliente.apellido ? " " + selectedCliente.apellido : ""}`
                      : selectedCliente.rif_cedula ?? "Sin RIF/Cédula"}
                  </p>
                </div>
              </div>
              <Badge
                variant="outline"
                className={cn(
                  "text-xs",
                  selectedCliente.estado === "activo"
                    ? "bg-green-500/15 text-green-400 border-green-500/30"
                    : "bg-red-500/15 text-red-400 border-red-500/30"
                )}
              >
                {selectedCliente.estado === "activo" ? "Activo" : "Inactivo"}
              </Badge>
            </div>

            <div className="space-y-3 text-sm">
              {selectedCliente.rif_cedula && (
                <div>
                  <span className="text-white/40 text-xs">RIF / Cédula</span>
                  <p className="text-white/80">{selectedCliente.rif_cedula}</p>
                </div>
              )}
              <div className="flex items-center gap-2 text-white/70">
                <Phone className="h-3.5 w-3.5 text-white/40 shrink-0" />
                {selectedCliente.telefono}
              </div>
              {selectedCliente.email && (
                <div className="flex items-center gap-2 text-white/70">
                  <Mail className="h-3.5 w-3.5 text-white/40 shrink-0" />
                  {selectedCliente.email}
                </div>
              )}
              <div className="flex items-start gap-2 text-white/70">
                <MapPin className="h-3.5 w-3.5 text-white/40 shrink-0 mt-0.5" />
                {selectedCliente.direccion}
              </div>
              {selectedCliente.observaciones && (
                <div>
                  <span className="text-white/40 text-xs">Observaciones</span>
                  <p className="text-white/60 text-xs mt-0.5">{selectedCliente.observaciones}</p>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-white/40">
                {selectedCliente.tickets_count ?? 0} tickets registrados
              </span>
              {canEdit && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => handleEdit(selectedCliente, e)}
                  className="gap-1.5 text-xs"
                >
                  <Pencil className="h-3 w-3" />
                  Editar
                </Button>
              )}
            </div>
          </Card>
        )}
      </div>

      <ClienteFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        cliente={editingCliente}
        onSuccess={handleSuccess}
      />
    </div>
  )
}
