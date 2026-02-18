"use client"

import { useState } from "react"
import { Upload, X, Image as ImageIcon } from "lucide-react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { uploadTicketFoto } from "@/lib/actions/fotos"
import type { TipoFoto } from "@/types"
import { TIPO_FOTO_LABELS, FOTO_UPLOAD_CONFIG } from "@/types"

interface FotoUploadDialogProps {
  ticketId: string
  onUploadSuccess?: () => void
  trigger?: React.ReactNode
}

export function FotoUploadDialog({
  ticketId,
  onUploadSuccess,
  trigger,
}: FotoUploadDialogProps) {
  const [open, setOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [tipoFoto, setTipoFoto] = useState<TipoFoto>("progreso")
  const [descripcion, setDescripcion] = useState("")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo
    if (!FOTO_UPLOAD_CONFIG.allowedTypes.includes(file.type as "image/jpeg" | "image/png" | "image/webp" | "image/heic")) {
      toast.error("Tipo de archivo no permitido. Solo JPEG, PNG, WEBP o HEIC")
      return
    }

    // Validar tamaño
    if (file.size > FOTO_UPLOAD_CONFIG.maxSizeBytes) {
      toast.error("El archivo es demasiado grande. Máximo 10 MB")
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

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedFile) {
      toast.error("Por favor selecciona una foto")
      return
    }

    setIsUploading(true)

    try {
      const result = await uploadTicketFoto(
        ticketId,
        selectedFile,
        tipoFoto,
        descripcion || undefined
      )

      if (result.success) {
        toast.success(result.message || "Foto subida exitosamente")
        setOpen(false)
        setSelectedFile(null)
        setPreviewUrl(null)
        setDescripcion("")
        setTipoFoto("progreso")
        onUploadSuccess?.()
      } else {
        toast.error(result.error || "Error al subir la foto")
      }
    } catch (error) {
      console.error("[v0] Upload error:", error)
      toast.error("Error inesperado al subir la foto")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Subir Foto
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Subir Foto al Ticket</DialogTitle>
          <DialogDescription>
            Sube fotos de progreso, inspección o documentación del ticket.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Área de selección de archivo */}
          <div>
            <Label htmlFor="file-upload">Archivo</Label>
            {!selectedFile ? (
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:border-white/40 transition-colors bg-black/20"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <ImageIcon className="h-10 w-10 text-white/40 mb-3" />
                  <p className="text-sm text-white/60 mb-1">
                    <span className="font-semibold">Click para subir</span> o
                    arrastra aquí
                  </p>
                  <p className="text-xs text-white/40">
                    JPEG, PNG, WEBP o HEIC (máx. 10 MB)
                  </p>
                </div>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept={FOTO_UPLOAD_CONFIG.allowedTypes.join(",")}
                  onChange={handleFileChange}
                />
              </label>
            ) : (
              <div className="relative w-full h-48 border border-white/20 rounded-lg overflow-hidden">
                <img
                  src={previewUrl || ""}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={handleRemoveFile}
                >
                  <X className="h-4 w-4" />
                </Button>
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-2">
                  <p className="text-xs text-white truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-white/60">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Tipo de foto */}
          <div>
            <Label htmlFor="tipo-foto">Tipo de Foto</Label>
            <Select
              value={tipoFoto}
              onValueChange={(value) => setTipoFoto(value as TipoFoto)}
            >
              <SelectTrigger id="tipo-foto">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TIPO_FOTO_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Descripción */}
          <div>
            <Label htmlFor="descripcion">Descripción (opcional)</Label>
            <Textarea
              id="descripcion"
              placeholder="Describe el contenido de la foto..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={3}
            />
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isUploading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={!selectedFile || isUploading}>
              {isUploading ? "Subiendo..." : "Subir Foto"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
