"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { CatalogCategory, CatalogDiscountConfig, CatalogItem } from "@/lib/quotation-types"
import { DollarSign, Percent } from "lucide-react"

type ProductFormState = Omit<CatalogItem, "id">
type PriceAction = "increase" | "decrease"
type PriceScope = "selected" | "visible" | "category" | "all-ablerex"

interface CreateEditCatalogItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingItem: CatalogItem | null
  form: ProductFormState
  onFormChange: (updater: (current: ProductFormState) => ProductFormState) => void
  categoryOptions: string[]
  subcategoryOptions: string[]
  brandOptions: string[]
  onSave: () => void
  onPreviewImage: (src: string, alt: string) => void
  onManageBrands?: () => void
}

export function CreateEditCatalogItemDialog({
  open,
  onOpenChange,
  editingItem,
  form,
  onFormChange,
  categoryOptions,
  subcategoryOptions,
  brandOptions,
  onSave,
  onPreviewImage,
  onManageBrands,
}: CreateEditCatalogItemDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editingItem ? "Editar item" : "Nuevo item de catálogo"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Código / modelo</Label>
              <Input value={form.code} onChange={(event) => onFormChange((current) => ({ ...current, code: event.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label>Marca</Label>
                {onManageBrands ? (
                  <button type="button" onClick={onManageBrands} className="text-xs text-primary hover:underline">
                    + Gestionar
                  </button>
                ) : null}
              </div>
              <Select value={form.brand || "Generico"} onValueChange={(value) => onFormChange((current) => ({ ...current, brand: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione marca" />
                </SelectTrigger>
                <SelectContent>
                  {brandOptions.map((brand) => (
                    <SelectItem key={brand} value={brand}>
                      {brand}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Categoría</Label>
              <Select value={form.category} onValueChange={(value) => onFormChange((current) => ({ ...current, category: value as CatalogCategory }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Subcategoría</Label>
              <Select value={form.subcategory || "General"} onValueChange={(value) => onFormChange((current) => ({ ...current, subcategory: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione" />
                </SelectTrigger>
                <SelectContent>
                  {subcategoryOptions.map((subcategory) => (
                    <SelectItem key={subcategory} value={subcategory}>
                      {subcategory}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Descripción</Label>
            <Input value={form.description} onChange={(event) => onFormChange((current) => ({ ...current, description: event.target.value }))} />
          </div>

          <div className="space-y-1.5">
            <Label>URL de imagen</Label>
            <div className="flex gap-2">
              <Input
                value={form.imageUrl || ""}
                onChange={(event) => onFormChange((current) => ({ ...current, imageUrl: event.target.value }))}
                placeholder="https://..."
              />
              <Button type="button" variant="outline" onClick={() => onPreviewImage(form.imageUrl || "", form.description || form.code)} disabled={!form.imageUrl}>
                Vista previa
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Precio (USD)</Label>
              <Input
                type="text"
                inputMode="decimal"
                placeholder="0.00"
                value={form.unitPrice === 0 ? "" : String(form.unitPrice)}
                onFocus={(event) => event.target.select()}
                onChange={(event) => {
                  const raw = event.target.value.replace(/[^0-9.]/g, "")
                  const parts = raw.split(".")
                  const sanitized = parts.length > 2 ? `${parts[0]}.${parts.slice(1).join("")}` : raw
                  onFormChange((current) => ({ ...current, unitPrice: sanitized === "" ? 0 : Number(sanitized) }))
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Unidad</Label>
              <Select value={form.unit} onValueChange={(value) => onFormChange((current) => ({ ...current, unit: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['UND', 'BOB', 'BLS', 'MTS', 'RLL', 'KIT', 'GLB'].map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Stock actual</Label>
              <Input
                type="number"
                min={0}
                value={form.stock ?? 0}
                onChange={(event) => onFormChange((current) => ({ ...current, stock: Math.max(0, Number(event.target.value) || 0) }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Stock mínimo</Label>
              <Input
                type="number"
                min={0}
                value={form.stockMinimo ?? 0}
                onChange={(event) => onFormChange((current) => ({ ...current, stockMinimo: Math.max(0, Number(event.target.value) || 0) }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Ubicación</Label>
              <Input value={form.ubicacion || ""} onChange={(event) => onFormChange((current) => ({ ...current, ubicacion: event.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Costo (USD)</Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={form.costo ?? 0}
                onChange={(event) => onFormChange((current) => ({ ...current, costo: Math.max(0, Number(event.target.value) || 0) }))}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Variante</Label>
            <Input value={form.variant} onChange={(event) => onFormChange((current) => ({ ...current, variant: event.target.value }))} />
          </div>

          <label className="flex items-center gap-3 rounded-lg border border-border/70 px-3 py-2">
            <Checkbox
              checked={form.activo ?? true}
              onCheckedChange={(checked) => onFormChange((current) => ({ ...current, activo: checked === true }))}
            />
            <div>
              <p className="text-sm font-medium">Producto activo</p>
              <p className="text-xs text-muted-foreground">Los productos inactivos se conservan para compatibilidad y auditoría.</p>
            </div>
          </label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={onSave}>{editingItem ? "Guardar" : "Agregar"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface DeleteCatalogItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function DeleteCatalogItemDialog({ open, onOpenChange, onConfirm }: DeleteCatalogItemDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Confirmar eliminación</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">Este item será eliminado permanentemente.</p>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Eliminar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface PriceAdjustmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  priceAction: PriceAction
  onPriceActionChange: (value: PriceAction) => void
  priceMode: CatalogDiscountConfig["mode"]
  onPriceModeChange: (value: CatalogDiscountConfig["mode"]) => void
  priceScope: PriceScope
  onPriceScopeChange: (value: PriceScope) => void
  priceValue: number
  onPriceValueChange: (value: number) => void
  priceCategory: string
  onPriceCategoryChange: (value: string) => void
  categoryOptions: string[]
  onApply: () => void
}

export function PriceAdjustmentDialog({
  open,
  onOpenChange,
  priceAction,
  onPriceActionChange,
  priceMode,
  onPriceModeChange,
  priceScope,
  onPriceScopeChange,
  priceValue,
  onPriceValueChange,
  priceCategory,
  onPriceCategoryChange,
  categoryOptions,
  onApply,
}: PriceAdjustmentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Ajuste masivo de precios</DialogTitle>
        </DialogHeader>

        <div className="grid gap-3 py-2 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Acción</Label>
            <Select value={priceAction} onValueChange={(value) => onPriceActionChange(value as PriceAction)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="increase">Aumentar</SelectItem>
                <SelectItem value="decrease">Reducir</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Modo</Label>
            <Select value={priceMode} onValueChange={(value) => onPriceModeChange(value as CatalogDiscountConfig["mode"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">% Porcentaje</SelectItem>
                <SelectItem value="amount">USD Monto</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Valor</Label>
            <div className="relative">
              {priceMode === "percentage"
                ? <Percent className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                : <DollarSign className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />}
              <Input type="number" min={0} step={0.01} value={priceValue} onChange={(event) => onPriceValueChange(event.target.value === "" ? 0 : Number(event.target.value))} className="pl-9" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Alcance</Label>
            <Select value={priceScope} onValueChange={(value) => onPriceScopeChange(value as PriceScope)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="selected">Seleccionados</SelectItem>
                <SelectItem value="visible">Visibles</SelectItem>
                <SelectItem value="category">Categoría</SelectItem>
                <SelectItem value="all-ablerex">Todo Ablerex</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label>Categoría objetivo</Label>
            <Select value={priceCategory || "none"} onValueChange={(value) => onPriceCategoryChange(value === "none" ? "" : value)} disabled={priceScope !== "category"}>
              <SelectTrigger><SelectValue placeholder="Seleccione" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Seleccione</SelectItem>
                {categoryOptions.map((category) => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={onApply}>Aplicar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface DiscountConfigDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  discountConfig: CatalogDiscountConfig
  onDiscountConfigChange: (updater: (current: CatalogDiscountConfig) => CatalogDiscountConfig) => void
  categoryOptions: string[]
  subcategoryOptions: string[]
  onSave: () => void
}

export function DiscountConfigDialog({
  open,
  onOpenChange,
  discountConfig,
  onDiscountConfigChange,
  categoryOptions,
  subcategoryOptions,
  onSave,
}: DiscountConfigDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Configurar descuento global</DialogTitle>
        </DialogHeader>

        <div className="grid gap-3 py-2 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Estado</Label>
            <Select value={discountConfig.enabled ? "si" : "no"} onValueChange={(value) => onDiscountConfigChange((current) => ({ ...current, enabled: value === "si" }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="si">Activo</SelectItem>
                <SelectItem value="no">Inactivo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Modo</Label>
            <Select value={discountConfig.mode} onValueChange={(value) => onDiscountConfigChange((current) => ({ ...current, mode: value as CatalogDiscountConfig["mode"] }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">% Porcentaje</SelectItem>
                <SelectItem value="amount">USD Monto</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Valor</Label>
            <Input type="number" min={0} step={0.01} value={discountConfig.value} onChange={(event) => onDiscountConfigChange((current) => ({ ...current, value: event.target.value === "" ? 0 : Number(event.target.value) }))} />
          </div>

          <div className="space-y-1.5">
            <Label>Alcance</Label>
            <Select value={discountConfig.scope} onValueChange={(value) => onDiscountConfigChange((current) => ({ ...current, scope: value as CatalogDiscountConfig["scope"] }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todo el catálogo</SelectItem>
                <SelectItem value="category">Por categoría</SelectItem>
                <SelectItem value="subcategory">Por subcategoría</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label>Categoría</Label>
            <Select value={discountConfig.category || "none"} onValueChange={(value) => onDiscountConfigChange((current) => ({ ...current, category: value === "none" ? "" : value, subcategory: value === "none" ? "" : current.subcategory }))} disabled={discountConfig.scope === "all"}>
              <SelectTrigger><SelectValue placeholder="Seleccione" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Seleccione</SelectItem>
                {categoryOptions.map((category) => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label>Subcategoría</Label>
            <Select value={discountConfig.subcategory || "none"} onValueChange={(value) => onDiscountConfigChange((current) => ({ ...current, subcategory: value === "none" ? "" : value }))} disabled={discountConfig.scope !== "subcategory"}>
              <SelectTrigger><SelectValue placeholder="Seleccione" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Seleccione</SelectItem>
                {subcategoryOptions.map((subcategory) => (
                  <SelectItem key={subcategory} value={subcategory}>{subcategory}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={onSave}>Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface BulkCategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: string
  onCategoryChange: (value: string) => void
  subcategory: string
  onSubcategoryChange: (value: string) => void
  categoryOptions: string[]
  subcategoryOptions: string[]
  onApply: () => void
}

export function BulkCategoryDialog({
  open,
  onOpenChange,
  category,
  onCategoryChange,
  subcategory,
  onSubcategoryChange,
  categoryOptions,
  subcategoryOptions,
  onApply,
}: BulkCategoryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cambiar categoría</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <Label>Categoría</Label>
            <Select value={category || "none"} onValueChange={(value) => onCategoryChange(value === "none" ? "" : value)}>
              <SelectTrigger><SelectValue placeholder="Seleccione" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Seleccione</SelectItem>
                {categoryOptions.map((option) => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Subcategoría</Label>
            <Select value={subcategory || "General"} onValueChange={onSubcategoryChange}>
              <SelectTrigger><SelectValue placeholder="Seleccione" /></SelectTrigger>
              <SelectContent>
                {subcategoryOptions.map((option) => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={onApply}>Aplicar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
