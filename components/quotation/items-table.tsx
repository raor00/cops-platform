"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import type { QuotationItem, PresetItem } from "@/lib/quotation-types"
import { PRESET_ITEMS, CATEGORIES, formatCurrency } from "@/lib/quotation-types"
import { Plus, Trash2, Package, Wrench, Search } from "lucide-react"

interface ItemsTableProps {
  items: QuotationItem[]
  laborCost: number
  laborDescription: string
  onItemsChange: (items: QuotationItem[]) => void
  onLaborCostChange: (cost: number) => void
  onLaborDescriptionChange: (desc: string) => void
}

export function ItemsTable({
  items,
  laborCost,
  laborDescription,
  onItemsChange,
  onLaborCostChange,
  onLaborDescriptionChange,
}: ItemsTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [presetDialogOpen, setPresetDialogOpen] = useState(false)

  const addEmptyItem = () => {
    const newItem: QuotationItem = {
      id: crypto.randomUUID(),
      quantity: 1,
      code: "",
      description: "",
      unitPrice: 0,
      totalPrice: 0,
    }
    onItemsChange([...items, newItem])
  }

  const addPresetItem = (preset: PresetItem) => {
    const newItem: QuotationItem = {
      id: crypto.randomUUID(),
      quantity: 1,
      code: preset.code,
      description: preset.description,
      unitPrice: preset.unitPrice,
      totalPrice: preset.unitPrice,
    }
    onItemsChange([...items, newItem])
    setPresetDialogOpen(false)
  }

  const updateItem = (id: string, field: keyof QuotationItem, value: string | number) => {
    onItemsChange(
      items.map((item) => {
        if (item.id !== id) return item
        const updated = { ...item, [field]: value }
        if (field === "quantity" || field === "unitPrice") {
          const qty = field === "quantity" ? Number(value) : item.quantity
          const price = field === "unitPrice" ? Number(value) : item.unitPrice
          updated.totalPrice = qty * price
        }
        return updated
      })
    )
  }

  const removeItem = (id: string) => {
    onItemsChange(items.filter((item) => item.id !== id))
  }

  const filteredPresets = PRESET_ITEMS.filter((item) => {
    const matchSearch =
      searchTerm === "" ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase())
    const matchCategory = selectedCategory === "all" || item.category === selectedCategory
    return matchSearch && matchCategory
  })

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="flex items-center gap-2 font-heading text-lg font-semibold text-foreground">
          <Package className="h-5 w-5 text-[#1a5276]" />
          Items / Equipos
        </h2>
        <div className="flex gap-2">
          <Dialog open={presetDialogOpen} onOpenChange={setPresetDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="border-[#1a5276] text-[#1a5276] hover:bg-[#1a5276] hover:text-white bg-transparent"
              >
                <Search className="mr-1.5 h-4 w-4" />
                Catalogo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto bg-card text-foreground">
              <DialogHeader>
                <DialogTitle className="font-heading text-foreground">Catalogo de Productos</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Input
                      placeholder="Buscar por codigo o descripcion..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="border-border bg-card text-foreground"
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-44 border-border bg-card text-foreground">
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  {filteredPresets.map((preset) => (
                    <button
                      key={preset.code}
                      type="button"
                      onClick={() => addPresetItem(preset)}
                      className="w-full rounded-lg border border-border p-3 text-left transition-colors hover:border-[#1a5276] hover:bg-muted"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-mono text-xs text-[#1a5276]">{preset.code}</p>
                          <p className="mt-0.5 text-sm text-foreground">{preset.description}</p>
                          <span className="mt-1 inline-block rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                            {preset.category}
                          </span>
                        </div>
                        <p className="whitespace-nowrap font-semibold text-foreground">
                          ${formatCurrency(preset.unitPrice)}
                        </p>
                      </div>
                    </button>
                  ))}
                  {filteredPresets.length === 0 && (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                      No se encontraron productos
                    </p>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button
            onClick={addEmptyItem}
            size="sm"
            className="bg-[#1a5276] text-white hover:bg-[#0e3a57]"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Agregar Item
          </Button>
        </div>
      </div>

      {/* Items Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-2 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Cant.
              </th>
              <th className="px-2 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Codigo / Modelo
              </th>
              <th className="min-w-[250px] px-2 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Descripcion
              </th>
              <th className="px-2 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                P. Unitario
              </th>
              <th className="px-2 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                P. Total
              </th>
              <th className="px-2 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map((item, index) => (
              <tr key={item.id} className="group transition-colors hover:bg-muted/50">
                <td className="px-2 py-2">
                  <Input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, "quantity", Number(e.target.value))}
                    className="w-16 border-border bg-card text-center text-sm text-foreground"
                  />
                </td>
                <td className="px-2 py-2">
                  <Input
                    value={item.code}
                    onChange={(e) => updateItem(item.id, "code", e.target.value)}
                    placeholder="COD-001"
                    className="w-40 border-border bg-card font-mono text-xs text-foreground"
                  />
                </td>
                <td className="px-2 py-2">
                  <Textarea
                    value={item.description}
                    onChange={(e) => updateItem(item.id, "description", e.target.value)}
                    placeholder="Descripcion del producto o servicio"
                    rows={2}
                    className="min-w-[250px] resize-none border-border bg-card text-sm text-foreground"
                  />
                </td>
                <td className="px-2 py-2">
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    value={item.unitPrice}
                    onChange={(e) => updateItem(item.id, "unitPrice", Number(e.target.value))}
                    className="w-28 border-border bg-card text-right text-sm text-foreground"
                  />
                </td>
                <td className="px-2 py-2 text-right font-semibold text-foreground">
                  <span className="text-sm">${formatCurrency(item.totalPrice)}</span>
                </td>
                <td className="px-2 py-2 text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(item.id)}
                    className="text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Eliminar item {index + 1}</span>
                  </Button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-sm text-muted-foreground">
                  No hay items agregados. Use el boton &quot;Agregar Item&quot; o seleccione del &quot;Catalogo&quot;.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Labor / Mano de Obra */}
      <div className="mt-6 rounded-lg border border-border bg-muted/30 p-4">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
          <Wrench className="h-4 w-4 text-[#1a5276]" />
          Mano de Obra / Instalacion
        </h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-1.5 md:col-span-2">
            <Label className="text-xs text-muted-foreground">Descripcion</Label>
            <Textarea
              value={laborDescription}
              onChange={(e) => onLaborDescriptionChange(e.target.value)}
              placeholder="Ej: Instalacion, configuracion y puesta en marcha del sistema CCTV..."
              rows={2}
              className="resize-none border-border bg-card text-sm text-foreground"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Costo Mano de Obra (USD)</Label>
            <Input
              type="number"
              min={0}
              step={0.01}
              value={laborCost}
              onChange={(e) => onLaborCostChange(Number(e.target.value))}
              className="border-border bg-card text-right text-foreground"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
