"use client"

import { useState } from "react"
import { X, ZoomIn, ImageOff, ChevronLeft, ChevronRight, Download } from "lucide-react"
import { cn } from "@/lib/utils"

// Tipo liviano — en Sprint 4 se importará de @/types
export interface FotoItem {
  id: string
  url: string
  tipo: "progreso" | "inspeccion" | "documento" | "antes" | "despues"
  descripcion?: string
  created_at: string
}

const TIPO_LABELS: Record<FotoItem["tipo"], string> = {
  progreso:   "Progreso",
  inspeccion: "Inspección",
  documento:  "Documento",
  antes:      "Antes",
  despues:    "Después",
}

const TIPO_COLORS: Record<FotoItem["tipo"], string> = {
  progreso:   "bg-blue-500/20 text-blue-300 border-blue-500/30",
  inspeccion: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  documento:  "bg-purple-500/20 text-purple-300 border-purple-500/30",
  antes:      "bg-orange-500/20 text-orange-300 border-orange-500/30",
  despues:    "bg-green-500/20 text-green-300 border-green-500/30",
}

interface TicketFotosGridProps {
  fotos: FotoItem[]
  canUpload?: boolean
}

export function TicketFotosGrid({ fotos, canUpload = false }: TicketFotosGridProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [filtro, setFiltro] = useState<FotoItem["tipo"] | "todas">("todas")

  const filtered = filtro === "todas"
    ? fotos
    : fotos.filter((f) => f.tipo === filtro)

  const tipos = Array.from(new Set(fotos.map((f) => f.tipo)))

  const openLightbox = (idx: number) => setLightboxIndex(idx)
  const closeLightbox = () => setLightboxIndex(null)

  const prev = () => {
    if (lightboxIndex === null) return
    setLightboxIndex(lightboxIndex === 0 ? filtered.length - 1 : lightboxIndex - 1)
  }
  const next = () => {
    if (lightboxIndex === null) return
    setLightboxIndex(lightboxIndex === filtered.length - 1 ? 0 : lightboxIndex + 1)
  }

  // ── Empty state ──────────────────────────────────────────────────────────────
  if (fotos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-dashed border-white/20 mb-4">
          <ImageOff className="h-8 w-8 text-white/20" />
        </div>
        <p className="text-white/50 text-sm font-medium">Sin fotografías registradas</p>
        {canUpload && (
          <p className="text-white/30 text-xs mt-1">
            La carga de fotos estará disponible próximamente
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      {/* ── Filtros por tipo ── */}
      {tipos.length > 1 && (
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <button
            onClick={() => setFiltro("todas")}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium border transition-all duration-200",
              filtro === "todas"
                ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                : "bg-white/5 text-white/50 border-white/10 hover:bg-white/10 hover:text-white/70"
            )}
          >
            Todas ({fotos.length})
          </button>
          {tipos.map((tipo) => (
            <button
              key={tipo}
              onClick={() => setFiltro(tipo)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium border transition-all duration-200",
                filtro === tipo
                  ? TIPO_COLORS[tipo]
                  : "bg-white/5 text-white/50 border-white/10 hover:bg-white/10 hover:text-white/70"
              )}
            >
              {TIPO_LABELS[tipo]} ({fotos.filter((f) => f.tipo === tipo).length})
            </button>
          ))}
        </div>
      )}

      {/* ── Grid de fotos ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {filtered.map((foto, idx) => (
          <button
            key={foto.id}
            onClick={() => openLightbox(idx)}
            className={cn(
              "group relative aspect-square overflow-hidden rounded-xl border border-white/10",
              "bg-white/5 transition-all duration-300",
              "hover:border-blue-400/40 hover:shadow-[0_8px_32px_rgba(14,47,111,0.5)]",
              "animate-scale-in"
            )}
            style={{ animationDelay: `${idx * 60}ms` }}
          >
            {/* Imagen */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={foto.url}
              alt={foto.descripcion || TIPO_LABELS[foto.tipo]}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />

            {/* Overlay gradiente */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Badge tipo */}
            <span
              className={cn(
                "absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-semibold border",
                "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
                TIPO_COLORS[foto.tipo]
              )}
            >
              {TIPO_LABELS[foto.tipo]}
            </span>

            {/* Ícono zoom */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                <ZoomIn className="h-5 w-5 text-white" />
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* ── Lightbox ── */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={closeLightbox}
          style={{ animation: "fade-in 0.2s ease-out both" }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />

          {/* Contenido — no propaga click al backdrop */}
          <div
            className="relative z-10 flex flex-col items-center max-w-5xl max-h-[90vh] mx-4"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: "scale-in 0.22s ease-out both" }}
          >
            {/* Imagen principal */}
            <div className="relative overflow-hidden rounded-2xl shadow-2xl border border-white/10 max-h-[75vh]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={filtered[lightboxIndex]?.url}
                alt={filtered[lightboxIndex]?.descripcion || "Foto"}
                className="max-h-[75vh] max-w-full object-contain"
              />
            </div>

            {/* Controles inferiores */}
            <div className="flex items-center gap-4 mt-4">
              <button
                onClick={prev}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all duration-200 active:scale-95"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div className="text-center">
                <p className="text-sm text-white font-medium">
                  {filtered[lightboxIndex]?.descripcion || TIPO_LABELS[filtered[lightboxIndex]?.tipo ?? "progreso"]}
                </p>
                <p className="text-xs text-white/40 mt-0.5">
                  {lightboxIndex + 1} / {filtered.length}
                </p>
              </div>

              <button
                onClick={next}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all duration-200 active:scale-95"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Botón cerrar */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all duration-200 active:scale-95"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Indicadores (dots) */}
          {filtered.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
              {filtered.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex(i) }}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    i === lightboxIndex
                      ? "w-5 bg-white"
                      : "w-1.5 bg-white/30 hover:bg-white/50"
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
