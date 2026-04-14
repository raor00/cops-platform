"use client"

import { ALL_PERMISSIONS, ROLE_PERMISSIONS, ROLE_LABELS, type Permission, type UserRole } from "@/types"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface PermissionsEditorProps {
  role: UserRole
  extraPermissions: Permission[]
  deniedPermissions: Permission[]
  onToggleExtra: (permission: Permission, checked: boolean) => void
  onToggleDenied: (permission: Permission, checked: boolean) => void
}

export function PermissionsEditor({ role, extraPermissions, deniedPermissions, onToggleExtra, onToggleDenied }: PermissionsEditorProps) {
  const basePermissions = ROLE_PERMISSIONS[role] ?? []

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 p-4">
      <div>
        <h3 className="font-medium text-slate-900">Permisos del rol {ROLE_LABELS[role]}</h3>
        <p className="text-xs text-slate-500">Marca permisos adicionales o bloquea permisos heredados del rol base.</p>
      </div>

      <div className="space-y-3">
        {ALL_PERMISSIONS.map((permission) => {
          const isBase = basePermissions.includes(permission)
          const isExtra = extraPermissions.includes(permission)
          const isDenied = deniedPermissions.includes(permission)

          return (
            <div key={permission} className="grid gap-2 rounded-lg border border-slate-100 bg-slate-50/60 p-3 md:grid-cols-[1fr_auto_auto] md:items-center">
              <div>
                <p className="text-sm font-medium text-slate-800">{permission}</p>
                <p className="text-xs text-slate-500">
                  {isBase ? "Heredado por rol" : "No incluido en el rol base"}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id={`extra-${permission}`}
                  checked={isBase ? true : isExtra}
                  disabled={isBase}
                  onCheckedChange={(checked) => onToggleExtra(permission, checked === true)}
                />
                <Label htmlFor={`extra-${permission}`} className="text-xs text-slate-600">
                  Extra
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id={`deny-${permission}`}
                  checked={isDenied}
                  onCheckedChange={(checked) => onToggleDenied(permission, checked === true)}
                />
                <Label htmlFor={`deny-${permission}`} className="text-xs text-slate-600">
                  Denegar
                </Label>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
