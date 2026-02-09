"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import type { CatalogItem, CatalogCategory } from "@/lib/quotation-types"
import { CATALOG_CATEGORIES, formatCurrency } from "@/lib/quotation-types"
import { getCatalog, saveCatalog, addCatalogItem, updateCatalogItem, deleteCatalogItem } from "@/lib/quotation-storage"
import { Plus, Search, Pencil, Trash2, Package, Cable, Filter } from "lucide-react"
import { toast } from "sonner"

const EMPTY_ITEM: Omit<CatalogItem, "id"> = {
  code: "",
  description: "",
  unitPrice: 0,
  category: "CCTV",
  unit: "UND",
}

export function CatalogManager() {
  const [catalog, setCatalog] = useState<CatalogItem[]>([])
  const [search, setSearch] = useState("")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null)
  const [form, setForm] = useState(EMPTY_ITEM)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  useEffect(() => {
    setCatalog(getCatalog())
  }, [])

  const filtered = useMemo(() => {
    return catalog.filter((item) => {
      const matchSearch =
        !search ||
        item.code.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase())
      const matchCat = filterCategory === "all" || item.category === filterCategory
      return matchSearch && matchCat
    })
  }, [catalog, search, filterCategory])

  const categoryCount = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const item of catalog) {
      counts[item.category] = (counts[item.category] || 0) + 1
    }
    return counts
  }, [catalog])

  const openCreate = () => {
    setEditingItem(null)
    setForm(EMPTY_ITEM)
    setDialogOpen(true)
  }

  const openEdit = (item: CatalogItem) => {
    setEditingItem(item)
    setForm({ code: item.code, description: item.description, unitPrice: item.unitPrice, category: item.category, unit: item.unit })
    setDialogOpen(true)
  }

  const handleSave = () => {
    if (!form.code.trim() || !form.description.trim()) {
      toast.error("Codigo y descripcion son requeridos")
      return
    }
    if (editingItem) {
      const updated = { ...editingItem, ...form }
      updateCatalogItem(updated)
      setCatalog(getCatalog())
      toast.success("Item actualizado")
    } else {
      const newItem: CatalogItem = { id: crypto.randomUUID(), ...form }
      addCatalogItem(newItem)
      setCatalog(getCatalog())
      toast.success("Item agregado al catalogo")
    }
    setDialogOpen(false)
  }

  const handleDelete = (id: string) => {
    deleteCatalogItem(id)
    setCatalog(getCatalog())
    setDeleteConfirmId(null)
    toast.success("Item eliminado")
  }

  const getCategoryIcon = (cat: CatalogCategory) => {
    if (cat === "Materiales") return <Cable className="h-3 w-3" />
    return <Package className="h-3 w-3" />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold text-foreground">
            Catalogo de Productos
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {catalog.length} items en total
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={openCreate}
            className="bg-[#1a5276] text-white hover:bg-[#0e3a57]"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Nuevo Item
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por codigo o descripcion..."
            className="border-border bg-card pl-10 text-foreground"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-48 border-border bg-card text-foreground">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorias</SelectItem>
              {CATALOG_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat} ({categoryCount[cat] || 0})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="space-y-3 sm:hidden">
        {filtered.map((item) => (
          <div key={item.id} className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-mono text-xs font-semibold text-[#1a5276]">{item.code}</p>
                <p className="mt-1 text-sm text-foreground">{item.description}</p>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={() => openEdit(item)} className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground">
                  <Pencil className="h-3.5 w-3.5" />
                  <span className="sr-only">Editar</span>
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setDeleteConfirmId(item.id)} className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" />
                  <span className="sr-only">Eliminar</span>
                </Button>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="secondary" className="gap-1 bg-secondary text-secondary-foreground">
                {getCategoryIcon(item.category)}
                {item.category}
              </Badge>
              <span className="rounded bg-muted px-2 py-0.5">{item.unit}</span>
              <span className="font-mono text-sm font-semibold text-foreground">
                ${formatCurrency(item.unitPrice)}
              </span>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No se encontraron items con los filtros aplicados
          </div>
        )}
      </div>

      {/* Table */}
      <div className="hidden overflow-hidden rounded-lg border border-border bg-card sm:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-[#0a1628]">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white">Codigo</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white">Descripcion</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white">Categoria</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-white">Unidad</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-white">Precio USD</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-white">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((item) => (
                <tr key={item.id} className="group transition-colors hover:bg-muted/50">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-[#1a5276]">{item.code}</td>
                  <td className="max-w-sm px-4 py-3 text-sm text-foreground">{item.description}</td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary" className="gap-1 bg-secondary text-secondary-foreground">
                      {getCategoryIcon(item.category)}
                      {item.category}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center text-xs text-muted-foreground">{item.unit}</td>
                  <td className="px-4 py-3 text-right font-mono text-sm font-semibold text-foreground">
                    ${formatCurrency(item.unitPrice)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(item)} className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground">
                        <Pencil className="h-3.5 w-3.5" />
                        <span className="sr-only">Editar</span>
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteConfirmId(item.id)} className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                        <span className="sr-only">Eliminar</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-sm text-muted-foreground">
                    No se encontraron items con los filtros aplicados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card text-foreground sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading text-foreground">
              {editingItem ? "Editar Item" : "Nuevo Item de Catalogo"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Codigo / Modelo</Label>
                <Input
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  placeholder="CAM-HIK-001"
                  className="border-border bg-card font-mono text-sm text-foreground"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Categoria</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as CatalogCategory })}>
                  <SelectTrigger className="border-border bg-card text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATALOG_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Descripcion</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Descripcion completa del producto"
                className="border-border bg-card text-foreground"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Precio Unitario (USD)</Label>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={form.unitPrice}
                  onChange={(e) => setForm({ ...form, unitPrice: Number(e.target.value) })}
                  className="border-border bg-card text-foreground"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Unidad de Medida</Label>
                <Select value={form.unit} onValueChange={(v) => setForm({ ...form, unit: v })}>
                  <SelectTrigger className="border-border bg-card text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UND">UND - Unidad</SelectItem>
                    <SelectItem value="BOB">BOB - Bobina</SelectItem>
                    <SelectItem value="BLS">BLS - Bolsa</SelectItem>
                    <SelectItem value="MTS">MTS - Metros</SelectItem>
                    <SelectItem value="RLL">RLL - Rollo</SelectItem>
                    <SelectItem value="KIT">KIT - Kit</SelectItem>
                    <SelectItem value="GLB">GLB - Global</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-border bg-transparent text-foreground">
              Cancelar
            </Button>
            <Button onClick={handleSave} className="bg-[#1a5276] text-white hover:bg-[#0e3a57]">
              {editingItem ? "Guardar Cambios" : "Agregar al Catalogo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent className="bg-card text-foreground sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-foreground">Confirmar eliminacion</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Este item sera eliminado del catalogo permanentemente. Esta accion no se puede deshacer.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)} className="border-border bg-transparent text-foreground">
              Cancelar
            </Button>
            <Button variant="destructive" onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
