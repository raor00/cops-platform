"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { ABLEREX_CATALOG } from "@/lib/ablerex-catalog"
import {
  addCatalogItem,
  deleteCatalogItem,
  getCatalog,
  getCatalogDiscountConfig,
  getRegisteredBrands,
  addRegisteredBrand,
  removeRegisteredBrand,
  saveCatalog,
  saveCatalogDiscountConfig,
  updateCatalogItem,
} from "@/lib/quotation-storage"
import type { CatalogCategory, CatalogDiscountConfig, CatalogItem } from "@/lib/quotation-types"
import { formatCurrency } from "@/lib/quotation-types"
import type { CatalogSortOption, CatalogViewMode } from "./catalog-toolbar"
import { normalizeCatalogCategory, getProductSubcategory } from "./catalog-utils"
import { toast } from "sonner"

const PAGE_SIZE = 24

const EMPTY_ITEM: Omit<CatalogItem, "id"> = {
  code: "",
  description: "",
  unitPrice: 0,
  costo: 0,
  imageUrl: "",
  brand: "General",
  category: "CCTV",
  subcategory: "General",
  variant: "",
  unit: "UND",
  stock: 0,
  stockMinimo: 0,
  ubicacion: "",
  activo: true,
}

const CATEGORY_ORDER = [
  "CCTV",
  "Control de Acceso",
  "Alarmas",
  "Redes",
  "VMS",
  "Energia",
  "Materiales",
  "Automatizacion",
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

type PriceAction = "increase" | "decrease"
type PriceScope = "selected" | "visible" | "category" | "all-ablerex"
type StockFilter = "all" | "in-stock" | "low-stock"
type ProductFormState = Omit<CatalogItem, "id">

function getOrderedCategories(items: CatalogItem[]) {
  const counts = new Map<string, number>()

  items.forEach((item) => {
    const category = normalizeCatalogCategory(item)
    counts.set(category, (counts.get(category) || 0) + 1)
  })

  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => {
      const indexA = CATEGORY_ORDER.indexOf(a.name)
      const indexB = CATEGORY_ORDER.indexOf(b.name)
      return (indexA >= 0 ? indexA : Number.MAX_SAFE_INTEGER) - (indexB >= 0 ? indexB : Number.MAX_SAFE_INTEGER) || a.name.localeCompare(b.name)
    })
}

function getSubcategories(catalog: CatalogItem[], category?: string) {
  const items = category ? catalog.filter((item) => normalizeCatalogCategory(item) === category) : catalog
  const values = Array.from(new Set(items.map((item) => getProductSubcategory(item)))).filter(Boolean)
  return values.length > 0 ? values.sort() : ["General"]
}

function generateNextProductCode(catalog: CatalogItem[]) {
  const regex = /^PROD-(\d+)$/i
  const numbers = catalog
    .map((item) => {
      const match = item.code.match(regex)
      return match ? Number.parseInt(match[1], 10) : 0
    })
    .filter((value) => value > 0)

  return `PROD-${String(numbers.length > 0 ? Math.max(...numbers) + 1 : 1).padStart(3, "0")}`
}

function mapListSortState(sort: CatalogSortOption) {
  switch (sort) {
    case "price-asc":
      return { sortBy: "price" as const, direction: "asc" as const }
    case "price-desc":
      return { sortBy: "price" as const, direction: "desc" as const }
    case "description-asc":
      return { sortBy: "description" as const, direction: "asc" as const }
    case "code-asc":
    default:
      return { sortBy: "code" as const, direction: "asc" as const }
  }
}

function mapListSortToToolbarSort(column: "code" | "description" | "category" | "brand" | "price", direction: "asc" | "desc"): CatalogSortOption | null {
  if (column === "price") return direction === "desc" ? "price-desc" : "price-asc"
  if (column === "code") return "code-asc"
  if (column === "description") return "description-asc"
  return null
}

