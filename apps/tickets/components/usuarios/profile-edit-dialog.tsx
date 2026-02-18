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
import type { UserProfile } from "@/types"
import { getInitials } from "@/lib/utils"

interface ProfileEditDialogProps {
  user: UserProfile
  onSuccess?: () => void
  trigger?: React.ReactNode
}

export function ProfileEditDialog({
  user,
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
  const [telefono, setTelefono] = useState(user.telefono || "")
  const [especialidad, setEspecialidad] = useState(user.especialidad || "")

  useEffect(() => {
    if (open) {
      setPreviewUrl(user.foto_perfil_url || null)
      setTelefono(user.telefono || "")
      setEspecialidad(user.especialidad || "")
      setSelectedFile(null)
    }
  }, [open, user])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      toast.error("Tipo de archivo no permitido. Solo JPEG, PNG o WEBP")
      return
    }

    // Validar tamaño (5 MB máximo)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error("El archivo es demasiado grande. Máximo 5 MB")
      return
    }

    setSelectedFile(file)

    // Crear preview
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
    } catch (error) {
      console.error("[v0] Upload photo error:", error)
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
    } catch (error) {
      console.error("[v0] Delete photo error:", error)
      toast.error("Error inesperado al eliminar foto")
    } finally {
      setIsUploading(false)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()

    // Si hay una foto seleccionada, subirla primero
    if (selectedFile) {
      await handleUploadPhoto()
    }

    // Actualizar otros datos del perfil
    setIsUpdating(true)

    try {
      const result = await updateUserProfile(user.id, {
        telefono: telefono || undefined,
        especialidad: especialidad || undefined,
      })

      if (result.success) {
        toast.success(result.message || "Perfil actualizado exitosamente")
        setOpen(false)
        onSuccess?.()
      } else {
        toast.error(result.error || "Error al actualizar perfil")
      }
    } catch (error) {
      console.error("[v0] Update profile error:", error)
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Perfil</DialogTitle>
          <DialogDescription>
            Actualiza tu foto de perfil e información personal
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleUpdateProfile} className="space-y-6">
          {/* Foto de perfil */}
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-24 w-24">
              {previewUrl && <AvatarImage src={previewUrl} alt={user.nombre} />}
              <AvatarFallback className="text-2xl">
                {getInitials(user.nombre, user.apellido)}
              </AvatarFallback>
            </Avatar>

            <div className="flex gap-2">
              <label htmlFor="photo-upload">
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
              </label>
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
              <p className="text-xs text-white/60">
                Nueva foto seleccionada: {selectedFile.name}
              </p>
            )}
          </div>

          {/* Información básica (readonly) */}
          <div className="space-y-4">
            <div>
              <Label>Nombre Completo</Label>
              <Input
                value={`${user.nombre} ${user.apellido}`}
                disabled
                className="bg-white/5"
              />
            </div>

            <div>
              <Label>Email</Label>
              <Input value={user.email} disabled className="bg-white/5" />
            </div>

            <div>
              <Label>Rol</Label>
              <Input value={user.rol} disabled className="bg-white/5 capitalize" />
            </div>

            {/* Teléfono (editable) */}
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

            {/* Especialidad (editable) */}
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
          <div className="flex justify-end gap-2">
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
