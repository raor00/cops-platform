"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, X } from "lucide-react"
import { toast } from "sonner"

interface BrandManagerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  brands: string[]
  onBrandsChange: (brands: string[]) => void
}

export function BrandManagerDialog({ open, onOpenChange, brands, onBrandsChange }: BrandManagerDialogProps) {
  const [newBrand, setNewBrand] = useState("")

  const handleAdd = () => {
    const trimmed = newBrand.trim()
    if (!trimmed) {
      toast.error("Ingrese un nombre de marca")
      return
    }
    if (brands.some((b) => b.toLowerCase() === trimmed.toLowerCase())) {
      toast.error("La marca ya existe")
      return
    }
    onBrandsChange([...brands, trimmed].sort())
    setNewBrand("")
    toast.success(`Marca "${trimmed}" agregada`)
  }

  const handleRemove = (brand: string) => {
    onBrandsChange(brands.filter((b) => b !== brand))
    toast.success(`Marca "${brand}" eliminada`)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAdd()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Gestionar Marcas</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add new brand */}
          <div className="space-y-2">
            <Label>Nueva marca</Label>
            <div className="flex gap-2">
              <Input
                value={newBrand}
                onChange={(e) => setNewBrand(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ej: Samsung, Dahua, etc."
                className="flex-1"
              />
              <Button type="button" size="sm" onClick={handleAdd}>
                <Plus className="h-4 w-4" />
                Agregar
              </Button>
            </div>
          </div>

          {/* Brand list */}
          <div className="space-y-2">
            <Label>Marcas registradas ({brands.length})</Label>
            <div className="max-h-[300px] overflow-y-auto rounded-lg border border-border">
              {brands.length === 0 ? (
                <p className="p-4 text-center text-sm text-muted-foreground">No hay marcas registradas</p>
              ) : (
                <div className="divide-y divide-border">
                  {brands.map((brand) => (
                    <div key={brand} className="flex items-center justify-between px-3 py-2 hover:bg-muted/50">
                      <span className="text-sm">{brand}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => handleRemove(brand)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span className="sr-only">Eliminar {brand}</span>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
