"use client"

import { useState, useEffect } from "react"
import { User, Camera, Trash2, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import {
  uploadProfilePhoto,
  deleteProfilePhoto,
  updateUserProfile,
} from "@/lib/actions/usuarios"
import { completeUserAccessAction } from "@/lib/actions/auth"
import type { UserProfile, UserRole } from "@/types"
import { ROLE_LABELS, VISIBLE_USER_ROLES } from "@/types"
import { getInitials } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const ALL_ROLES: UserRole[] = [...VISIBLE_USER_ROLES]

interface ProfileEditDialogProps {
  user: UserProfile
  canEditRole?: boolean
  onSuccess?: () => void
  trigger?: React.ReactNode
}

export function ProfileEditDialog({
  user,
  canEditRole = false,
  onSuccess,
  trigger,
}: ProfileEditDialogProps) {
  const [open, setOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    user.foto_perfil_url || null
  )
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [nombre, setNombre] = useState(user.nombre)
  const [apellido, setApellido] = useState(user.apellido)
  const [cargo, setCargo] = useState(user.cargo || "")
  const [rol, setRol] = useState<UserRole>(user.rol)
  const [telefono, setTelefono] = useState(user.telefono || "")
  const [especialidad, setEspecialidad] = useState(user.especialidad || "")
  const [email, setEmail] = useState(user.email || "")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  useEffect(() => {
    if (open) {
      setPreviewUrl(user.foto_perfil_url || null)
      setNombre(user.nombre)
      setApellido(user.apellido)
      setCargo(user.cargo || "")
      setRol(user.rol)
      setTelefono(user.telefono || "")
      setEspecialidad(user.especialidad || "")
      setEmail(user.email || "")
      setNewPassword("")
      setConfirmPassword("")
      setSelectedFile(null)
    }
  }, [open, user])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      toast.error("Tipo de archivo no permitido. Solo JPEG, PNG o WEBP")
      return
    }

    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error("El archivo es demasiado grande. Máximo 5 MB")
      return
    }

    setSelectedFile(file)

    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleUploadPhoto = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    try {
      const result = await uploadProfilePhoto(user.id, selectedFile)
      if (result.success) {
        toast.success(result.message || "Foto de perfil subida exitosamente")
        setSelectedFile(null)
        onSuccess?.()
      } else {
        toast.error(result.error || "Error al subir foto de perfil")
      }
    } catch {
      toast.error("Error inesperado al subir foto")
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeletePhoto = async () => {
    setIsUploading(true)
    try {
      const result = await deleteProfilePhoto(user.id)
      if (result.success) {
        toast.success(result.message || "Foto de perfil eliminada")
        setPreviewUrl(null)
        setSelectedFile(null)
        onSuccess?.()
      } else {
        toast.error(result.error || "Error al eliminar foto")
      }
    } catch {
      toast.error("Error inesperado al eliminar foto")
    } finally {
      setIsUploading(false)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!nombre.trim()) {
      toast.error("El nombre es requerido")
      return
    }

    if (newPassword && newPassword !== confirmPassword) {
      toast.error("Las contraseñas no coinciden")
      return
    }

    if (selectedFile) {
      await handleUploadPhoto()
    }

    setIsUpdating(true)
    try {
      const result = await updateUserProfile(user.id, {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        cargo: cargo.trim() || null,
        ...(canEditRole && rol !== user.rol ? { rol } : {}),
        telefono: telefono || undefined,
        especialidad: especialidad || undefined,
      })

      if (!result.success) {
        toast.error(result.error || "Error al actualizar perfil")
        return
      }

      const accessChanged = email.trim().toLowerCase() !== (user.email || "").trim().toLowerCase() || Boolean(newPassword)
      if (accessChanged) {
        const accessResult = await completeUserAccessAction(user.id, {
          email: email.trim(),
          password: newPassword || undefined,
        })

        if (!accessResult.success) {
          toast.error(accessResult.error || "Error al actualizar acceso")
          return
        }
      }

      if (result.success) {
        toast.success(result.message || "Perfil actualizado exitosamente")
        setOpen(false)
        onSuccess?.()
      }
    } catch {
      toast.error("Error inesperado al actualizar perfil")
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <User className="h-4 w-4 mr-2" />
            Editar Perfil
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90dvh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>Editar Perfil</DialogTitle>
          <DialogDescription>
            Actualiza tu información personal y foto de perfil
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleUpdateProfile} className="flex-1 overflow-y-auto space-y-6 pr-1">
          {/* Foto de perfil */}
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-24 w-24">
              {previewUrl && <AvatarImage src={previewUrl} alt={user.nombre} />}
              <AvatarFallback className="text-2xl">
                {getInitials(nombre || user.nombre, apellido || user.apellido)}
              </AvatarFallback>
            </Avatar>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isUploading}
                onClick={() => document.getElementById("photo-upload")?.click()}
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4 mr-2" />
                )}
                {selectedFile ? "Cambiar Foto" : "Subir Foto"}
              </Button>
              <input
                id="photo-upload"
                type="file"
                className="hidden"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
              />

              {(previewUrl || selectedFile) && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isUploading}
                  onClick={handleDeletePhoto}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </Button>
              )}
            </div>

            {selectedFile && (
              <p className="text-xs text-slate-500">
                Nueva foto seleccionada: {selectedFile.name}
              </p>
            )}
          </div>

          {/* Datos personales */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Nombre"
                  required
                />
              </div>
              <div>
                <Label htmlFor="apellido">Apellido</Label>
                <Input
                  id="apellido"
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  placeholder="Apellido"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="cargo">
                Cargo / Título personalizado
                <span className="ml-1.5 text-xs text-slate-400 font-normal">
                  (reemplaza "{ROLE_LABELS[user.rol]}" en la UI)
                </span>
              </Label>
              <Input
                id="cargo"
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
                placeholder={`Ej: Desarrollador, CEO, Administrador...`}
              />
            </div>

            <div>
              <Label htmlFor="email">Correo de acceso</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tecnico@copselectronics.com"
              />
              <p className="mt-1 text-xs text-slate-500">
                Si el perfil fue creado sin acceso, al guardar junto con una contraseña se habilitará su cuenta.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="new-password">Nueva contraseña</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              <div>
                <Label htmlFor="confirm-password">Confirmar contraseña</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite la contraseña"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="rol">Rol del sistema</Label>
              {canEditRole ? (
                <Select value={rol} onValueChange={(v) => setRol(v as UserRole)}>
                  <SelectTrigger id="rol">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_ROLES.map((r) => (
                      <SelectItem key={r} value={r}>
                        {ROLE_LABELS[r]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input value={ROLE_LABELS[user.rol]} disabled className="bg-slate-100 text-slate-500" />
              )}
            </div>

            <div>
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                type="tel"
                placeholder="Ej: +58 412-1234567"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="especialidad">Especialidad</Label>
              <Input
                id="especialidad"
                placeholder="Ej: Redes y Telecomunicaciones"
                value={especialidad}
                onChange={(e) => setEspecialidad(e.target.value)}
              />
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-2 pb-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isUpdating || isUploading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isUpdating || isUploading}>
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar Cambios"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
