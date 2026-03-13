"use client"

import { useState } from "react"
import { X, ZoomIn, ImageOff, ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"

export interface FotoItem {
  id: string
  url: string
  tipo: "progreso" | "inspeccion" | "documento" | "antes" | "despues"
  descripcion?: string
  created_at: string
}

const TIPO_LABELS: Record<FotoItem["tipo"], string> = {
  progreso: "Progreso",
  inspeccion: "Inspección",
  documento: "Documento",
  antes: "Antes",
  despues: "Después",
}

const TIPO_COLORS: Record<FotoItem["tipo"], string> = {
  progreso: "border-blue-200 bg-blue-50 text-blue-700",
  inspeccion: "border-amber-200 bg-amber-50 text-amber-700",
  documento: "border-violet-200 bg-violet-50 text-violet-700",
  antes: "border-orange-200 bg-orange-50 text-orange-700",
  despues: "border-green-200 bg-green-50 text-green-700",
}

interface TicketFotosGridProps {
  fotos: FotoItem[]
  canUpload?: boolean
}

export function TicketFotosGrid({ fotos, canUpload = false }: TicketFotosGridProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [filtro, setFiltro] = useState<FotoItem["tipo"] | "todas">("todas")

  const filtered = filtro === "todas" ? fotos : fotos.filter((foto) => foto.tipo === filtro)
  const tipos = Array.from(new Set(fotos.map((foto) => foto.tipo)))

  const openLightbox = (index: number) => setLightboxIndex(index)
  const closeLightbox = () => setLightboxIndex(null)

  const prev = () => {
    if (lightboxIndex === null) return
    setLightboxIndex(lightboxIndex === 0 ? filtered.length - 1 : lightboxIndex - 1)
  }

  const next = () => {
    if (lightboxIndex === null) return
    setLightboxIndex(lightboxIndex === filtered.length - 1 ? 0 : lightboxIndex + 1)
  }

  if (fotos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50">
          <ImageOff className="h-8 w-8 text-slate-300" />
        </div>
        <p className="text-sm font-medium text-slate-700">Sin fotografías registradas</p>
        {canUpload && <p className="mt-1 text-xs text-slate-500">La carga de fotos estará disponible próximamente</p>}
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      {tipos.length > 1 && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFiltro("todas")}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-all duration-200",
              filtro === "todas"
                ? "border-blue-200 bg-blue-50 text-blue-700"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900",
            )}
          >
            Todas ({fotos.length})
          </button>

          {tipos.map((tipo) => (
            <button
              key={tipo}
              onClick={() => setFiltro(tipo)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-all duration-200",
                filtro === tipo
                  ? TIPO_COLORS[tipo]
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900",
              )}
            >
              {TIPO_LABELS[tipo]} ({fotos.filter((foto) => foto.tipo === tipo).length})
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {filtered.map((foto, index) => (
          <button
            key={foto.id}
            onClick={() => openLightbox(index)}
            className={cn(
              "group relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-white transition-all duration-300",
              "hover:border-blue-400/40 hover:shadow-[0_8px_24px_rgba(14,47,111,0.12)]",
              "animate-scale-in",
            )}
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <img
              src={foto.url}
              alt={foto.descripcion || TIPO_LABELS[foto.tipo]}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            <span
              className={cn(
                "absolute left-2 top-2 rounded-full border px-2 py-0.5 text-[10px] font-semibold opacity-0 transition-opacity duration-200 group-hover:opacity-100",
                TIPO_COLORS[foto.tipo],
              )}
            >
              {TIPO_LABELS[foto.tipo]}
            </span>

            <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                <ZoomIn className="h-5 w-5 text-white" />
              </div>
            </div>
          </button>
        ))}
      </div>

      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={closeLightbox}
          style={{ animation: "fade-in 0.2s ease-out both" }}
        >
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />

          <div
            className="relative z-10 mx-4 flex max-h-[90vh] max-w-5xl flex-col items-center"
            onClick={(event) => event.stopPropagation()}
            style={{ animation: "scale-in 0.22s ease-out both" }}
          >
            <div className="relative max-h-[75vh] overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
              <img
                src={filtered[lightboxIndex]?.url}
                alt={filtered[lightboxIndex]?.descripcion || "Foto"}
                className="max-h-[75vh] max-w-full object-contain"
              />
            </div>

            <div className="mt-4 flex items-center gap-4">
              <button
                onClick={prev}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white transition-all duration-200 hover:bg-white/20 active:scale-95"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div className="text-center">
                <p className="text-sm font-medium text-white">
                  {filtered[lightboxIndex]?.descripcion || TIPO_LABELS[filtered[lightboxIndex]?.tipo ?? "progreso"]}
                </p>
                <p className="mt-0.5 text-xs text-white/40">
                  {lightboxIndex + 1} / {filtered.length}
                </p>
              </div>

              <button
                onClick={next}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white transition-all duration-200 hover:bg-white/20 active:scale-95"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          <button
            onClick={closeLightbox}
            className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white transition-all duration-200 hover:bg-white/20 active:scale-95"
          >
            <X className="h-5 w-5" />
          </button>

          {filtered.length > 1 && (
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
              {filtered.map((_, index) => (
                <button
                  key={index}
                  onClick={(event) => {
                    event.stopPropagation()
                    setLightboxIndex(index)
                  }}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    index === lightboxIndex ? "w-5 bg-white" : "w-1.5 bg-white/30 hover:bg-white/50",
                  )}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
