"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import type { CatalogCategory, CatalogDiscountConfig, CatalogItem } from "@/lib/quotation-types"
import { CATALOG_CATEGORIES, formatCurrency } from "@/lib/quotation-types"
import {
  addCatalogItem,
  deleteCatalogItem,
  getCatalog,
  getCatalogDiscountConfig,
  saveCatalog,
  saveCatalogDiscountConfig,
  updateCatalogItem,
} from "@/lib/quotation-storage"
import { ABLEREX_CATALOG } from "@/lib/ablerex-catalog"
import { Cable, DollarSign, Filter, Package, Pencil, Percent, Plus, Search, Tags, Trash2 } from "lucide-react"
import { toast } from "sonner"

const EMPTY_ITEM: Omit<CatalogItem, "id"> = {
  code: "",
  description: "",
  unitPrice: 0,
  imageUrl: "",
  brand: "General",
  category: "CCTV",
  subcategory: "General",
  variant: "",
  unit: "UND",
}

type CatalogTab = "general" | "ablerex"
type PriceAction = "increase" | "decrease"
type PriceScope = "selected" | "visible" | "category" | "all-ablerex"

export function CatalogManager() {
  const [catalog, setCatalog] = useState<CatalogItem[]>([])
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState<CatalogTab>("general")
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterSubcategory, setFilterSubcategory] = useState("all")
  const [filterVariant, setFilterVariant] = useState("all")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [priceDrafts, setPriceDrafts] = useState<Record<string, string>>({})
  const [previewImage, setPreviewImage] = useState<{ src: string; code: string; description: string } | null>(null)

  const [priceAction, setPriceAction] = useState<PriceAction>("increase")
  const [priceMode, setPriceMode] = useState<CatalogDiscountConfig["mode"]>("percentage")
  const [priceScope, setPriceScope] = useState<PriceScope>("selected")
  const [priceValue, setPriceValue] = useState(0)
  const [priceCategory, setPriceCategory] = useState("")

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null)
  const [form, setForm] = useState(EMPTY_ITEM)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [discountConfig, setDiscountConfig] = useState<CatalogDiscountConfig>({
    enabled: false,
    mode: "percentage",
    value: 0,
    scope: "all",
    category: "",
    subcategory: "",
  })

  useEffect(() => {
    setCatalog(getCatalog())
    setDiscountConfig(getCatalogDiscountConfig())
  }, [])

  const tabCatalog = useMemo(() => {
    if (activeTab === "ablerex") {
      return catalog.filter((item) => (item.brand || "General").toLowerCase() === "ablerex")
    }
    return catalog.filter((item) => (item.brand || "General").toLowerCase() !== "ablerex")
  }, [catalog, activeTab])

  const filtered = useMemo(() => {
    return tabCatalog.filter((item) => {
      const matchSearch =
        !search ||
        item.code.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase())
      const matchCategory = filterCategory === "all" || item.category === filterCategory
      const matchSubcategory = filterSubcategory === "all" || (item.subcategory || "General") === filterSubcategory
      const matchVariant = filterVariant === "all" || (item.variant || "") === filterVariant
      return matchSearch && matchCategory && matchSubcategory && matchVariant
    })
  }, [tabCatalog, search, filterCategory, filterSubcategory, filterVariant])

  const visibleIds = useMemo(() => filtered.map((item) => item.id), [filtered])
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id))

  const allCategories = useMemo(
    () => Array.from(new Set([...CATALOG_CATEGORIES, ...tabCatalog.map((item) => item.category)])).sort(),
    [tabCatalog],
  )

  const subcategories = useMemo(() => {
    const allowed = tabCatalog.filter((item) => (filterCategory === "all" ? true : item.category === filterCategory))
    return Array.from(new Set(allowed.map((item) => item.subcategory || "General"))).sort()
  }, [tabCatalog, filterCategory])

  const variants = useMemo(() => {
    const allowed = tabCatalog.filter((item) => {
      const catMatch = filterCategory === "all" ? true : item.category === filterCategory
      const subMatch = filterSubcategory === "all" ? true : (item.subcategory || "General") === filterSubcategory
      return catMatch && subMatch
    })
    return Array.from(new Set(allowed.map((item) => item.variant || "").filter(Boolean))).sort()
  }, [tabCatalog, filterCategory, filterSubcategory])

  const counts = useMemo(() => {
    const all = catalog.length
    const ablerex = catalog.filter((item) => (item.brand || "General").toLowerCase() === "ablerex").length
    return { all, ablerex, general: all - ablerex }
  }, [catalog])

  const getCategoryIcon = (cat: CatalogCategory) => (cat === "Materiales" ? <Cable className="h-3 w-3" /> : <Package className="h-3 w-3" />)

  const getEffectivePrice = (item: CatalogItem): number => {
    if (!discountConfig.enabled || discountConfig.value <= 0) return item.unitPrice

    const matchScope =
      discountConfig.scope === "all" ||
      (discountConfig.scope === "category" && item.category === discountConfig.category) ||
      (discountConfig.scope === "subcategory" && (item.subcategory || "General") === discountConfig.subcategory)

    if (!matchScope) return item.unitPrice

    const next =
      discountConfig.mode === "percentage"
        ? item.unitPrice * (1 - discountConfig.value / 100)
        : item.unitPrice - discountConfig.value

    return Math.max(0, Number(next.toFixed(2)))
  }

  const toggleSelected = (id: string, checked: boolean) => {
    setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)))
  }

  const toggleSelectAllVisible = (checked: boolean) => {
    if (!checked) {
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.includes(id)))
      return
    }
    setSelectedIds((prev) => Array.from(new Set([...prev, ...visibleIds])))
  }

  const clearSelection = () => setSelectedIds([])

  const openCreate = () => {
    setEditingItem(null)
    setForm({ ...EMPTY_ITEM, brand: activeTab === "ablerex" ? "Ablerex" : "General" })
    setDialogOpen(true)
  }

  const openEdit = (item: CatalogItem) => {
    setEditingItem(item)
    setForm({
      code: item.code,
      description: item.description,
      unitPrice: item.unitPrice,
      imageUrl: item.imageUrl || "",
      brand: item.brand || "General",
      category: item.category,
      subcategory: item.subcategory || "General",
      variant: item.variant || "",
      unit: item.unit,
    })
    setDialogOpen(true)
  }

  const handleSave = () => {
    if (!form.code.trim() || !form.description.trim()) {
      toast.error("Codigo y descripcion son requeridos")
      return
    }

    if (editingItem) {
      updateCatalogItem({ ...editingItem, ...form })
      toast.success("Item actualizado")
    } else {
      addCatalogItem({ id: crypto.randomUUID(), ...form })
      toast.success("Item agregado al catalogo")
    }
    setCatalog(getCatalog())
    setDialogOpen(false)
  }

  const handleDelete = (id: string) => {
    deleteCatalogItem(id)
    setCatalog(getCatalog())
    setSelectedIds((prev) => prev.filter((x) => x !== id))
    setDeleteConfirmId(null)
    toast.success("Item eliminado")
  }

  const handleSaveQuickPrice = (item: CatalogItem) => {
    const raw = priceDrafts[item.id]
    if (raw === undefined) return
    const next = Number(raw)
    if (Number.isNaN(next) || next < 0) {
      toast.error("Precio invalido")
      return
    }
    updateCatalogItem({ ...item, unitPrice: Number(next.toFixed(2)) })
    setCatalog(getCatalog())
    toast.success(`Precio actualizado: ${item.code}`)
  }

  const applyMassivePriceAdjustment = () => {
    if (priceValue <= 0) {
      toast.error("Indique un valor mayor a 0")
      return
    }

    let targetIds: string[] = []
    if (priceScope === "selected") targetIds = selectedIds
    if (priceScope === "visible") targetIds = visibleIds
    if (priceScope === "category") {
      if (!priceCategory) {
        toast.error("Seleccione una categoria")
        return
      }
      targetIds = catalog.filter((item) => item.category === priceCategory).map((item) => item.id)
    }
    if (priceScope === "all-ablerex") {
      targetIds = catalog.filter((item) => (item.brand || "General").toLowerCase() === "ablerex").map((item) => item.id)
    }

    if (targetIds.length === 0) {
      toast.error("No hay productos para ajustar")
      return
    }

    const targetSet = new Set(targetIds)
    const updated = catalog.map((item) => {
      if (!targetSet.has(item.id)) return item

      const delta = priceMode === "percentage" ? item.unitPrice * (priceValue / 100) : priceValue
      const next = priceAction === "increase" ? item.unitPrice + delta : item.unitPrice - delta
      return { ...item, unitPrice: Math.max(0, Number(next.toFixed(2))) }
    })

    saveCatalog(updated)
    setCatalog(updated)
    toast.success(`Precios ajustados en ${targetIds.length} productos`)
  }

  const handleSyncAblerexCatalog = () => {
    const current = getCatalog()
    const keep = current.filter((item) => (item.brand || "General").toLowerCase() !== "ablerex")
    const merged = [...keep, ...ABLEREX_CATALOG]
    saveCatalog(merged)
    setCatalog(merged)
    toast.success(`Catalogo Ablerex actualizado (${ABLEREX_CATALOG.length} productos)`)
  }

  const handleSaveDiscountConfig = () => {
    const normalized = {
      ...discountConfig,
      value: Math.max(discountConfig.value, 0),
      category: discountConfig.scope === "category" || discountConfig.scope === "subcategory" ? discountConfig.category : "",
      subcategory: discountConfig.scope === "subcategory" ? discountConfig.subcategory : "",
    }
    saveCatalogDiscountConfig(normalized)
    setDiscountConfig(normalized)
    toast.success("Descuento global guardado")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold text-foreground">Catalogo de Productos</h2>
          <p className="mt-1 text-sm text-muted-foreground">{counts.all} items en total</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleSyncAblerexCatalog} className="border-border bg-transparent text-muted-foreground hover:bg-muted">
            Actualizar Ablerex
          </Button>
          <Button size="sm" onClick={openCreate} className="bg-[#1a5276] text-white hover:bg-[#0e3a57]">
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Nuevo Item
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as CatalogTab); clearSelection() }}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="general">Catalogo General ({counts.general})</TabsTrigger>
          <TabsTrigger value="ablerex">Ablerex ({counts.ablerex})</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="relative xl:col-span-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por codigo o descripcion..." className="pl-10" />
          </div>
          <Select value={filterCategory} onValueChange={(value) => { setFilterCategory(value); setFilterSubcategory("all"); setFilterVariant("all") }}>
            <SelectTrigger><SelectValue placeholder="Categoria" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorias</SelectItem>
              {allCategories.map((cat) => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterSubcategory} onValueChange={(value) => { setFilterSubcategory(value); setFilterVariant("all") }}>
            <SelectTrigger><SelectValue placeholder="Subcategoria" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las subcategorias</SelectItem>
              {subcategories.map((sub) => <SelectItem key={sub} value={sub}>{sub}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterVariant} onValueChange={setFilterVariant}>
            <SelectTrigger><SelectValue placeholder="Variante" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las variantes</SelectItem>
              {variants.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3 rounded-md border border-border bg-muted/20 p-3">
          <div className="flex items-center gap-2">
            <Checkbox checked={allVisibleSelected} onCheckedChange={(c) => toggleSelectAllVisible(Boolean(c))} />
            <span className="text-sm text-foreground">Seleccionar visibles</span>
          </div>
          <Badge variant="secondary">{selectedIds.length} seleccionados</Badge>
          <Button variant="ghost" size="sm" onClick={clearSelection} className="text-muted-foreground">Limpiar seleccion</Button>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-3 flex items-center gap-2">
          <Filter className="h-4 w-4 text-[#1a5276]" />
          <h3 className="text-sm font-semibold text-foreground">Ajuste de Precios</h3>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
          <Select value={priceAction} onValueChange={(v) => setPriceAction(v as PriceAction)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="increase">Aumentar</SelectItem>
              <SelectItem value="decrease">Reducir</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priceMode} onValueChange={(v) => setPriceMode(v as CatalogDiscountConfig["mode"])}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="percentage">Porcentaje (%)</SelectItem>
              <SelectItem value="amount">Monto (USD)</SelectItem>
            </SelectContent>
          </Select>
          <div className="relative">
            {priceMode === "percentage" ? <Percent className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" /> : <DollarSign className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />}
            <Input type="number" min={0} step={0.01} value={priceValue} onFocus={(e) => e.currentTarget.select()} onChange={(e) => setPriceValue(e.target.value === "" ? 0 : Number(e.target.value))} className="pl-9" />
          </div>
          <Select value={priceScope} onValueChange={(v) => setPriceScope(v as PriceScope)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="selected">Seleccionados</SelectItem>
              <SelectItem value="visible">Visibles filtrados</SelectItem>
              <SelectItem value="category">Por categoria</SelectItem>
              <SelectItem value="all-ablerex">Todo Ablerex</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priceCategory || "none"} onValueChange={(v) => setPriceCategory(v === "none" ? "" : v)} disabled={priceScope !== "category"}>
            <SelectTrigger><SelectValue placeholder="Categoria objetivo" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Seleccione categoria</SelectItem>
              {Array.from(new Set(catalog.map((item) => item.category))).sort().map((cat) => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={applyMassivePriceAdjustment} className="bg-[#1a5276] text-white hover:bg-[#0e3a57]">Aplicar ajuste</Button>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-3 flex items-center gap-2">
          <Tags className="h-4 w-4 text-[#1a5276]" />
          <h3 className="text-sm font-semibold text-foreground">Descuento Global de Catalogo (cotizaciones)</h3>
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          <Select value={discountConfig.enabled ? "si" : "no"} onValueChange={(value) => setDiscountConfig((prev) => ({ ...prev, enabled: value === "si" }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="si">Si</SelectItem><SelectItem value="no">No</SelectItem></SelectContent>
          </Select>
          <Select value={discountConfig.mode} onValueChange={(value) => setDiscountConfig((prev) => ({ ...prev, mode: value as CatalogDiscountConfig["mode"] }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="percentage">Porcentaje (%)</SelectItem><SelectItem value="amount">Monto (USD)</SelectItem></SelectContent>
          </Select>
          <Input type="number" min={0} step={0.01} value={discountConfig.value} onFocus={(e) => e.currentTarget.select()} onChange={(e) => setDiscountConfig((prev) => ({ ...prev, value: e.target.value === "" ? 0 : Number(e.target.value) }))} />
          <Button onClick={handleSaveDiscountConfig} className="bg-[#1a5276] text-white hover:bg-[#0e3a57]">Guardar</Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((item) => (
          <div key={item.id} className="overflow-hidden rounded-lg border border-border bg-card">
            <div className="relative">
              <div className="absolute left-2 top-2 z-10 rounded-md bg-white/90 p-1">
                <Checkbox checked={selectedIds.includes(item.id)} onCheckedChange={(c) => toggleSelected(item.id, Boolean(c))} />
              </div>
              <button
                type="button"
                onClick={() =>
                  item.imageUrl && setPreviewImage({ src: item.imageUrl, code: item.code, description: item.description })
                }
                className="h-36 w-full bg-muted/30"
              >
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.imageUrl}
                    alt={item.code}
                    className="h-full w-full object-contain object-center p-2 transition-transform duration-200 hover:scale-[1.02]"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-muted-foreground">Sin imagen</div>
                )}
              </button>
            </div>

            <div className="space-y-2 p-3">
              <div className="flex items-start justify-between gap-2">
                <p className="font-mono text-xs font-semibold text-[#1a5276]">{item.code}</p>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(item)} className="h-7 w-7 p-0"><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => setDeleteConfirmId(item.id)} className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
              <p className="min-h-[48px] text-sm text-foreground">{item.description}</p>

              <div className="flex flex-wrap items-center gap-1 text-[11px]">
                <Badge variant="secondary" className="gap-1">{getCategoryIcon(item.category)}{item.category}</Badge>
                <span className="rounded bg-muted px-2 py-0.5 text-muted-foreground">{item.brand || "General"}</span>
                <span className="rounded bg-muted px-2 py-0.5 text-muted-foreground">{item.subcategory || "General"}</span>
              </div>

              <div className="rounded-md bg-muted/30 p-2">
                <p className="text-[11px] text-muted-foreground">Precio base</p>
                <p className="font-mono text-base font-semibold text-foreground">${formatCurrency(item.unitPrice)}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">Precio cotizacion: ${formatCurrency(getEffectivePrice(item))}</p>
              </div>

              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={priceDrafts[item.id] ?? item.unitPrice}
                  onFocus={(e) => e.currentTarget.select()}
                  onChange={(e) => setPriceDrafts((prev) => ({ ...prev, [item.id]: e.target.value }))}
                />
                <Button size="sm" variant="outline" onClick={() => handleSaveQuickPrice(item)}>Guardar</Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No se encontraron items con los filtros aplicados.
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card text-foreground sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading text-foreground">{editingItem ? "Editar Item" : "Nuevo Item de Catalogo"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Codigo / Modelo</Label>
                <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Marca</Label>
                <Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Categoria</Label>
                <Input list="catalog-categories-list" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as CatalogCategory })} />
                <datalist id="catalog-categories-list">
                  {Array.from(new Set([...CATALOG_CATEGORIES, ...catalog.map((item) => item.category)])).sort().map((cat) => <option key={cat} value={cat} />)}
                </datalist>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Subcategoria</Label>
                <Input value={form.subcategory} onChange={(e) => setForm({ ...form, subcategory: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Variante</Label>
                <Input value={form.variant} onChange={(e) => setForm({ ...form, variant: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Descripcion</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">URL de imagen</Label>
              <Input value={form.imageUrl || ""} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://... o /catalogo/ablerex/modelo.jpg" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Precio Unitario (USD)</Label>
                <Input type="number" min={0} step={0.01} value={form.unitPrice} onFocus={(e) => e.currentTarget.select()} onChange={(e) => setForm({ ...form, unitPrice: e.target.value === "" ? 0 : Number(e.target.value) })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Unidad de Medida</Label>
                <Select value={form.unit} onValueChange={(v) => setForm({ ...form, unit: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
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
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} className="bg-[#1a5276] text-white hover:bg-[#0e3a57]">{editingItem ? "Guardar Cambios" : "Agregar al Catalogo"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent className="bg-card text-foreground sm:max-w-sm">
          <DialogHeader><DialogTitle className="text-foreground">Confirmar eliminacion</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Este item sera eliminado del catalogo permanentemente.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}>Eliminar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-4xl bg-card text-foreground">
          <DialogHeader>
            <DialogTitle className="font-mono text-sm text-[#1a5276]">{previewImage?.code}</DialogTitle>
          </DialogHeader>
          {previewImage && (
            <div className="space-y-3">
              <div className="flex max-h-[70vh] min-h-[320px] items-center justify-center rounded-lg border border-border bg-muted/20 p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewImage.src}
                  alt={previewImage.code}
                  className="max-h-[65vh] w-auto max-w-full object-contain object-center"
                />
              </div>
              <p className="text-sm text-muted-foreground">{previewImage.description}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
