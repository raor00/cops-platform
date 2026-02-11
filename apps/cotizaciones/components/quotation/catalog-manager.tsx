"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
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
import {
  Battery,
  Cable,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Package,
  Pencil,
  Percent,
  Plus,
  Search,
  Settings2,
  Tags,
  Trash2,
  Zap,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

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

const PAGE_SIZE = 24

type BrandFilter = "todos" | "ablerex"
type PriceAction = "increase" | "decrease"
type PriceScope = "selected" | "visible" | "category" | "all-ablerex"

export function normalizeCategory(item: CatalogItem): string {
  const brand = (item.brand || "General").toLowerCase()
  if (brand !== "ablerex") return item.category

  const cat = item.category.toUpperCase()

  if (cat.includes("BOLSILLO")) return "Reguladores/Proteccion"
  if (cat.includes("REGULADOR") || cat.includes("PROTECCION") || cat.includes("SOBRETENSION")) return "Reguladores/Proteccion"
  if (cat.includes("MONITOREO") || cat.includes("ENERBATT")) return "Monitoreo Baterias"
  if (cat.includes("ATS") || cat.includes("ITS") || cat.includes("TRANSFERENCIA")) return "Transferencias"
  if (cat.includes("CARGADOR") || cat.includes("BUCK")) return "Cargadores Solares"
  if (cat.includes("INVERSOR") || cat.includes("FOTOVOLTAIC")) {
    if (cat.includes("HIBRID") || cat.includes("HOGAR")) return "Almacenamiento Energia"
    return "Inversores Solares"
  }
  if (cat.includes("ALMACEN") || cat.includes("ENERSALVYS") || cat.includes("ALMACENAMIENTO")) return "Almacenamiento Energia"
  if (cat.includes("BANCO") || cat.includes("BATERIA")) return "Baterias Externas"
  if (cat.includes("ENERSINE") || cat.includes("FILTRO")) return "Filtros Armonicos"
  if (cat.includes("BRICM")) return "UPS Modulares"
  if (cat.includes("INTERACTIV")) return "UPS Interactivos"
  if (cat.includes("UPS ONLINE") || cat.includes("DOBLE CONVERSION")) {
    if (cat.includes("1-3KVA") || cat.includes("1-3 KVA") || cat.match(/1.*3KVA/) || cat.match(/1.*3\s*KVA/)) return "UPS Online 1-3kVA"
    if (cat.includes("6 - 10") || cat.includes("6-10") || cat.includes("6 -10")) return "UPS Online 6-10kVA"
    if (cat.includes("TRIFAS") || cat.includes("3F")) return "UPS Trifasicos"
    return "UPS Online"
  }
  if (cat.includes("TRIFAS") || cat.includes("3F")) return "UPS Trifasicos"
  if (cat.includes("ACCESORIO")) return "Accesorios"
  if (cat.includes("MODULAR")) return "UPS Modulares"

  return "Otros Ablerex"
}

const ABLEREX_CATEGORY_ORDER = [
  "UPS Online 1-3kVA",
  "UPS Online 6-10kVA",
  "UPS Online",
  "UPS Trifasicos",
  "UPS Modulares",
  "UPS Interactivos",
  "Inversores Solares",
  "Almacenamiento Energia",
  "Cargadores Solares",
  "Baterias Externas",
  "Filtros Armonicos",
  "Reguladores/Proteccion",
  "Monitoreo Baterias",
  "Transferencias",
  "Accesorios",
  "Otros Ablerex",
]

const GENERAL_CATEGORY_ORDER = [
  "CCTV",
  "Control de Acceso",
  "Alarmas",
  "Redes",
  "VMS",
  "Energia",
  "Materiales",
  "Automatizacion",
]

function getCategoryIcon(cat: string) {
  if (cat.includes("Bateria") || cat.includes("Almacen")) return <Battery className="h-3 w-3 shrink-0" />
  if (cat === "Materiales" || cat.includes("Cable")) return <Cable className="h-3 w-3 shrink-0" />
  if (cat.includes("UPS") || cat.includes("Energi") || cat === "Energia") return <Zap className="h-3 w-3 shrink-0" />
  return <Package className="h-3 w-3 shrink-0" />
}

export function CatalogManager() {
  const [catalog, setCatalog] = useState<CatalogItem[]>([])
  const [search, setSearch] = useState("")
  const [brandFilter, setBrandFilter] = useState<BrandFilter>("todos")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [filterSubcategory, setFilterSubcategory] = useState("all")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [animKey, setAnimKey] = useState(0)

  const [previewImage, setPreviewImage] = useState<{ src: string; code: string; description: string } | null>(null)

  const [priceAction, setPriceAction] = useState<PriceAction>("increase")
  const [priceMode, setPriceMode] = useState<CatalogDiscountConfig["mode"]>("percentage")
  const [priceScope, setPriceScope] = useState<PriceScope>("selected")
  const [priceValue, setPriceValue] = useState(0)
  const [priceCategory, setPriceCategory] = useState("")
  const [priceOpen, setPriceOpen] = useState(false)
  const [discountOpen, setDiscountOpen] = useState(false)

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

  const brandFiltered = useMemo(() => {
    if (brandFilter === "ablerex") {
      return catalog.filter((item) => (item.brand || "General").toLowerCase() === "ablerex")
    }
    return catalog
  }, [catalog, brandFilter])

  const availableCategories = useMemo(() => {
    const cats = new Map<string, number>()
    brandFiltered.forEach((item) => {
      const nc = normalizeCategory(item)
      cats.set(nc, (cats.get(nc) || 0) + 1)
    })
    const order = brandFilter === "ablerex" ? ABLEREX_CATEGORY_ORDER : [...GENERAL_CATEGORY_ORDER, ...ABLEREX_CATEGORY_ORDER]
    const sorted = Array.from(cats.entries()).sort((a, b) => {
      const ia = order.indexOf(a[0])
      const ib = order.indexOf(b[0])
      return (ia >= 0 ? ia : 999) - (ib >= 0 ? ib : 999)
    })
    return sorted
  }, [brandFiltered, brandFilter])

  const filtered = useMemo(() => {
    return brandFiltered.filter((item) => {
      const matchSearch =
        !search ||
        item.code.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase())
      const matchCategory = selectedCategory === "all" || normalizeCategory(item) === selectedCategory
      const matchSub = filterSubcategory === "all" || (item.subcategory || "General") === filterSubcategory
      return matchSearch && matchCategory && matchSub
    })
  }, [brandFiltered, search, selectedCategory, filterSubcategory])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paginated = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [filtered, safePage])

  const visibleIds = useMemo(() => filtered.map((item) => item.id), [filtered])
  const paginatedIds = useMemo(() => paginated.map((item) => item.id), [paginated])
  const allPageSelected = paginatedIds.length > 0 && paginatedIds.every((id) => selectedIds.includes(id))

  const subcategories = useMemo(() => {
    const items = selectedCategory === "all"
      ? brandFiltered
      : brandFiltered.filter((item) => normalizeCategory(item) === selectedCategory)
    return Array.from(new Set(items.map((item) => item.subcategory || "General"))).sort()
  }, [brandFiltered, selectedCategory])

  const counts = useMemo(() => {
    const all = catalog.length
    const ablerex = catalog.filter((item) => (item.brand || "General").toLowerCase() === "ablerex").length
    return { all, ablerex }
  }, [catalog])

  const getEffectivePrice = useCallback((item: CatalogItem): number => {
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
  }, [discountConfig])

  const resetFilters = useCallback(() => {
    setSelectedCategory("all")
    setFilterSubcategory("all")
    setPage(1)
    setAnimKey((k) => k + 1)
  }, [])

  const toggleSelected = (id: string, checked: boolean) => {
    setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)))
  }

  const toggleSelectAllPage = (checked: boolean) => {
    if (!checked) {
      setSelectedIds((prev) => prev.filter((id) => !paginatedIds.includes(id)))
      return
    }
    setSelectedIds((prev) => Array.from(new Set([...prev, ...paginatedIds])))
  }

  const clearSelection = () => setSelectedIds([])

  const openCreate = () => {
    setEditingItem(null)
    setForm({ ...EMPTY_ITEM, brand: brandFilter === "ablerex" ? "Ablerex" : "General" })
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

  const applyMassivePriceAdjustment = () => {
    if (priceValue <= 0) { toast.error("Indique un valor mayor a 0"); return }
    let targetIds: string[] = []
    if (priceScope === "selected") targetIds = selectedIds
    if (priceScope === "visible") targetIds = visibleIds
    if (priceScope === "category") {
      if (!priceCategory) { toast.error("Seleccione una categoria"); return }
      targetIds = catalog.filter((item) => item.category === priceCategory).map((item) => item.id)
    }
    if (priceScope === "all-ablerex") {
      targetIds = catalog.filter((item) => (item.brand || "General").toLowerCase() === "ablerex").map((item) => item.id)
    }
    if (targetIds.length === 0) { toast.error("No hay productos para ajustar"); return }

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

  const goToPage = (p: number) => {
    setPage(p)
    setAnimKey((k) => k + 1)
  }

  const startIdx = (safePage - 1) * PAGE_SIZE + 1
  const endIdx = Math.min(safePage * PAGE_SIZE, filtered.length)

  return (
    <div className="min-w-0 space-y-4 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="truncate font-heading text-xl font-bold text-foreground sm:text-2xl">Catalogo de Productos</h2>
          <p className="text-xs text-muted-foreground">{counts.all} productos  - {counts.ablerex} Ablerex</p>
        </div>
        <div className="flex shrink-0 flex-wrap justify-end gap-2">
          <Button variant="outline" size="sm" onClick={handleSyncAblerexCatalog} className="text-xs">
            Sync Ablerex
          </Button>
          <Button size="sm" onClick={openCreate} className="bg-[#4a72ef] text-xs text-white hover:bg-[#2f54e0]">
            <Plus className="mr-1 h-3.5 w-3.5" />
            Nuevo
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          placeholder="Buscar por codigo o descripcion..."
          className="h-10 pl-10 text-sm"
        />
      </div>

      {/* Brand pills */}
      <div className="flex gap-2">
        {(["todos", "ablerex"] as const).map((b) => (
          <button
            key={b}
            onClick={() => { setBrandFilter(b); resetFilters() }}
            className={cn(
              "rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-200",
              brandFilter === b
                ? "bg-[#4a72ef] text-white shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {b === "todos" ? `Todos (${counts.all})` : `Ablerex (${counts.ablerex})`}
          </button>
        ))}
      </div>

      {/* Category chips â€” wrapping grid instead of horizontal scroll */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => { setSelectedCategory("all"); setFilterSubcategory("all"); setPage(1); setAnimKey((k) => k + 1) }}
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-medium transition-all duration-200",
            selectedCategory === "all"
              ? "bg-[#4a72ef] text-white shadow-sm"
              : "bg-muted/60 text-muted-foreground hover:bg-muted"
          )}
        >
          Todas
        </button>
        {availableCategories.map(([cat, count]) => (
          <button
            key={cat}
            onClick={() => { setSelectedCategory(cat); setFilterSubcategory("all"); setPage(1); setAnimKey((k) => k + 1) }}
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all duration-200",
              selectedCategory === cat
                ? "bg-[#4a72ef] text-white shadow-sm"
                : "bg-muted/60 text-muted-foreground hover:bg-muted"
            )}
          >
            {getCategoryIcon(cat)}
            <span className="truncate">{cat}</span>
            <span className="opacity-60">({count})</span>
          </button>
        ))}
      </div>

      {/* Subcategory filter */}
      {subcategories.length > 1 && (
        <Select value={filterSubcategory} onValueChange={(v) => { setFilterSubcategory(v); setPage(1); setAnimKey((k) => k + 1) }}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Subcategoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las subcategorias</SelectItem>
            {subcategories.map((sub) => (
              <SelectItem key={sub} value={sub}>{sub}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Selection bar */}
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted/20 px-3 py-2">
        <div className="flex items-center gap-2">
          <Checkbox checked={allPageSelected} onCheckedChange={(c) => toggleSelectAllPage(Boolean(c))} />
          <span className="text-xs text-muted-foreground">Pagina</span>
        </div>
        {selectedIds.length > 0 && (
          <>
            <Badge variant="secondary" className="text-[11px]">{selectedIds.length} sel.</Badge>
            <Button variant="ghost" size="sm" onClick={clearSelection} className="h-6 px-2 text-[11px] text-muted-foreground">
              Limpiar
            </Button>
          </>
        )}
        <span className="ml-auto text-[11px] text-muted-foreground">
          {filtered.length > 0 ? `${startIdx}-${endIdx} de ${filtered.length}` : "0 resultados"}
        </span>
      </div>

      {/* Collapsible: Price Adjustment */}
      <Collapsible open={priceOpen} onOpenChange={setPriceOpen}>
        <CollapsibleTrigger asChild>
          <button className="flex w-full items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-left transition-colors hover:bg-muted/30">
            <Settings2 className="h-4 w-4 shrink-0 text-[#4a72ef]" />
            <span className="text-xs font-semibold text-foreground sm:text-sm">Ajuste de Precios</span>
            <ChevronDown className={cn("ml-auto h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200", priceOpen && "rotate-180")} />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-2 rounded-lg border border-border bg-card p-3">
            <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 xl:grid-cols-6">
              <Select value={priceAction} onValueChange={(v) => setPriceAction(v as PriceAction)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="increase">Aumentar</SelectItem>
                  <SelectItem value="decrease">Reducir</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priceMode} onValueChange={(v) => setPriceMode(v as CatalogDiscountConfig["mode"])}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">% Porcentaje</SelectItem>
                  <SelectItem value="amount">USD Monto</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative">
                {priceMode === "percentage"
                  ? <Percent className="absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
                  : <DollarSign className="absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
                }
                <Input type="number" min={0} step={0.01} value={priceValue} onFocus={(e) => e.currentTarget.select()} onChange={(e) => setPriceValue(e.target.value === "" ? 0 : Number(e.target.value))} className="h-8 pl-7 text-xs" />
              </div>
              <Select value={priceScope} onValueChange={(v) => setPriceScope(v as PriceScope)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="selected">Seleccionados</SelectItem>
                  <SelectItem value="visible">Visibles</SelectItem>
                  <SelectItem value="category">Categoria</SelectItem>
                  <SelectItem value="all-ablerex">Todo Ablerex</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priceCategory || "none"} onValueChange={(v) => setPriceCategory(v === "none" ? "" : v)} disabled={priceScope !== "category"}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Categoria" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Seleccione</SelectItem>
                  {Array.from(new Set(catalog.map((item) => item.category))).sort().map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={applyMassivePriceAdjustment} size="sm" className="h-8 bg-[#4a72ef] text-xs text-white hover:bg-[#2f54e0]">
                Aplicar
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Collapsible: Discount Config */}
      <Collapsible open={discountOpen} onOpenChange={setDiscountOpen}>
        <CollapsibleTrigger asChild>
          <button className="flex w-full items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-left transition-colors hover:bg-muted/30">
            <Tags className="h-4 w-4 shrink-0 text-[#4a72ef]" />
            <span className="min-w-0 truncate text-xs font-semibold text-foreground sm:text-sm">Descuento Global</span>
            {discountConfig.enabled && <Badge variant="secondary" className="shrink-0 text-[10px]">Activo</Badge>}
            <ChevronDown className={cn("ml-auto h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200", discountOpen && "rotate-180")} />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-2 rounded-lg border border-border bg-card p-3">
            <div className="grid gap-2 grid-cols-2 sm:grid-cols-4">
              <Select value={discountConfig.enabled ? "si" : "no"} onValueChange={(v) => setDiscountConfig((prev) => ({ ...prev, enabled: v === "si" }))}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="si">Si</SelectItem><SelectItem value="no">No</SelectItem></SelectContent>
              </Select>
              <Select value={discountConfig.mode} onValueChange={(v) => setDiscountConfig((prev) => ({ ...prev, mode: v as CatalogDiscountConfig["mode"] }))}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="percentage">% Porcentaje</SelectItem><SelectItem value="amount">USD Monto</SelectItem></SelectContent>
              </Select>
              <Input type="number" min={0} step={0.01} value={discountConfig.value} onFocus={(e) => e.currentTarget.select()} onChange={(e) => setDiscountConfig((prev) => ({ ...prev, value: e.target.value === "" ? 0 : Number(e.target.value) }))} className="h-8 text-xs" />
              <Button onClick={handleSaveDiscountConfig} size="sm" className="h-8 bg-[#4a72ef] text-xs text-white hover:bg-[#2f54e0]">Guardar</Button>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Product grid */}
      <div key={animKey} className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {paginated.map((item, idx) => (
          <div
            key={item.id}
            className="group min-w-0 overflow-hidden rounded-xl border border-border bg-card transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
            style={{ animation: `fadeIn 0.3s ease ${idx * 25}ms forwards`, opacity: 0 }}
          >
            <div className="relative">
              <div className="absolute left-2 top-2 z-10">
                <Checkbox
                  checked={selectedIds.includes(item.id)}
                  onCheckedChange={(c) => toggleSelected(item.id, Boolean(c))}
                  className="rounded bg-white/90 shadow-sm"
                />
              </div>
              <button
                type="button"
                onClick={() => item.imageUrl && setPreviewImage({ src: item.imageUrl, code: item.code, description: item.description })}
                className="flex h-28 w-full items-center justify-center bg-gradient-to-b from-muted/20 to-muted/40 sm:h-32"
              >
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.imageUrl}
                    alt={item.code}
                    loading="lazy"
                    className="h-full w-full object-contain object-center p-3 transition-transform duration-200 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-muted-foreground/40">
                    <Package className="h-7 w-7" />
                    <span className="text-[10px]">Sin imagen</span>
                  </div>
                )}
              </button>
            </div>

            <div className="space-y-1 p-2.5">
              <div className="flex items-start justify-between gap-1">
                <p className="min-w-0 truncate font-mono text-[11px] font-semibold text-[#4a72ef] leading-tight">{item.code}</p>
                <div className="flex shrink-0 items-center">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(item)} className="h-6 w-6 p-0 opacity-0 transition-opacity group-hover:opacity-100">
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setDeleteConfirmId(item.id)} className="h-6 w-6 p-0 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <p className="line-clamp-2 text-[11px] leading-snug text-foreground/80">{item.description}</p>

              <div className="flex flex-wrap items-center gap-1">
                <Badge variant="secondary" className="max-w-full gap-0.5 truncate px-1.5 py-0 text-[10px]">
                  {getCategoryIcon(normalizeCategory(item))}
                  <span className="truncate">{normalizeCategory(item)}</span>
                </Badge>
                {(item.brand || "General").toLowerCase() === "ablerex" && (
                  <span className="shrink-0 rounded bg-blue-50 px-1.5 py-0 text-[10px] font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">Ablerex</span>
                )}
              </div>

              <div className="flex items-end justify-between pt-0.5">
                <div className="min-w-0">
                  <p className="font-mono text-sm font-bold text-foreground">${formatCurrency(item.unitPrice)}</p>
                  {discountConfig.enabled && getEffectivePrice(item) !== item.unitPrice && (
                    <p className="text-[10px] text-green-600">${formatCurrency(getEffectivePrice(item))} cotiz.</p>
                  )}
                </div>
                <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">{item.unit}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-xl border border-dashed border-border p-8 text-center sm:p-12">
          <Package className="mx-auto h-8 w-8 text-muted-foreground/30" />
          <p className="mt-2 text-sm text-muted-foreground">No se encontraron productos.</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-1 pt-2">
          <Button variant="outline" size="sm" onClick={() => goToPage(safePage - 1)} disabled={safePage <= 1} className="h-8 w-8 p-0">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
            .reduce<(number | "dots")[]>((acc, p, i, arr) => {
              if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("dots")
              acc.push(p)
              return acc
            }, [])
            .map((p, i) =>
              p === "dots" ? (
                <span key={`dots-${i}`} className="px-1 text-xs text-muted-foreground">...</span>
              ) : (
                <Button key={p} variant={p === safePage ? "default" : "outline"} size="sm" onClick={() => goToPage(p)} className={cn("h-8 w-8 p-0 text-xs", p === safePage && "bg-[#4a72ef] text-white")}>
                  {p}
                </Button>
              )
            )}
          <Button variant="outline" size="sm" onClick={() => goToPage(safePage + 1)} disabled={safePage >= totalPages} className="h-8 w-8 p-0">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto bg-card text-foreground sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground">{editingItem ? "Editar Item" : "Nuevo Item de Catalogo"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Codigo / Modelo</Label>
                <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="h-8 text-xs" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Marca</Label>
                <Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="h-8 text-xs" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Categoria</Label>
                <Input list="catalog-categories-list" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as CatalogCategory })} className="h-8 text-xs" />
                <datalist id="catalog-categories-list">
                  {Array.from(new Set([...CATALOG_CATEGORIES, ...catalog.map((item) => item.category)])).sort().map((cat) => <option key={cat} value={cat} />)}
                </datalist>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Subcategoria</Label>
                <Input value={form.subcategory} onChange={(e) => setForm({ ...form, subcategory: e.target.value })} className="h-8 text-xs" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Variante</Label>
                <Input value={form.variant} onChange={(e) => setForm({ ...form, variant: e.target.value })} className="h-8 text-xs" />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Descripcion</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="h-8 text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">URL de imagen</Label>
              <Input value={form.imageUrl || ""} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." className="h-8 text-xs" />
            </div>
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Precio (USD)</Label>
                <Input type="number" min={0} step={0.01} value={form.unitPrice} onFocus={(e) => e.currentTarget.select()} onChange={(e) => setForm({ ...form, unitPrice: e.target.value === "" ? 0 : Number(e.target.value) })} className="h-8 text-xs" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Unidad</Label>
                <Select value={form.unit} onValueChange={(v) => setForm({ ...form, unit: v })}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UND">UND</SelectItem>
                    <SelectItem value="BOB">BOB</SelectItem>
                    <SelectItem value="BLS">BLS</SelectItem>
                    <SelectItem value="MTS">MTS</SelectItem>
                    <SelectItem value="RLL">RLL</SelectItem>
                    <SelectItem value="KIT">KIT</SelectItem>
                    <SelectItem value="GLB">GLB</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button size="sm" onClick={handleSave} className="bg-[#4a72ef] text-white hover:bg-[#2f54e0]">{editingItem ? "Guardar" : "Agregar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent className="bg-card text-foreground sm:max-w-sm">
          <DialogHeader><DialogTitle className="text-foreground">Confirmar eliminacion</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Este item sera eliminado permanentemente.</p>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDeleteConfirmId(null)}>Cancelar</Button>
            <Button variant="destructive" size="sm" onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}>Eliminar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Preview */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-h-[90vh] w-[calc(100vw-2rem)] max-w-4xl overflow-y-auto bg-card text-foreground">
          <DialogHeader>
            <DialogTitle className="font-mono text-sm text-[#4a72ef]">{previewImage?.code}</DialogTitle>
          </DialogHeader>
          {previewImage && (
            <div className="space-y-3">
              <div className="flex max-h-[60vh] min-h-[200px] items-center justify-center rounded-lg border border-border bg-muted/20 p-3 sm:min-h-[320px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewImage.src} alt={previewImage.code} className="max-h-[55vh] w-auto max-w-full object-contain object-center" />
              </div>
              <p className="text-sm text-muted-foreground">{previewImage.description}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}




