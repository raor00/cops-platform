"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  FileText,
  FileImage,
  FileSpreadsheet,
  Upload,
  Trash2,
  Download,
  Loader2,
  X,
  FolderOpen,
} from "lucide-react"
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { getTicketDocumentos, uploadTicketDocumento, deleteTicketDocumento } from "@/lib/actions/documentos"
import { TIPO_DOCUMENTO_LABELS, DOCUMENTO_TIPO_OPTIONS, DOCUMENTO_UPLOAD_CONFIG } from "@/types"
import type { TicketDocumento, TipoDocumento } from "@/types"
import { cn, formatDateTimeExactVE } from "@/lib/utils"

interface DocumentosSectionProps {
  ticketId: string
  canUpload?: boolean
  canDelete?: boolean
}

function getFileIcon(mimeType: string | null, nombre: string) {
  const ext = nombre.split(".").pop()?.toLowerCase()
  if (mimeType?.startsWith("image/") || ["jpg", "jpeg", "png", "webp"].includes(ext ?? "")) {
    return <FileImage className="h-5 w-5 text-sky-500" />
  }
  if (mimeType?.includes("sheet") || mimeType?.includes("excel") || ["xls", "xlsx"].includes(ext ?? "")) {
    return <FileSpreadsheet className="h-5 w-5 text-green-500" />
  }
  return <FileText className="h-5 w-5 text-red-400" />
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return ""
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export function DocumentosSection({
  ticketId,
  canUpload = false,
  canDelete = false,
}: DocumentosSectionProps) {
  const router = useRouter()
  const [documentos, setDocumentos] = useState<TicketDocumento[]>([])
  const [loading, setLoading] = useState(true)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [tipoDocumento, setTipoDocumento] = useState<TipoDocumento>("comprobante_servicio")
  const [descripcion, setDescripcion] = useState("")
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchDocumentos = async () => {
    const result = await getTicketDocumentos(ticketId)
    if (result.success) setDocumentos(result.data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchDocumentos() }, [ticketId])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const ext = file.name.split(".").pop()?.toLowerCase() ?? ""
    const isAllowed =
      DOCUMENTO_UPLOAD_CONFIG.allowedTypes.includes(file.type) ||
      (DOCUMENTO_UPLOAD_CONFIG.allowedExtensions as readonly string[]).includes(ext)

    if (!isAllowed) {
      toast.error("Tipo de archivo no permitido", {
        description: "Sube PDF, imágenes (JPG, PNG) o documentos Office (Word, Excel)",
      })
      return
    }
    if (file.size > DOCUMENTO_UPLOAD_CONFIG.maxSizeBytes) {
      toast.error("Archivo demasiado grande. Máximo 25 MB")
      return
    }
    setSelectedFile(file)
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) return
    setIsUploading(true)
    try {
      const result = await uploadTicketDocumento(ticketId, selectedFile, tipoDocumento, descripcion || undefined)
      if (result.success && result.data) {
        setDocumentos((prev) => [result.data!, ...prev])
        setUploadOpen(false)
        setSelectedFile(null)
        setDescripcion("")
        setTipoDocumento("comprobante_servicio")
        toast.success("Documento subido exitosamente")
      } else {
        toast.error(result.error || "Error al subir el documento")
      }
    } catch {
      toast.error("Error inesperado al subir el documento")
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (doc: TicketDocumento) => {
    setDeletingId(doc.id)
    const result = await deleteTicketDocumento(doc.id)
    if (result.success) {
      setDocumentos((prev) => prev.filter((d) => d.id !== doc.id))
      toast.success("Documento eliminado")
      router.refresh()
    } else {
      toast.error(result.error || "Error al eliminar")
    }
    setDeletingId(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {documentos.length === 0
            ? "Sin documentos adjuntos"
            : `${documentos.length} documento${documentos.length !== 1 ? "s" : ""}`}
        </p>
        {canUpload && (
          <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Subir documento
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px]">
              <DialogHeader>
                <DialogTitle>Subir Documento</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleUpload} className="space-y-4 pt-2">
                {/* File picker */}
                {!selectedFile ? (
                  <label
                    htmlFor="doc-upload"
                    className="flex h-36 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 transition-colors hover:border-sky-400 hover:bg-sky-50/70"
                  >
                    <Upload className="mb-2 h-8 w-8 text-slate-400" />
                    <p className="text-sm text-slate-700">
                      <span className="font-semibold">Selecciona o arrastra</span> un archivo
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      PDF, Word, Excel, imágenes — máx. 25 MB
                    </p>
                    <input
                      id="doc-upload"
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp"
                      onChange={handleFileChange}
                    />
                  </label>
                ) : (
                  <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                    {getFileIcon(selectedFile.type, selectedFile.name)}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-800">{selectedFile.name}</p>
                      <p className="text-xs text-slate-500">{formatFileSize(selectedFile.size)}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0"
                      onClick={() => setSelectedFile(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {/* Tipo */}
                <div>
                  <Label htmlFor="tipo-doc">Tipo de documento</Label>
                  <Select value={tipoDocumento} onValueChange={(v) => setTipoDocumento(v as TipoDocumento)}>
                    <SelectTrigger id="tipo-doc" className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DOCUMENTO_TIPO_OPTIONS.map((key) => (
                        <SelectItem key={key} value={key}>{TIPO_DOCUMENTO_LABELS[key]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Descripción */}
                <div>
                  <Label htmlFor="doc-desc">Descripción (opcional)</Label>
                  <Textarea
                    id="doc-desc"
                    placeholder="Ej: Plano de planta del piso 3, revisión 2..."
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    rows={2}
                    className="mt-1 resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setUploadOpen(false)} disabled={isUploading}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={!selectedFile || isUploading}>
                    {isUploading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Subiendo...</>
                    ) : (
                      <><Upload className="mr-2 h-4 w-4" />Subir</>
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Document list */}
      {documentos.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 p-10 text-center">
          <FolderOpen className="mx-auto mb-3 h-10 w-10 text-slate-300" />
          <p className="text-sm font-medium text-slate-600">Sin documentos adjuntos</p>
          {canUpload && (
            <p className="mt-1 text-xs text-slate-400">
              Sube planos, memorias técnicas, contratos o cualquier archivo relevante al proyecto
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {documentos.map((doc, i) => (
            <div
              key={doc.id}
              className={cn(
                "flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 transition-colors hover:bg-slate-50 animate-fade-in",
                `stagger-${Math.min(i + 1, 6) as 1 | 2 | 3 | 4 | 5 | 6}`
              )}
            >
              <div className="shrink-0">{getFileIcon(doc.mime_type, doc.nombre_archivo)}</div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-800">{doc.nombre_archivo}</p>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <span className="text-xs font-medium text-sky-600">
                    {TIPO_DOCUMENTO_LABELS[doc.tipo_documento]}
                  </span>
                  {doc.tamanio_bytes && (
                    <span className="text-xs text-slate-400">{formatFileSize(doc.tamanio_bytes)}</span>
                  )}
                  {doc.descripcion && (
                    <span className="text-xs text-slate-500 truncate max-w-[200px]">{doc.descripcion}</span>
                  )}
                </div>
                {doc.subidor && (
                  <p className="mt-0.5 text-[10px] text-slate-400">
                    {doc.subidor.nombre} {doc.subidor.apellido} · {formatDateTimeExactVE(doc.created_at)} VE
                  </p>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-1">
                {doc.url && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-slate-500 hover:text-sky-600"
                    asChild
                  >
                    <a href={doc.url} target="_blank" rel="noopener noreferrer" download={doc.nombre_archivo}>
                      <Download className="h-4 w-4" />
                    </a>
                  </Button>
                )}
                {canDelete && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-slate-400 hover:text-red-500"
                        disabled={deletingId === doc.id}
                      >
                        {deletingId === doc.id
                          ? <Loader2 className="h-4 w-4 animate-spin" />
                          : <Trash2 className="h-4 w-4" />
                        }
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar documento?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Se eliminará <strong>{doc.nombre_archivo}</strong>. Esta acción no se puede deshacer.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-600 hover:bg-red-700"
                          onClick={() => handleDelete(doc)}
                        >
                          Eliminar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
