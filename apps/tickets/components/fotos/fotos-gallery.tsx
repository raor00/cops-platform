"use client"

import { useState, useEffect } from "react"
import { Image as ImageIcon, Trash2, Edit, X, ZoomIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { getTicketFotos, deleteTicketFoto } from "@/lib/actions/fotos"
import { FotoUploadDialog } from "./foto-upload-dialog"
import { FotoEditDialog } from "./foto-edit-dialog"
import type { TicketFoto } from "@/types"
import { TIPO_FOTO_LABELS } from "@/types"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface FotosGalleryProps {
  ticketId: string
  canUpload: boolean
  canDelete: boolean
}

export function FotosGallery({
  ticketId,
  canUpload,
  canDelete,
}: FotosGalleryProps) {
  const [fotos, setFotos] = useState<TicketFoto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedFoto, setSelectedFoto] = useState<TicketFoto | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)

  const loadFotos = async () => {
    setIsLoading(true)
    const result = await getTicketFotos(ticketId)
    if (result.success && result.data) {
      setFotos(result.data)
    } else {
      toast.error(result.error || "Error al cargar fotos")
    }
    setIsLoading(false)
  }

  useEffect(() => {
    loadFotos()
  }, [ticketId])

  const handleDelete = async (fotoId: string) => {
    setDeletingId(fotoId)
    const result = await deleteTicketFoto(fotoId)

    if (result.success) {
      toast.success(result.message || "Foto eliminada")
      await loadFotos()
      setShowDeleteDialog(false)
      setSelectedFoto(null)
    } else {
      toast.error(result.error || "Error al eliminar foto")
    }
    setDeletingId(null)
  }

  const handleUploadSuccess = () => {
    loadFotos()
  }

  const handleEditSuccess = () => {
    loadFotos()
    setShowEditDialog(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header con botón de subir */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">
            Galería de Fotos
          </h3>
          <p className="text-sm text-white/60">
            {fotos.length} {fotos.length === 1 ? "foto" : "fotos"}
          </p>
        </div>
        {canUpload && (
          <FotoUploadDialog
            ticketId={ticketId}
            onUploadSuccess={handleUploadSuccess}
          />
        )}
      </div>

      {/* Grid de fotos */}
      {fotos.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-white/10 rounded-lg">
          <ImageIcon className="h-12 w-12 text-white/20 mb-3" />
          <p className="text-white/40 text-sm">No hay fotos en este ticket</p>
          {canUpload && (
            <FotoUploadDialog
              ticketId={ticketId}
              onUploadSuccess={handleUploadSuccess}
              trigger={
                <Button variant="ghost" size="sm" className="mt-3">
                  Subir la primera foto
                </Button>
              }
            />
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {fotos.map((foto) => (
            <div
              key={foto.id}
              className="group relative aspect-square rounded-lg overflow-hidden border border-white/10 bg-black/20 cursor-pointer hover:border-white/30 transition-all"
              onClick={() => setSelectedFoto(foto)}
            >
              {foto.url ? (
                <img
                  src={foto.url}
                  alt={foto.nombre_archivo}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="h-10 w-10 text-white/20" />
                </div>
              )}

              {/* Overlay con información */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <Badge
                    variant="outline"
                    className="text-xs mb-2 bg-black/50 backdrop-blur"
                  >
                    {TIPO_FOTO_LABELS[foto.tipo_foto]}
                  </Badge>
                  <p className="text-xs text-white/80 truncate">
                    {foto.nombre_archivo}
                  </p>
                </div>

                {/* Botones de acción */}
                <div className="absolute top-2 right-2 flex gap-1">
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-7 w-7 bg-black/70 backdrop-blur"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedFoto(foto)
                    }}
                  >
                    <ZoomIn className="h-3 w-3" />
                  </Button>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-7 w-7 bg-black/70 backdrop-blur"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedFoto(foto)
                      setShowEditDialog(true)
                    }}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  {canDelete && (
                    <Button
                      size="icon"
                      variant="destructive"
                      className="h-7 w-7"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedFoto(foto)
                        setShowDeleteDialog(true)
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de vista completa */}
      {selectedFoto && !showEditDialog && !showDeleteDialog && (
        <Dialog
          open={!!selectedFoto}
          onOpenChange={() => setSelectedFoto(null)}
        >
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span className="truncate">{selectedFoto.nombre_archivo}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedFoto(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {selectedFoto.url && (
                <div className="relative w-full max-h-[60vh] overflow-hidden rounded-lg border border-white/10">
                  <img
                    src={selectedFoto.url}
                    alt={selectedFoto.nombre_archivo}
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {TIPO_FOTO_LABELS[selectedFoto.tipo_foto]}
                  </Badge>
                  <span className="text-xs text-white/60">
                    Subida el{" "}
                    {format(
                      new Date(selectedFoto.created_at),
                      "d 'de' MMMM yyyy 'a las' HH:mm",
                      { locale: es }
                    )}
                  </span>
                </div>
                {selectedFoto.descripcion && (
                  <p className="text-sm text-white/80">
                    {selectedFoto.descripcion}
                  </p>
                )}
                {selectedFoto.subidor && (
                  <p className="text-xs text-white/60">
                    Subida por {selectedFoto.subidor.nombre}{" "}
                    {selectedFoto.subidor.apellido}
                  </p>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Dialog de edición */}
      {selectedFoto && showEditDialog && (
        <FotoEditDialog
          foto={selectedFoto}
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Dialog de confirmación de eliminación */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar foto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La foto se eliminará
              permanentemente del sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedFoto && handleDelete(selectedFoto.id)}
              disabled={!!deletingId}
              className="bg-red-500 hover:bg-red-600"
            >
              {deletingId ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
