"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { TableProperties } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Technician {
  id: string
  nombre: string
  apellido: string
}

interface GenCuadroDialogProps {
  technicians: Technician[]
}

export function GenCuadroDialog({ technicians }: GenCuadroDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [tecnicoId, setTecnicoId] = useState<string>("todos")

  function handleGenerar() {
    const url =
      tecnicoId === "todos"
        ? "/dashboard/pagos/cuadro"
        : `/dashboard/pagos/cuadro?tecnicoId=${tecnicoId}`
    setOpen(false)
    router.push(url)
  }

  return (
    <>
      <Button
        variant="ghost"
        onClick={() => setOpen(true)}
        className="border border-white/10 bg-white/5 text-white/70 hover:text-white hover:bg-white/10 gap-2"
      >
        <TableProperties className="h-4 w-4" />
        Generar Cuadro
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Generar Cuadro de Pagos</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <p className="text-sm text-white/60">Selecciona el técnico para el cuadro:</p>
            <Select value={tecnicoId} onValueChange={setTecnicoId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los técnicos</SelectItem>
                {technicians.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.nombre} {t.apellido}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleGenerar}>
              Generar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
