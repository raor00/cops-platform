"use client"

import { useEffect } from "react"
import type { CatalogItem } from "@/lib/quotation-types"

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  const tagName = target.tagName.toLowerCase()
  return target.isContentEditable || tagName === "input" || tagName === "textarea" || tagName === "select"
}

export function useCatalogKeyboard({
  items,
  selectedId,
  onSelect,
  onQuickView,
  onEdit,
  onDelete,
  onSearchFocus,
  onClearSelection,
  onEscape,
}: {
  items: CatalogItem[]
  selectedId: string | null
  onSelect: (id: string) => void
  onQuickView: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onSearchFocus: () => void
  onClearSelection?: () => void
  onEscape?: () => void
}) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (isTypingTarget(event.target)) {
        return
      }

      if (items.length === 0) {
        if (event.key === "/") {
          event.preventDefault()
          onSearchFocus()
        }
        return
      }

      const currentIndex = selectedId ? items.findIndex((item) => item.id === selectedId) : -1

      if (event.key === "ArrowDown") {
        event.preventDefault()
        const nextIndex = currentIndex >= 0 ? Math.min(currentIndex + 1, items.length - 1) : 0
        onSelect(items[nextIndex].id)
        return
      }

      if (event.key === "ArrowUp") {
        event.preventDefault()
        const nextIndex = currentIndex >= 0 ? Math.max(currentIndex - 1, 0) : items.length - 1
        onSelect(items[nextIndex].id)
        return
      }

      if (event.key === "Enter" && selectedId) {
        event.preventDefault()
        onQuickView(selectedId)
        return
      }

      if (event.key === "Escape") {
        onEscape?.()
        onClearSelection?.()
        return
      }

      if (event.key === "/") {
        event.preventDefault()
        onSearchFocus()
        return
      }

      if (event.key.toLowerCase() === "e" && selectedId) {
        event.preventDefault()
        onEdit(selectedId)
        return
      }

      if ((event.key === "Delete" || event.key === "Backspace") && selectedId) {
        event.preventDefault()
        const confirmed = window.confirm("¿Deseas eliminar el producto seleccionado?")
        if (confirmed) {
          onDelete(selectedId)
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [items, onClearSelection, onDelete, onEdit, onEscape, onQuickView, onSearchFocus, onSelect, selectedId])
}
