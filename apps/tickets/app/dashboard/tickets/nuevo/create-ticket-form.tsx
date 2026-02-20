"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Plus, Trash2, Loader2, Search, X, CheckCircle2, ExternalLink, BookOpen, Link2, Info } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ticketCreateSchema, type TicketCreateInput } from "@/lib/validations"
import { createTicket } from "@/lib/actions/tickets"
import { searchClientes } from "@/lib/actions/clientes"
import { generateId } from "@/lib/utils"
import { TICKET_CATALOG, type CatalogEntry } from "@/lib/catalog-data"
import { getCatalogIdentifier, getCatalogSegment } from "@/lib/catalog-rules"
import type { MaterialItem, Cliente } from "@/types"

type CatalogFilter = "all" | "equipos" | "materiales"

const DEFAULT_COTIZACIONES_URL = "https://cops-platform-cotizaciones.vercel.app"

function normalizeAbsoluteUrl(raw: string | undefined) {
  if (!raw) return null
  const trimmed = raw.trim()
  if (!trimmed) return null

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`

  try {
    return new URL(withProtocol).toString().replace(/\/$/, "")
  } catch {
    return null
  }
}

function getCotizacionesAppUrl() {
  const candidates = [
    process.env.NEXT_PUBLIC_PLATFORM_COTIZACIONES_URL,
    process.env.NEXT_PUBLIC_COTIZACIONES_URL,
    process.env.NEXT_PUBLIC_COTIZACIONES_APP_URL,
    DEFAULT_COTIZACIONES_URL,
  ]

  for (const candidate of candidates) {
    const normalized = normalizeAbsoluteUrl(candidate)
    if (normalized) return normalized
  }

  return DEFAULT_COTIZACIONES_URL
}

interface CreateTicketFormProps {
  technicians: Array<{ id: string; nombre: string; apellido: string }>
  defaultTipo?: "servicio" | "proyecto" | "inspeccion"
}

export function CreateTicketForm({ technicians, defaultTipo = "servicio" }: CreateTicketFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [materials, setMaterials] = useState<MaterialItem[]>([])

  // Client search state
  const [clientQuery, setClientQuery] = useState("")
  const [clientResults, setClientResults] = useState<Cliente[]>([])
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null)
  const [searchLoading, setSearchLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  // Catalog state
  const [showCatalogSearch, setShowCatalogSearch] = useState(false)
  const [catalogQuery, setCatalogQuery] = useState("")
  const [catalogFilter, setCatalogFilter] = useState<CatalogFilter>("all")

  // Linked quotation state
  const [cotizacionVinculada, setCotizacionVinculada] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TicketCreateInput>({
    resolver: zodResolver(ticketCreateSchema),
    defaultValues: {
      tipo: defaultTipo,
      prioridad: "media",
      origen: "email",
      monto_servicio: defaultTipo === "inspeccion" ? 20 : 40,
      tipo_mantenimiento: defaultTipo === "servicio" ? "correctivo" : undefined,
    },
  })

  const tipoTicket = watch("tipo")
  const origenTicket = watch("origen")

  // Auto-set monto when tipo changes
  useEffect(() => {
    if (tipoTicket === "inspeccion") {
      setValue("monto_servicio", 20)
    } else if (tipoTicket === "servicio") {
      setValue("monto_servicio", 40)
    }
  }, [tipoTicket, setValue])

  // Filtered catalog entries
  const catalogFiltered = useMemo(() => {
    let entries = TICKET_CATALOG
    // Apply category filter
    if (catalogFilter === "equipos") {
      entries = entries.filter((entry) => getCatalogSegment(entry) === "equipo")
    } else if (catalogFilter === "materiales") {
      entries = entries.filter((entry) => getCatalogSegment(entry) === "material")
    }
    // Apply text search
    if (catalogQuery) {
      const q = catalogQuery.toLowerCase()
      entries = entries.filter(
        (e) =>
          e.description.toLowerCase().includes(q) ||
          e.code.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q)
      )
    }
    return entries.slice(0, 15)
  }, [catalogQuery, catalogFilter])

  // Close client dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  // Search clients with debounce
  useEffect(() => {
    if (!clientQuery || clientQuery.length < 2) {
      setClientResults([])
      setShowDropdown(false)
      return
    }
    const timer = setTimeout(async () => {
      setSearchLoading(true)
      try {
        const result = await searchClientes(clientQuery)
        if (result.success && result.data) {
          setClientResults(result.data.slice(0, 5))
          setShowDropdown(true)
        }
      } finally {
        setSearchLoading(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [clientQuery])

  // postMessage listener for quotation import
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type !== "COPS_COTIZACION_SELECTED") return
      const data = e.data.data as {
        code: string
        subject: string
        notes?: string
        total: number
        clientInfo?: {
          attention?: string
          name?: string
          email?: string
          phone?: string
          address?: string
          billToAttention?: string
          billToName?: string
          billToEmail?: string
          billToPhone?: string
          billToAddress?: string
        }
        items?: Array<{ description: string; quantity: number; code?: string }>
        materials?: Array<{ description: string; quantity: number; code?: string }>
      }
      setCotizacionVinculada(data.code)
      setSelectedCliente(null)
      if (data.subject) setValue("asunto", data.subject)
      setValue("descripcion", `Proyecto basado en cotizaciÃ³n ${data.code}.${data.notes ? " " + data.notes : ""}`)
      setValue("monto_servicio", data.total)
      const clienteNombre = data.clientInfo?.attention || data.clientInfo?.billToAttention
      const clienteEmpresa = data.clientInfo?.name || data.clientInfo?.billToName
      const clienteEmail = data.clientInfo?.email || data.clientInfo?.billToEmail
      const clienteTelefono = data.clientInfo?.phone || data.clientInfo?.billToPhone
      const clienteDireccion = data.clientInfo?.address || data.clientInfo?.billToAddress
      if (clienteNombre) setValue("cliente_nombre", clienteNombre)
      if (clienteEmpresa) setValue("cliente_empresa", clienteEmpresa)
      if (clienteEmail) setValue("cliente_email", clienteEmail)
      if (clienteTelefono) setValue("cliente_telefono", clienteTelefono)
      if (clienteDireccion) setValue("cliente_direccion", clienteDireccion)
      const allItems = [...(data.items || []), ...(data.materials || [])]
      if (allItems.length > 0) {
        setMaterials(
          allItems.map((item) => ({
            id: generateId(),
            nombre: item.description,
            cantidad: item.quantity,
            unidad: "UND",
            observacion: item.code,
          }))
        )
      }
      toast.success(`CotizaciÃ³n ${data.code} vinculada`, {
        description: `${allItems.length} materiales importados`,
      })
    }
    window.addEventListener("message", handler)
    return () => window.removeEventListener("message", handler)
  }, [setValue])

  function selectCliente(cliente: Cliente) {
    setSelectedCliente(cliente)
    setShowDropdown(false)
    setClientQuery("")
    const nombreCompleto = cliente.apellido
      ? `${cliente.nombre} ${cliente.apellido}`
      : cliente.nombre
    setValue("cliente_nombre", nombreCompleto)
    setValue("cliente_empresa", cliente.empresa ?? "")
    setValue("cliente_email", cliente.email ?? "")
    setValue("cliente_telefono", cliente.telefono)
    setValue("cliente_direccion", cliente.direccion)
  }

  function clearCliente() {
    setSelectedCliente(null)
    setClientQuery("")
    setValue("cliente_nombre", "")
    setValue("cliente_empresa", "")
    setValue("cliente_email", "")
    setValue("cliente_telefono", "")
    setValue("cliente_direccion", "")
  }

  const addMaterial = () => {
    setMaterials([
      ...materials,
      { id: generateId(), nombre: "", cantidad: 1, unidad: "UND" },
    ])
  }

  function addMaterialFromCatalog(entry: CatalogEntry) {
    setMaterials((prev) => [
      ...prev,
      {
        id: generateId(),
        nombre: entry.description,
        cantidad: 1,
        unidad: entry.unit,
        observacion: getCatalogIdentifier(entry),
      },
    ])
    // Panel stays open for multi-selection; just clear the text search
    setCatalogQuery("")
    toast.success(`${entry.description.slice(0, 35)}... agregado`, { duration: 1500 })
  }

  function abrirSelectorCotizacion() {
    const cotizUrl = getCotizacionesAppUrl()
    window.open(
      `${cotizUrl}?select=true`,
      "cotizacion-select",
      "width=950,height=650,resizable=yes,scrollbars=yes"
    )
  }

  const removeMaterial = (id: string) => {
    setMaterials(materials.filter((m) => m.id !== id))
  }

  const updateMaterial = (id: string, field: keyof MaterialItem, value: string | number) => {
    setMaterials(
      materials.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    )
  }

  const onSubmit = async (data: TicketCreateInput) => {
    setIsSubmitting(true)
    try {
      const submitData = {
        ...data,
        materiales_planificados: materials.length > 0 ? materials : undefined,
        tecnico_id: data.tecnico_id || undefined,
        monto_servicio: tipoTicket === "inspeccion" ? 20 : tipoTicket === "servicio" ? 40 : data.monto_servicio,
      }

      const result = await createTicket(submitData)

      if (result.success) {
        toast.success("Ticket creado", { description: result.message })
        router.push("/dashboard/tickets")
      } else {
        toast.error("Error", { description: result.error || "No se pudo crear el ticket" })
      }
    } catch {
      toast.error("Error", { description: "OcurriÃ³ un error inesperado" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

      {/* â”€â”€ Tipo y Origen â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="form-section">
        <h3 className="form-section-title">Tipo de Ticket</h3>
        <div className="form-row">
          <div className="form-group">
            <Label>Tipo *</Label>
            <Select
              defaultValue={defaultTipo}
              onValueChange={(value) => setValue("tipo", value as "servicio" | "proyecto" | "inspeccion")}
            >
              <SelectTrigger error={errors.tipo?.message}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="servicio">Servicio ($40 fijo)</SelectItem>
                <SelectItem value="proyecto">Proyecto (monto variable)</SelectItem>
                <SelectItem value="inspeccion">InspecciÃ³n ($20 fijo)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="form-group">
            <Label>Origen *</Label>
            <Select
              defaultValue="email"
              onValueChange={(value) => setValue("origen", value as "email" | "telefono" | "carta_aceptacion")}
            >
              <SelectTrigger error={errors.origen?.message}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Correo electrÃ³nico</SelectItem>
                <SelectItem value="telefono">Llamada telefÃ³nica</SelectItem>
                <SelectItem value="carta_aceptacion">Carta de aceptaciÃ³n</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* NÃºmero de carta condicional */}
        <div
          className="overflow-hidden transition-all duration-200"
          style={{ maxHeight: origenTicket === "carta_aceptacion" ? "80px" : "0px", opacity: origenTicket === "carta_aceptacion" ? 1 : 0 }}
        >
          <div className="form-group pt-1">
            <Label>NÃºmero de Carta</Label>
            <Input
              placeholder="Ej: CA-2024-001"
              error={errors.numero_carta?.message}
              {...register("numero_carta")}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <Label>Prioridad *</Label>
            <Select
              defaultValue="media"
              onValueChange={(value) => setValue("prioridad", value as "baja" | "media" | "alta" | "urgente")}
            >
              <SelectTrigger error={errors.prioridad?.message}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="baja">Baja</SelectItem>
                <SelectItem value="media">Media</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
                <SelectItem value="urgente">Urgente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {tipoTicket === "servicio" && (
            <div className="form-group">
              <Label>Tipo de Servicio *</Label>
              <Select
                defaultValue="correctivo"
                onValueChange={(value) => setValue("tipo_mantenimiento", value as "correctivo" | "preventivo")}
              >
                <SelectTrigger error={errors.tipo_mantenimiento?.message}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="correctivo">Correctivo</SelectItem>
                  <SelectItem value="preventivo">Preventivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {tipoTicket === "proyecto" && (
            <div className="form-group">
              <Label>Monto del Proyecto ($) *</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                error={errors.monto_servicio?.message}
                {...register("monto_servicio", { valueAsNumber: true })}
              />
            </div>
          )}
        </div>

        {/* Info badge para inspecciÃ³n */}
        {tipoTicket === "inspeccion" && (
          <div className="flex items-start gap-2.5 rounded-xl bg-sky-500/8 border border-sky-500/20 px-3 py-2.5 text-sm mt-1">
            <Info className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
            <p className="text-sky-300/80">
              Costo fijo: <span className="font-semibold text-sky-300">$20</span> â€” Al finalizar la inspecciÃ³n podrÃ¡s convertirla en un servicio correctivo o proyecto.
            </p>
          </div>
        )}

        {/* CotizaciÃ³n vinculada (solo proyecto) â€” compacta */}
        {tipoTicket === "proyecto" && (
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/8">
            <Link2 className="h-3.5 w-3.5 text-white/40 shrink-0" />
            <span className="text-xs text-white/50">CotizaciÃ³n vinculada:</span>
            {cotizacionVinculada ? (
              <>
                <span className="flex items-center gap-1 text-xs font-medium text-green-400">
                  <CheckCircle2 className="h-3 w-3" />
                  {cotizacionVinculada}
                </span>
                <button
                  type="button"
                  onClick={() => setCotizacionVinculada(null)}
                  className="ml-1 text-white/30 hover:text-white/60 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={abrirSelectorCotizacion}
                className="flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 transition-colors"
              >
                Ver aprobadas
                <ExternalLink className="h-3 w-3" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* â”€â”€ Datos del Cliente â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="form-section">
        <h3 className="form-section-title">Datos del Cliente</h3>

        {/* Client search */}
        <div className="mb-4" ref={searchRef}>
          {selectedCliente ? (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sm">
              <CheckCircle2 className="h-4 w-4 text-sky-400 shrink-0" />
              <span className="text-white font-medium truncate">
                {selectedCliente.empresa ?? selectedCliente.nombre}
              </span>
              <span className="text-white/40 text-xs truncate">â€” {selectedCliente.nombre}</span>
              <button
                type="button"
                onClick={clearCliente}
                className="ml-auto shrink-0 text-white/40 hover:text-white/70 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="relative">
              <div className="relative flex items-center">
                <Search className="absolute left-3 h-4 w-4 text-white/30 pointer-events-none" />
                <input
                  type="text"
                  value={clientQuery}
                  onChange={(e) => setClientQuery(e.target.value)}
                  placeholder="Buscar cliente existente..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-sky-500/50 focus:border-sky-500/40 transition-colors"
                />
                {searchLoading && (
                  <Loader2 className="absolute right-3 h-4 w-4 text-white/30 animate-spin" />
                )}
              </div>
              {showDropdown && clientResults.length > 0 && (
                <div className="absolute z-50 mt-1 w-full rounded-xl border border-white/15 bg-[#111827] shadow-xl overflow-hidden">
                  {clientResults.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => selectCliente(c)}
                      className="w-full text-left px-4 py-2.5 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                    >
                      <p className="text-sm font-medium text-white truncate">
                        {c.empresa ?? c.nombre}
                      </p>
                      {c.empresa && (
                        <p className="text-xs text-white/40 truncate">{c.nombre}</p>
                      )}
                    </button>
                  ))}
                  <Link
                    href="/dashboard/clientes"
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-xs text-sky-400 hover:bg-white/5 transition-colors"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Ir a Clientes para crear uno nuevo
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="form-row">
          <div className="form-group">
            <Label>Nombre del Cliente *</Label>
            <Input
              placeholder="Nombre completo"
              error={errors.cliente_nombre?.message}
              {...register("cliente_nombre")}
            />
          </div>
          <div className="form-group">
            <Label>Empresa</Label>
            <Input
              placeholder="Nombre de la empresa"
              error={errors.cliente_empresa?.message}
              {...register("cliente_empresa")}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <Label>Correo ElectrÃ³nico</Label>
            <Input
              type="email"
              placeholder="correo@ejemplo.com"
              error={errors.cliente_email?.message}
              {...register("cliente_email")}
            />
          </div>
          <div className="form-group">
            <Label>TelÃ©fono *</Label>
            <Input
              type="tel"
              placeholder="+58 412 123 4567"
              error={errors.cliente_telefono?.message}
              {...register("cliente_telefono")}
            />
          </div>
        </div>

        <div className="form-group">
          <Label>DirecciÃ³n *</Label>
          <Textarea
            placeholder="DirecciÃ³n completa del cliente"
            error={errors.cliente_direccion?.message}
            {...register("cliente_direccion")}
          />
        </div>
      </div>

      {/* â”€â”€ DescripciÃ³n del Trabajo â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="form-section">
        <h3 className="form-section-title">
          {tipoTicket === "inspeccion" ? "Motivo de la InspecciÃ³n" : "DescripciÃ³n del Trabajo"}
        </h3>
        <div className="form-group">
          <Label>Asunto *</Label>
          <Input
            placeholder={
              tipoTicket === "inspeccion"
                ? "Breve descripciÃ³n del motivo de la inspecciÃ³n"
                : "Breve descripciÃ³n del servicio"
            }
            error={errors.asunto?.message}
            {...register("asunto")}
          />
        </div>

        <div className="form-group">
          <Label>
            {tipoTicket === "inspeccion" ? "DescripciÃ³n de la InspecciÃ³n *" : "DescripciÃ³n Detallada *"}
          </Label>
          <Textarea
            placeholder={
              tipoTicket === "inspeccion"
                ? "Describe detalladamente los equipos o sistemas a inspeccionar"
                : "Describe detalladamente el trabajo a realizar"
            }
            className="min-h-[120px]"
            error={errors.descripcion?.message}
            {...register("descripcion")}
          />
        </div>

        <div className="form-group">
          <Label>Notas para el TÃ©cnico</Label>
          <Textarea
            placeholder="Indica condiciones del lugar, equipos, accesos necesarios..."
            className="min-h-[100px]"
            error={errors.requerimientos?.message}
            {...register("requerimientos")}
          />
          <p className="text-xs text-white/40 mt-1">
            InformaciÃ³n que el tÃ©cnico necesita saber antes de la visita
          </p>
        </div>
      </div>

      {/* â”€â”€ Materiales Planificados â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="form-section">
        <div className="flex items-center justify-between mb-4">
          <h3 className="form-section-title mb-0">Materiales Planificados</h3>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => { setShowCatalogSearch(!showCatalogSearch); setCatalogQuery("") }}
              className={showCatalogSearch ? "border-sky-500/40 text-sky-400" : ""}
            >
              <BookOpen className="h-3.5 w-3.5 mr-1.5" />
              Del catÃ¡logo
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={addMaterial}>
              <Plus className="h-4 w-4 mr-1" />
              Manual
            </Button>
          </div>
        </div>

        {/* Catalog search panel */}
        {showCatalogSearch && (
          <div className="mb-4 rounded-xl border border-sky-500/20 bg-sky-500/5 p-3 space-y-2">
            {/* Badge filters */}
            <div className="flex gap-1.5">
              {(["all", "equipos", "materiales"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setCatalogFilter(f)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                    catalogFilter === f
                      ? "bg-sky-500 text-white"
                      : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80"
                  }`}
                >
                  {f === "all" ? "Todos" : f === "equipos" ? "Equipos" : "Materiales"}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30 pointer-events-none" />
              <input
                type="text"
                value={catalogQuery}
                onChange={(e) => setCatalogQuery(e.target.value)}
                placeholder="Buscar por nombre, cÃ³digo o categorÃ­a..."
                autoFocus
                className="w-full pl-9 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-sky-500/50 transition-colors"
              />
            </div>
            <div className="max-h-52 overflow-y-auto space-y-0.5">
              {catalogFiltered.map((entry) => {
                const alreadyAdded = materials.some((m) => m.observacion === getCatalogIdentifier(entry))
                return (
                  <button
                    key={entry.code}
                    type="button"
                    onClick={() => addMaterialFromCatalog(entry)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex items-center gap-2">
                      {alreadyAdded && <CheckCircle2 className="h-3.5 w-3.5 text-green-400 shrink-0" />}
                      <div className="min-w-0">
                        <p className="text-sm text-white truncate">{entry.description}</p>
                        <p className="text-xs text-white/40">{entry.code} Â· {entry.category}</p>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-xs font-medium text-sky-400">${entry.unitPrice}</p>
                      <p className="text-xs text-white/30">{entry.unit}</p>
                    </div>
                  </button>
                )
              })}
              {catalogFiltered.length === 0 && (catalogQuery || catalogFilter !== "all") && (
                <p className="text-center py-4 text-sm text-white/40">
                  Sin resultados{catalogQuery ? ` para "${catalogQuery}"` : ""}
                </p>
              )}
            </div>
          </div>
        )}

        {materials.length === 0 && !showCatalogSearch ? (
          <p className="text-sm text-white/50 text-center py-4">
            Sin materiales. Usa &quot;Del catÃ¡logo&quot; para buscar o &quot;Manual&quot; para agregar libremente.
          </p>
        ) : materials.length > 0 ? (
          <div className="space-y-3">
            {materials.map((material) => (
              <div key={material.id} className="flex gap-3 items-start">
                <div className="flex-1">
                  <Input
                    placeholder="Nombre del material"
                    value={material.nombre}
                    onChange={(e) => updateMaterial(material.id, "nombre", e.target.value)}
                  />
                </div>
                <div className="w-24">
                  <Input
                    type="number"
                    min="1"
                    placeholder="Cant."
                    value={material.cantidad}
                    onChange={(e) => updateMaterial(material.id, "cantidad", parseInt(e.target.value) || 1)}
                  />
                </div>
                <div className="w-28">
                  <Input
                    placeholder="Unidad"
                    value={material.unidad}
                    onChange={(e) => updateMaterial(material.id, "unidad", e.target.value)}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeMaterial(material.id)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {/* â”€â”€ AsignaciÃ³n â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="form-section">
        <h3 className="form-section-title">AsignaciÃ³n</h3>
        <div className="form-group">
          <Label>TÃ©cnico Asignado</Label>
          <Select onValueChange={(value) => setValue("tecnico_id", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar tÃ©cnico (opcional)" />
            </SelectTrigger>
            <SelectContent>
              {technicians.length === 0 ? (
                <SelectItem value="" disabled>
                  No hay tÃ©cnicos disponibles
                </SelectItem>
              ) : (
                technicians.map((tech) => (
                  <SelectItem key={tech.id} value={tech.id}>
                    {tech.nombre} {tech.apellido}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <p className="text-xs text-white/50 mt-1">
            Puedes asignar el tÃ©cnico ahora o hacerlo despuÃ©s
          </p>
        </div>
      </div>

      {/* â”€â”€ Actions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creando...
            </>
          ) : (
            tipoTicket === "inspeccion" ? "Crear InspecciÃ³n" : "Crear Ticket"
          )}
        </Button>
      </div>
    </form>
  )
}

