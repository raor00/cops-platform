"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Package } from "lucide-react"

export interface ImagePreviewDialogProps {
  src?: string | null
  alt: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ImagePreviewDialog({ src, alt, open, onOpenChange }: ImagePreviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-4xl border-border bg-background p-0 sm:rounded-2xl">
        <DialogHeader className="border-b border-border px-6 py-4">
          <DialogTitle>Vista previa de imagen</DialogTitle>
          <DialogDescription className="truncate">{alt}</DialogDescription>
        </DialogHeader>

        <div className="flex min-h-[320px] items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-4 sm:min-h-[480px] sm:p-8">
          {src ? (
            <img
              src={src}
              alt={alt}
              className="max-h-[70vh] w-auto max-w-full object-contain transition-transform duration-300 ease-out hover:scale-[1.02]"
            />
          ) : (
            <div className="flex flex-col items-center gap-3 text-slate-300">
              <Package className="h-12 w-12" />
              <p className="text-sm">No hay imagen disponible para este producto.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
