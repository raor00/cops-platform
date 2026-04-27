"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import type { Cliente } from "@cops/shared"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createCliente, getClienteById, searchClientes } from "@/lib/clientes-firestore"
import type { ClientInfo } from "@/lib/quotation-types"
import { Search, UserPlus } from "lucide-react"
import { toast } from "sonner"
import { ClientCreateDialog } from "./client-create-dialog"

interface ClientAutocompleteProps {
  companyFormat: "sa" | "llc"
  clientInfo: ClientInfo
  clienteId?: string
  onClientInfoChange: (info: ClientInfo) => void
  onClienteIdChange: (clienteId: string | undefined) => void
}

function getDisplayName(cliente: Cliente): string {
  const fullName = [cliente.nombre, cliente.apellido].filter(Boolean).join(" ").trim()
  return cliente.empresa?.trim() || fullName
}

function mapClienteToClientInfo(cliente: Cliente, current: ClientInfo, companyFormat: "sa" | "llc"): ClientInfo {
  const fullName = [cliente.nombre, cliente.apellido].filter(Boolean).join(" ").trim()
  const displayName = getDisplayName(cliente)
  const attention = fullName || displayName

  if (companyFormat === "llc") {
    return {
      ...current,
      name: displayName,
      attention,
      email: cliente.email || "",
      rif: cliente.rif_cedula || "",
      phone: cliente.telefono,
      address: cliente.direccion,
      billToName: displayName,
      billToAttention: attention,
      billToEmail: cliente.email || "",
      billToPhone: cliente.telefono,
      billToAddress: cliente.direccion,
      shipToName: current.shipToName || displayName,
      shipToAttention: current.shipToAttention || attention,
      shipToEmail: current.shipToEmail || cliente.email || "",
      shipToPhone: current.shipToPhone || cliente.telefono,
      shipToAddress: current.shipToAddress || cliente.direccion,
    }
  }

  return {
    ...current,
    name: displayName,
    attention,
    email: cliente.email || "",
    rif: cliente.rif_cedula || "",
    phone: cliente.telefono,
    address: cliente.direccion,
  }
}

export function ClientAutocomplete({
  companyFormat,
  clientInfo,
  clienteId,
  onClientInfoChange,
  onClienteIdChange,
}: ClientAutocompleteProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement | null>(null)

  const selectedLabel = useMemo(() => {
    if (companyFormat === "llc") return clientInfo.billToName || clientInfo.name
    return clientInfo.name
  }, [clientInfo.billToName, clientInfo.name, companyFormat])

  useEffect(() => {
    if (!clienteId) return

    let cancelled = false

    const loadCliente = async () => {
      const result = await getClienteById(clienteId)
      if (!cancelled && result.success && result.data) {
        setQuery(getDisplayName(result.data))
      }
    }

    void loadCliente()

    return () => {
      cancelled = true
    }
  }, [clienteId])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    let cancelled = false

    if (!query.trim()) {
      setResults([])
      setLoading(false)
      return
    }

    const timer = window.setTimeout(async () => {
      setLoading(true)
      try {
        const result = await searchClientes(query)
        if (!cancelled) {
          if (result.success) {
            setResults(result.data || [])
          } else {
            setResults([])
            if (result.error) toast.error(result.error)
          }
        }
      } catch {
        if (!cancelled) {
          setResults([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }, 250)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [query])

  const handleSelect = (cliente: Cliente) => {
    onClientInfoChange(mapClienteToClientInfo(cliente, clientInfo, companyFormat))
    onClienteIdChange(cliente.id)
    setQuery(getDisplayName(cliente))
    setOpen(false)
  }

  const handleCreated = (cliente: Cliente) => {
    setResults((current) => [cliente, ...current.filter((item) => item.id !== cliente.id)])
    handleSelect(cliente)
  }

  return (
    <>
      <div className="rounded-2xl border border-border bg-card p-4" ref={wrapperRef}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex-1 space-y-1.5">
            <Label>Cliente</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value)
                  setOpen(true)
                  if (!event.target.value.trim()) onClienteIdChange(undefined)
                }}
                onFocus={() => setOpen(true)}
                placeholder="Buscar por nombre, empresa o teléfono"
                className="pl-9"
              />
              {open ? (
                <div className="absolute z-20 mt-2 max-h-72 w-full overflow-y-auto rounded-xl border border-border bg-background p-2 shadow-lg">
                  {loading ? <p className="px-2 py-3 text-sm text-muted-foreground">Buscando clientes...</p> : null}
                  {!loading && results.length === 0 ? <p className="px-2 py-3 text-sm text-muted-foreground">No hay coincidencias.</p> : null}
                  {!loading
                    ? results.map((cliente) => (
                        <button
                          key={cliente.id}
                          type="button"
                          onClick={() => handleSelect(cliente)}
                          className="flex w-full flex-col rounded-lg px-3 py-2 text-left transition-colors hover:bg-muted"
                        >
                          <span className="text-sm font-medium text-foreground">{getDisplayName(cliente)}</span>
                          <span className="text-xs text-muted-foreground">
                            {[cliente.empresa, cliente.telefono].filter(Boolean).join(" · ")}
                          </span>
                        </button>
                      ))
                    : null}
                </div>
              ) : null}
            </div>
          </div>

          <Button type="button" variant="outline" onClick={() => setCreateOpen(true)}>
            <UserPlus className="h-4 w-4" />
            + Nuevo Cliente
          </Button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span className="rounded-full bg-muted px-2.5 py-1">
            {clienteId ? `Cliente vinculado: ${selectedLabel || query || clienteId}` : "Sin cliente vinculado"}
          </span>
          {!clienteId && selectedLabel ? <span className="rounded-full bg-amber-50 px-2.5 py-1 text-amber-700">Modo manual activo</span> : null}
        </div>
      </div>

      <ClientCreateDialog open={createOpen} onOpenChange={setCreateOpen} onCreated={handleCreated} />
    </>
  )
}
