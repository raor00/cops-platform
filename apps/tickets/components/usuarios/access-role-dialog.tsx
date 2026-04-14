"use client"

import { useEffect, useState } from "react"
import { Loader2, ShieldCheck } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PermissionsEditor } from "@/components/usuarios/permissions-editor"
import { updateUserProfile } from "@/lib/actions/usuarios"
import { ROLE_LABELS, VISIBLE_USER_ROLES } from "@/types"
import type { Permission, UserProfile, UserRole } from "@/types"

const ALL_ROLES: UserRole[] = [...VISIBLE_USER_ROLES]

interface AccessRoleDialogProps {
  user: UserProfile
  canEditRole?: boolean
  canEditPermissions?: boolean
  onSuccess?: () => void
}

export function AccessRoleDialog({ user, canEditRole = false, canEditPermissions = false, onSuccess }: AccessRoleDialogProps) {
  const [open, setOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [role, setRole] = useState<UserRole>(user.rol)
  const [extraPermissions, setExtraPermissions] = useState<Permission[]>(user.permisos_extra ?? [])
  const [deniedPermissions, setDeniedPermissions] = useState<Permission[]>(user.permisos_denegados ?? [])

  useEffect(() => {
    if (open) {
      setRole(user.rol)
      setExtraPermissions(user.permisos_extra ?? [])
      setDeniedPermissions(user.permisos_denegados ?? [])
    }
  }, [open, user])

  const toggleExtra = (permission: Permission, checked: boolean) => {
    setExtraPermissions((prev) => checked ? [...new Set([...prev, permission])] : prev.filter((item) => item !== permission))
    if (checked) setDeniedPermissions((prev) => prev.filter((item) => item !== permission))
  }

  const toggleDenied = (permission: Permission, checked: boolean) => {
    setDeniedPermissions((prev) => checked ? [...new Set([...prev, permission])] : prev.filter((item) => item !== permission))
    if (checked) setExtraPermissions((prev) => prev.filter((item) => item !== permission))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const result = await updateUserProfile(user.id, {
        ...(canEditRole && role !== user.rol ? { rol: role } : {}),
        ...(canEditPermissions ? { permisos_extra: extraPermissions, permisos_denegados: deniedPermissions } : {}),
      })

      if (!result.success) {
        toast.error(result.error || "No se pudo actualizar el acceso")
        return
      }

      toast.success(result.message || "Acceso y permisos actualizados")
      setOpen(false)
      onSuccess?.()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error inesperado al actualizar acceso")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <ShieldCheck className="h-4 w-4 mr-2" />
          Editar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[680px] max-h-[90dvh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>Acceso, rol y permisos</DialogTitle>
          <DialogDescription>
            Administra el rol base y los permisos efectivos del usuario.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 pr-1">
          <div className="space-y-2">
            <Label htmlFor="role">Rol del sistema</Label>
            {canEditRole ? (
              <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ALL_ROLES.map((item) => (
                    <SelectItem key={item} value={item}>
                      {ROLE_LABELS[item]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                {ROLE_LABELS[user.rol]}
              </div>
            )}
          </div>

          {canEditPermissions && (
            <PermissionsEditor
              role={role}
              extraPermissions={extraPermissions}
              deniedPermissions={deniedPermissions}
              onToggleExtra={toggleExtra}
              onToggleDenied={toggleDenied}
            />
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isSaving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            Guardar cambios
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