export function useCatalogManager() {
  const [loading, setLoading] = useState(true)
  const [catalog, setCatalog] = useState<CatalogItem[]>([])
  const [search, setSearch] = useState("")
  const [view, setView] = useState<CatalogViewMode>("grid")
  const [sort, setSort] = useState<CatalogSortOption>("code-asc")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null)
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 999999])
  const [stockFilter, setStockFilter] = useState<StockFilter>("all")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [activeItemId, setActiveItemId] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [quickViewItem, setQuickViewItem] = useState<CatalogItem | null>(null)
  const [previewImage, setPreviewImage] = useState<{ src: string; code: string; description: string } | null>(null)

  const [registeredBrands, setRegisteredBrands] = useState<string[]>(() => getRegisteredBrands())
  const [dialogOpen, setDialogOpen] = useState(false)
  const [brandDialogOpen, setBrandDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null)
  const [form, setForm] = useState<ProductFormState>(EMPTY_ITEM)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const [priceDialogOpen, setPriceDialogOpen] = useState(false)
  const [priceAction, setPriceAction] = useState<PriceAction>("increase")
  const [priceMode, setPriceMode] = useState<CatalogDiscountConfig["mode"]>("percentage")
  const [priceScope, setPriceScope] = useState<PriceScope>("selected")
  const [priceValue, setPriceValue] = useState(0)
  const [priceCategory, setPriceCategory] = useState("")

  const [discountDialogOpen, setDiscountDialogOpen] = useState(false)
  const [discountConfig, setDiscountConfig] = useState<CatalogDiscountConfig>({
    enabled: false,
    mode: "percentage",
    value: 0,
    scope: "all",
    category: "",
    subcategory: "",
  })

  const [bulkCategoryOpen, setBulkCategoryOpen] = useState(false)
  const [bulkCategory, setBulkCategory] = useState("")
  const [bulkSubcategory, setBulkSubcategory] = useState("General")

  const refreshCatalog = useCallback(() => {
    const nextCatalog = getCatalog()
    const nextDiscount = getCatalogDiscountConfig()
    const prices = nextCatalog.map((item) => item.unitPrice)
    const min = prices.length > 0 ? Math.min(...prices) : 0
    const max = prices.length > 0 ? Math.max(...prices) : 0

    setCatalog(nextCatalog)
    setDiscountConfig(nextDiscount)
    setPriceRange((current) => {
      const isInitialRange = current[0] === 0 && (current[1] === 999999 || current[1] === 0)
      if (isInitialRange) return [min, max]
      return [Math.max(min, current[0]), Math.min(max, current[1])]
    })
    setLoading(false)
  }, [])

  useEffect(() => {
    refreshCatalog()
    const handleCatalogUpdated = () => refreshCatalog()
    window.addEventListener("catalog-updated", handleCatalogUpdated)
    return () => window.removeEventListener("catalog-updated", handleCatalogUpdated)
  }, [refreshCatalog])

  const brands = useMemo(() => {
    const map = new Map<string, number>()
    catalog.forEach((item) => {
      const brand = item.brand || "General"
      map.set(brand, (map.get(brand) || 0) + 1)
    })

    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
  }, [catalog])

  const priceBounds = useMemo(() => {
    const prices = catalog.map((item) => item.unitPrice)
    return prices.length > 0 ? { min: Math.min(...prices), max: Math.max(...prices) } : { min: 0, max: 0 }
  }, [catalog])

  const categories = useMemo(() => {
    const source = catalog.filter((item) => selectedBrands.length === 0 || selectedBrands.includes(item.brand || "General"))
    return getOrderedCategories(source)
  }, [catalog, selectedBrands])

  const counts = useMemo(() => ({
    all: catalog.length,
    ablerex: catalog.filter((item) => (item.brand || "General").toLowerCase() === "ablerex").length,
  }), [catalog])

  const categoryOptions = useMemo(() => getOrderedCategories(catalog).map((item) => item.name), [catalog])
  const subcategoryOptions = useMemo(() => getSubcategories(catalog, form.category), [catalog, form.category])
  const bulkSubcategoryOptions = useMemo(() => getSubcategories(catalog, bulkCategory || undefined), [bulkCategory, catalog])
  const discountSubcategoryOptions = useMemo(() => getSubcategories(catalog, discountConfig.category || undefined), [catalog, discountConfig.category])

  const getEffectivePrice = useCallback((item: CatalogItem) => {
    if (!discountConfig.enabled || discountConfig.value <= 0) return item.unitPrice

    const matchesScope =
      discountConfig.scope === "all" ||
      (discountConfig.scope === "category" && normalizeCatalogCategory(item) === discountConfig.category) ||
      (discountConfig.scope === "subcategory" && (item.subcategory || "General") === discountConfig.subcategory)

    if (!matchesScope) return item.unitPrice

    const next = discountConfig.mode === "percentage"
      ? item.unitPrice * (1 - discountConfig.value / 100)
      : item.unitPrice - discountConfig.value

    return Math.max(0, Number(next.toFixed(2)))
  }, [discountConfig])

  const filtered = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return catalog.filter((item) => {
      const brand = item.brand || "General"
      const category = normalizeCatalogCategory(item)
      const subcategory = getProductSubcategory(item)
      const matchesSearch = !normalizedSearch || [item.code, item.description, brand].some((value) => value.toLowerCase().includes(normalizedSearch))
      const matchesCategory = selectedCategory === null || category === selectedCategory
      const matchesSubcategory = selectedSubcategory === null || subcategory === selectedSubcategory
      const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(brand)
      const matchesPrice = item.unitPrice >= priceRange[0] && item.unitPrice <= priceRange[1]
      const hasStockData = typeof item.stock === "number"
      const stock = item.stock ?? 0
      const stockMinimo = item.stockMinimo ?? 0
      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "in-stock" && hasStockData && stock > 0) ||
        (stockFilter === "low-stock" && hasStockData && stock <= stockMinimo)

      return matchesSearch && matchesCategory && matchesSubcategory && matchesBrand && matchesPrice && matchesStock
    })
  }, [catalog, priceRange, search, selectedBrands, selectedCategory, selectedSubcategory, stockFilter])

  const sidebarSubcategoryOptions = useMemo(() => {
    if (!selectedCategory) return []
    const items = catalog.filter((item) => normalizeCatalogCategory(item) === selectedCategory)
    const values = Array.from(new Set(items.map((item) => getProductSubcategory(item)))).filter((sub) => sub !== "General")
    return values.sort()
  }, [catalog, selectedCategory])

  const sorted = useMemo(() => {
    const items = [...filtered]
    switch (sort) {
      case "price-asc":
        return items.sort((a, b) => a.unitPrice - b.unitPrice)
      case "price-desc":
        return items.sort((a, b) => b.unitPrice - a.unitPrice)
      case "description-asc":
        return items.sort((a, b) => a.description.localeCompare(b.description))
      case "code-asc":
      default:
        return items.sort((a, b) => a.code.localeCompare(b.code))
    }
  }, [filtered, sort])

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paginated = useMemo(() => sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE), [safePage, sorted])
  const visibleIds = useMemo(() => filtered.map((item) => item.id), [filtered])
  const paginatedIds = useMemo(() => paginated.map((item) => item.id), [paginated])
  const allPageSelected = paginatedIds.length > 0 && paginatedIds.every((id) => selectedIds.includes(id))
  const listSortState = useMemo(() => mapListSortState(sort), [sort])
  const hasActiveFilters = Boolean(
    search.trim() ||
      selectedCategory ||
      selectedSubcategory ||
      selectedBrands.length ||
      stockFilter !== "all" ||
      priceRange[0] !== priceBounds.min ||
      priceRange[1] !== priceBounds.max,
  )

  const activeFilters = useMemo(() => {
    const filters: Array<{ key: string; label: string; onRemove: () => void }> = []

    if (search.trim()) filters.push({ key: "search", label: `Búsqueda: ${search.trim()}`, onRemove: () => setSearch("") })
    if (selectedCategory) filters.push({ key: "category", label: `Categoría: ${selectedCategory}`, onRemove: () => { setSelectedCategory(null); setSelectedSubcategory(null) } })
    if (selectedSubcategory) filters.push({ key: "subcategory", label: `Subcategoría: ${selectedSubcategory}`, onRemove: () => setSelectedSubcategory(null) })
    selectedBrands.forEach((brand) => filters.push({ key: `brand-${brand}`, label: `Marca: ${brand}`, onRemove: () => setSelectedBrands((current) => current.filter((value) => value !== brand)) }))
    if (stockFilter === "in-stock") filters.push({ key: "stock", label: "Stock: solo con stock", onRemove: () => setStockFilter("all") })
    if (stockFilter === "low-stock") filters.push({ key: "stock", label: "Stock: stock bajo", onRemove: () => setStockFilter("all") })

    if (priceRange[0] !== priceBounds.min || priceRange[1] !== priceBounds.max) {
      filters.push({
        key: "price",
        label: `Precio: $${formatCurrency(priceRange[0])} - $${formatCurrency(priceRange[1])}`,
        onRemove: () => setPriceRange([priceBounds.min, priceBounds.max]),
      })
    }

    return filters
  }, [priceBounds.max, priceBounds.min, priceRange, search, selectedBrands, selectedCategory, selectedSubcategory, stockFilter])

  useEffect(() => {
    setPage(1)
  }, [priceRange, search, selectedBrands, selectedCategory, selectedSubcategory, sort, stockFilter, view])

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  useEffect(() => {
    setSelectedIds((current) => current.filter((id) => catalog.some((item) => item.id === id)))
    setActiveItemId((current) => (current && catalog.some((item) => item.id === current) ? current : null))
    setQuickViewItem((current) => (current ? catalog.find((item) => item.id === current.id) ?? current : null))
  }, [catalog])

  const resetFilters = useCallback(() => {
    setSearch("")
    setSelectedCategory(null)
    setSelectedSubcategory(null)
    setSelectedBrands([])
    setStockFilter("all")
    setPriceRange([priceBounds.min, priceBounds.max])
  }, [priceBounds.max, priceBounds.min])

  const toggleSelected = useCallback((id: string, selected: boolean) => {
    setSelectedIds((current) => (selected ? Array.from(new Set([...current, id])) : current.filter((value) => value !== id)))
    setActiveItemId(id)
  }, [])

  const clearSelection = useCallback(() => setSelectedIds([]), [])
  const selectAllResults = useCallback(() => setSelectedIds(Array.from(new Set(filtered.map((item) => item.id)))), [filtered])
  const toggleSelectAllPage = useCallback((checked: boolean) => {
    setSelectedIds((current) => checked ? Array.from(new Set([...current, ...paginatedIds])) : current.filter((id) => !paginatedIds.includes(id)))
  }, [paginatedIds])

  const openImagePreview = useCallback((item: { src: string; code: string; description: string } | CatalogItem | null) => {
    if (!item) {
      setPreviewImage(null)
      return
    }

    if ("src" in item) {
      setPreviewImage(item.src ? item : null)
      return
    }

    setPreviewImage(item.imageUrl ? { src: item.imageUrl, code: item.code, description: item.description } : null)
  }, [])

  const openCreate = useCallback(() => {
    setEditingItem(null)
    setForm({
      ...EMPTY_ITEM,
      code: generateNextProductCode(catalog),
      brand: selectedBrands.length === 1 ? selectedBrands[0] : "General",
      category: selectedCategory || EMPTY_ITEM.category,
      subcategory: "General",
    })
    setDialogOpen(true)
  }, [catalog, selectedBrands, selectedCategory])

  const openEdit = useCallback((item: CatalogItem) => {
    setEditingItem(item)
    setForm({
      code: item.code,
      description: item.description,
      unitPrice: item.unitPrice,
      imageUrl: item.imageUrl || "",
      brand: item.brand || "General",
      category: normalizeCatalogCategory(item) as CatalogCategory,
      subcategory: item.subcategory || "General",
      variant: item.variant || "",
      unit: item.unit,
      stock: item.stock ?? 0,
      stockMinimo: item.stockMinimo ?? 0,
      ubicacion: item.ubicacion || "",
      costo: item.costo ?? 0,
      activo: item.activo ?? true,
    })
    setDialogOpen(true)
  }, [])

  const duplicateItem = useCallback((item: CatalogItem) => {
    addCatalogItem({ ...item, id: crypto.randomUUID(), code: generateNextProductCode(catalog) })
    refreshCatalog()
    toast.success("Producto duplicado")
  }, [catalog, refreshCatalog])

  const saveItem = useCallback(() => {
    if (!form.code.trim() || !form.description.trim()) {
      toast.error("Código y descripción son requeridos")
      return
    }

    const payload = {
      ...form,
      category: form.category.trim() || "CCTV",
      brand: form.brand?.trim() || "General",
      subcategory: form.subcategory?.trim() || "General",
      variant: form.variant?.trim() || "",
      imageUrl: form.imageUrl?.trim() || "",
      unitPrice: Number(form.unitPrice) || 0,
      costo: Number(form.costo) || 0,
      stock: Math.max(0, Number(form.stock) || 0),
      stockMinimo: Math.max(0, Number(form.stockMinimo) || 0),
      ubicacion: form.ubicacion?.trim() || "",
      activo: form.activo ?? true,
    }

    if (editingItem) {
      updateCatalogItem({ ...editingItem, ...payload })
      toast.success("Item actualizado")
    } else {
      addCatalogItem({ id: crypto.randomUUID(), ...payload })
      toast.success("Item agregado al catálogo")
    }

    refreshCatalog()
    setDialogOpen(false)
  }, [editingItem, form, refreshCatalog])

  const deleteItem = useCallback((id: string) => {
    deleteCatalogItem(id)
    setDeleteConfirmId(null)
    setQuickViewItem((current) => (current?.id === id ? null : current))
    setSelectedIds((current) => current.filter((value) => value !== id))
    refreshCatalog()
    toast.success("Item eliminado")
  }, [refreshCatalog])

  const deleteSelection = useCallback(() => {
    if (selectedIds.length === 1) {
      setDeleteConfirmId(selectedIds[0])
      return
    }

    const updated = catalog.filter((item) => !selectedIds.includes(item.id))
    saveCatalog(updated)
    setCatalog(updated)
    clearSelection()
    toast.success(`${selectedIds.length} productos eliminados`)
  }, [catalog, clearSelection, selectedIds])

  const applyMassivePriceAdjustment = useCallback(() => {
    if (priceValue <= 0) return toast.error("Indique un valor mayor a 0")

    let targetIds: string[] = []
    if (priceScope === "selected") targetIds = selectedIds
    if (priceScope === "visible") targetIds = visibleIds
    if (priceScope === "category") {
      if (!priceCategory) return toast.error("Seleccione una categoría")
      targetIds = catalog.filter((item) => normalizeCatalogCategory(item) === priceCategory).map((item) => item.id)
    }
    if (priceScope === "all-ablerex") {
      targetIds = catalog.filter((item) => (item.brand || "General").toLowerCase() === "ablerex").map((item) => item.id)
    }
    if (targetIds.length === 0) return toast.error("No hay productos para ajustar")

    const targetSet = new Set(targetIds)
    const updated = catalog.map((item) => {
      if (!targetSet.has(item.id)) return item
      const delta = priceMode === "percentage" ? item.unitPrice * (priceValue / 100) : priceValue
      const next = priceAction === "increase" ? item.unitPrice + delta : item.unitPrice - delta
      return { ...item, unitPrice: Math.max(0, Number(next.toFixed(2))) }
    })

    saveCatalog(updated)
    setCatalog(updated)
    setPriceDialogOpen(false)
    toast.success(`Precios ajustados en ${targetIds.length} productos`)
  }, [catalog, priceAction, priceCategory, priceMode, priceScope, priceValue, selectedIds, visibleIds])

  const saveDiscount = useCallback(() => {
    const normalized = {
      ...discountConfig,
      value: Math.max(0, discountConfig.value),
      category: discountConfig.scope === "category" || discountConfig.scope === "subcategory" ? discountConfig.category : "",
      subcategory: discountConfig.scope === "subcategory" ? discountConfig.subcategory : "",
    }

    saveCatalogDiscountConfig(normalized)
    setDiscountConfig(normalized)
    setDiscountDialogOpen(false)
    toast.success("Descuento global guardado")
  }, [discountConfig])

  const syncAblerexCatalog = useCallback(() => {
    const keep = getCatalog().filter((item) => (item.brand || "General").toLowerCase() !== "ablerex")
    const merged = [...keep, ...ABLEREX_CATALOG]
    saveCatalog(merged)
    setCatalog(merged)
    toast.success(`Catálogo Ablerex actualizado (${ABLEREX_CATALOG.length} productos)`)
  }, [])

  const openBulkCategoryDialog = useCallback(() => {
    const firstSelected = catalog.find((item) => selectedIds.includes(item.id))
    setBulkCategory(firstSelected ? normalizeCatalogCategory(firstSelected) : "")
    setBulkSubcategory(firstSelected?.subcategory || "General")
    setBulkCategoryOpen(true)
  }, [catalog, selectedIds])

  const applyBulkCategoryChange = useCallback(() => {
    if (selectedIds.length === 0) return toast.error("Seleccione al menos un producto")
    if (!bulkCategory.trim()) return toast.error("Seleccione una categoría")

    const target = new Set(selectedIds)
    const updated = catalog.map((item) => target.has(item.id) ? { ...item, category: bulkCategory, subcategory: bulkSubcategory.trim() || "General" } : item)

    saveCatalog(updated)
    setCatalog(updated)
    setBulkCategoryOpen(false)
    toast.success("Categoría actualizada para la selección")
  }, [bulkCategory, bulkSubcategory, catalog, selectedIds])

  const addBrand = useCallback((brand: string) => {
    const trimmed = brand.trim()
    if (!trimmed) return false
    if (registeredBrands.some((b) => b.toLowerCase() === trimmed.toLowerCase())) return false
    const next = [...registeredBrands, trimmed].sort()
    setRegisteredBrands(next)
    addRegisteredBrand(trimmed)
    return true
  }, [registeredBrands])

  const removeBrand = useCallback((brand: string) => {
    const next = registeredBrands.filter((b) => b !== brand)
    setRegisteredBrands(next)
    removeRegisteredBrand(brand)
  }, [registeredBrands])

  const setRegisteredBrandsAndSave = useCallback((brands: string[]) => {
    setRegisteredBrands(brands)
    if (typeof window !== "undefined") {
      localStorage.setItem("cops_catalog_brands", JSON.stringify(brands))
    }
  }, [])

  return {
    state: {
      loading,
      search,
      sort,
      view,
      page: safePage,
      selectedCategory,
      selectedSubcategory,
      selectedBrands,
      registeredBrands,
      priceRange,
      stockFilter,
      selectedIds,
      activeItemId,
      quickViewItem,
      previewImage,
      dialogOpen,
      brandDialogOpen,
      editingItem,
      form,
      deleteConfirmId,
      priceDialogOpen,
      priceAction,
      priceMode,
      priceScope,
      priceValue,
      priceCategory,
      discountDialogOpen,
      discountConfig,
      bulkCategoryOpen,
      bulkCategory,
      bulkSubcategory,
    },
    derived: {
      counts,
      categories,
      brands,
      priceBounds,
      categoryOptions,
      subcategoryOptions,
      sidebarSubcategoryOptions,
      bulkSubcategoryOptions,
      discountSubcategoryOptions,
      filteredCount: sorted.length,
      paginated,
      totalPages,
      hasActiveFilters,
      activeFilters,
      allPageSelected,
      pageStart: sorted.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1,
      pageEnd: Math.min(safePage * PAGE_SIZE, sorted.length),
      listSortState,
      currentQuickViewItem: quickViewItem ? catalog.find((item) => item.id === quickViewItem.id) ?? quickViewItem : null,
      currentDeleteItem: deleteConfirmId ? catalog.find((item) => item.id === deleteConfirmId) ?? null : null,
    },
    actions: {
      setSearch,
      setSort,
      setView,
      setPage,
      setSelectedCategory,
      setSelectedSubcategory,
      setSelectedBrands,
      setPriceRange,
      setStockFilter,
      setActiveItemId,
      setQuickViewItem,
      setPreviewImage,
      setDialogOpen,
      setBrandDialogOpen,
      setForm,
      setDeleteConfirmId,
      setPriceDialogOpen,
      setPriceAction,
      setPriceMode,
      setPriceScope,
      setPriceValue,
      setPriceCategory,
      setDiscountDialogOpen,
      setDiscountConfig,
      setBulkCategoryOpen,
      setBulkCategory,
      setBulkSubcategory,
      getEffectivePrice,
      resetFilters,
      toggleSelected,
      clearSelection,
      selectAllResults,
      toggleSelectAllPage,
      openCreate,
      openEdit,
      duplicateItem,
      saveItem,
      deleteItem,
      deleteSelection,
      applyMassivePriceAdjustment,
      saveDiscount,
      syncAblerexCatalog,
      openBulkCategoryDialog,
      applyBulkCategoryChange,
      openImagePreview,
      mapListSortToToolbarSort,
      addBrand,
      removeBrand,
      setRegisteredBrands: setRegisteredBrandsAndSave,
    },
  }
}
