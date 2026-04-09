"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Plus, Trash2, Loader2, Search, X, CheckCircle2, ExternalLink, BookOpen, Link2, Info, UserPlus, FileText, Upload } from "lucide-react"
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { ticketCreateSchema, type TicketCreateInput } from "@/lib/validations"
import { createTicket } from "@/lib/actions/tickets"
import { uploadTicketDocumento } from "@/lib/actions/documentos"
import { createUser } from "@/lib/actions/usuarios"
import { generateId, formatDateTimeInputValue, parseDateTimeLocalToISO } from "@/lib/utils"
import { TICKET_CATALOG, type CatalogEntry } from "@/lib/catalog-data"
import { getCatalogIdentifier, getCatalogSegment } from "@/lib/catalog-rules"
import { TIPO_DOCUMENTO_LABELS, DOCUMENTO_TIPO_OPTIONS, DOCUMENTO_UPLOAD_CONFIG } from "@/types"
import type { MaterialItem, Cliente, ClienteContacto, TipoDocumento } from "@/types"

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
  initialClientes?: Cliente[]
  defaultTipo?: "servicio" | "proyecto" | "inspeccion"
}

type TicketSubmitPayload = TicketCreateInput & {
  estado?: "borrador"
  facturacion_tipo?: "fijo" | "por_hora"
  tarifa_hora?: number | null
}

export function CreateTicketForm({ technicians: initialTechnicians, initialClientes = [], defaultTipo = "servicio" }: CreateTicketFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [materials, setMaterials] = useState<MaterialItem[]>([])
  const [pendingDocumentos, setPendingDocumentos] = useState<
    Array<{ file: File; tipo: TipoDocumento; descripcion: string }>
  >([])

  // Technicians list (mutable for inline creation)
  const [technicians, setTechnicians] = useState(initialTechnicians)

  // Inline technician dialog
  const [showTechDialog, setShowTechDialog] = useState(false)
  const [techForm, setTechForm] = useState({ nombre: "", apellido: "", email: "", telefono: "", password: "" })
  const [techLoading, setTechLoading] = useState(false)
  const [techError, setTechError] = useState("")

  // Client search state
  const [clientQuery, setClientQuery] = useState("")
  const [clientResults, setClientResults] = useState<Cliente[]>([])
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null)
  const [selectedContacto, setSelectedContacto] = useState<ClienteContacto | null>(null)
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
    control,
    formState: { errors },
  } = useForm<TicketCreateInput>({
    resolver: zodResolver(ticketCreateSchema),
    defaultValues: {
      tipo: defaultTipo,
      prioridad: "media",
      origen: "email",
      monto_servicio: 0,
      tipo_mantenimiento: defaultTipo === "servicio" ? "correctivo" : undefined,
      agencia_bancaribe: "",
      cupones_bancaribe: undefined,
      fecha_servicio: "",
    },
  })

  const tipoTicket = watch("tipo")
  const origenTicket = watch("origen")
  const clienteEmpresa = watch("cliente_empresa")
  const isBancaribeTicket = (clienteEmpresa || selectedCliente?.empresa || "").toLowerCase().includes("bancaribe")

  // Reset monto when tipo changes
  useEffect(() => {
    setValue("monto_servicio", 0)
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

  // Search clients client-side from pre-loaded list
  useEffect(() => {
    if (!clientQuery || clientQuery.length < 2) {
      setClientResults([])
      setShowDropdown(false)
      return
    }
    const q = clientQuery.toLowerCase()
    const filtered = initialClientes
      .filter(
        (c) =>
          c.estado === "activo" &&
          (c.nombre.toLowerCase().includes(q) ||
            (c.apellido ?? "").toLowerCase().includes(q) ||
            (c.empresa ?? "").toLowerCase().includes(q) ||
            (c.rif_cedula ?? "").toLowerCase().includes(q) ||
            c.telefono.includes(q))
      )
      .slice(0, 8)
    setClientResults(filtered)
    setShowDropdown(true)
  }, [clientQuery, initialClientes])

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
      setValue("descripcion", `Proyecto basado en cotización ${data.code}.${data.notes ? " " + data.notes : ""}`)
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
      toast.success(`Cotización ${data.code} vinculada`, {
        description: `${allItems.length} materiales importados`,
      })
    }
    window.addEventListener("message", handler)
    return () => window.removeEventListener("message", handler)
  }, [setValue])

  function selectCliente(cliente: Cliente) {
    setSelectedCliente(cliente)
    setSelectedContacto(null)
    setShowDropdown(false)
    setClientQuery("")
    // If company with contacts, auto-fill with principal contact or first one
    const contactos = cliente.contactos ?? []
    const principal = contactos.find((c) => c.es_principal) ?? contactos[0]
    if (cliente.empresa && principal) {
      // Fill with contact data, empresa stays in empresa field
      setValue("cliente_nombre", `${principal.nombre}${principal.apellido ? " " + principal.apellido : ""}`)
      setValue("cliente_empresa", cliente.empresa)
      setValue("cliente_email", principal.email ?? "")
      setValue("cliente_telefono", principal.telefono)
      setValue("cliente_direccion", cliente.direccion)
      setSelectedContacto(principal)
    } else {
      const nombreCompleto = cliente.apellido
        ? `${cliente.nombre} ${cliente.apellido}`
        : cliente.nombre
      setValue("cliente_nombre", nombreCompleto)
      setValue("cliente_empresa", cliente.empresa ?? "")
      setValue("cliente_email", cliente.email ?? "")
      setValue("cliente_telefono", cliente.telefono)
      setValue("cliente_direccion", cliente.direccion)
    }
  }

  function selectContacto(contacto: ClienteContacto) {
    setSelectedContacto(contacto)
    setValue("cliente_nombre", `${contacto.nombre}${contacto.apellido ? " " + contacto.apellido : ""}`)
    setValue("cliente_email", contacto.email ?? "")
    setValue("cliente_telefono", contacto.telefono)
  }

  function clearCliente() {
    setSelectedCliente(null)
    setSelectedContacto(null)
    setClientQuery("")
    setValue("cliente_nombre", "")
    setValue("cliente_empresa", "")
    setValue("cliente_email", "")
    setValue("cliente_telefono", "")
    setValue("cliente_direccion", "")
  }

  async function handleCreateTechnician() {
    if (!techForm.nombre.trim()) { setTechError("El nombre es requerido"); return }
    const hasEmail = Boolean(techForm.email.trim())
    const hasPassword = Boolean(techForm.password.trim())
    if ((hasEmail && !hasPassword) || (!hasEmail && hasPassword)) {
      setTechError("Si vas a habilitar acceso, debes completar correo y contraseña")
      return
    }
    if (hasPassword && techForm.password.trim().length < 6) {
      setTechError("La contraseña debe tener al menos 6 caracteres")
      return
    }
    setTechLoading(true)
    setTechError("")
    try {
      const result = await createUser({
        nombre: techForm.nombre,
        apellido: techForm.apellido || undefined,
        email: techForm.email || undefined,
        telefono: techForm.telefono || "N/A",
        password: techForm.password || undefined,
        rol: "tecnico",
        cedula: undefined,
      })
      if (!result.success) {
        setTechError(result.error ?? "Error al crear técnico")
        return
      }
      const newTech = { id: result.data!.id, nombre: techForm.nombre, apellido: techForm.apellido }
      setTechnicians((prev) => [...prev, newTech])
      setValue("tecnico_id", newTech.id)
      setShowTechDialog(false)
      setTechForm({ nombre: "", apellido: "", email: "", telefono: "", password: "" })
      toast.success(
        hasEmail
          ? `Técnico ${techForm.nombre} creado y asignado`
          : `Perfil técnico ${techForm.nombre} creado y asignado sin acceso`
      )
    } catch {
      setTechError("Error inesperado")
    } finally {
      setTechLoading(false)
    }
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

  const onSubmit = async (data: TicketCreateInput, asBorrador = false) => {
    setIsSubmitting(true)
    try {
      const montoServicio = data.monto_servicio

      const submitData: TicketSubmitPayload = {
        ...data,
        materiales_planificados: materials.length > 0 ? materials : undefined,
        ...(data.tecnico_id ? { tecnico_id: data.tecnico_id } : {}),
        monto_servicio: montoServicio,
        agencia_bancaribe: isBancaribeTicket ? data.agencia_bancaribe || undefined : undefined,
        cupones_bancaribe: isBancaribeTicket ? data.cupones_bancaribe : undefined,
        fecha_servicio: parseDateTimeLocalToISO(data.fecha_servicio) || undefined,
        estado: asBorrador ? ("borrador" as const) : undefined,
        facturacion_tipo: tipoTicket === "servicio" ? facturacionTipo : "fijo",
        tarifa_hora: tipoTicket === "servicio" && facturacionTipo === "por_hora" ? tarifaHora : null,
      }

      const result = await createTicket(submitData)

      if (result.success && result.data) {
        // Upload pending documents now that we have the ticket ID
        if (pendingDocumentos.length > 0) {
          toast.loading("Subiendo documentos...", { id: "doc-upload" })
          let uploaded = 0
          for (const pending of pendingDocumentos) {
            const docResult = await uploadTicketDocumento(
              result.data.id,
              pending.file,
              pending.tipo,
              pending.descripcion || undefined
            )
            if (docResult.success) uploaded++
          }
          toast.dismiss("doc-upload")
          if (uploaded > 0) {
            toast.success(
              asBorrador ? "Borrador guardado" : "Ticket creado",
              { description: `${uploaded} documento${uploaded !== 1 ? "s" : ""} adjuntado${uploaded !== 1 ? "s" : ""}` }
            )
          } else {
            toast.success(asBorrador ? "Borrador guardado" : "Ticket creado", { description: result.message })
          }
        } else {
          toast.success(asBorrador ? "Borrador guardado" : "Ticket creado", { description: result.message })
        }
        router.push(`/dashboard/tickets/${result.data.id}`)
      } else if (result.success) {
        toast.success(asBorrador ? "Borrador guardado" : "Ticket creado", { description: result.message })
        router.push("/dashboard/tickets")
      } else {
        toast.error("Error", { description: result.error || "No se pudo crear el ticket" })
      }
    } catch {
      toast.error("Error", { description: "Ocurrió un error inesperado" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const [pendingBorrador, setBorrador] = useState(false)
  const pendingBorradorRef = useRef(false)

  // Facturacion tipo state (for servicio)
  const [facturacionTipo, setFacturacionTipo] = useState<"fijo" | "por_hora">("fijo")
  const [tarifaHora, setTarifaHora] = useState<number>(10)

  return (
    <form
      id="create-ticket-form"
      onSubmit={handleSubmit(
        (data) => onSubmit(data, pendingBorradorRef.current),
        (errs) => {
          const firstMsg = Object.values(errs).find((e) => e?.message)?.message
          toast.error("Formulario incompleto", { description: firstMsg ?? "Revisa los campos marcados en rojo" })
        }
      )}
      className="space-y-8"
    >

      {/* â"€â"€ Tipo y Origen â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */}
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
                <SelectItem value="servicio">Servicio</SelectItem>
                <SelectItem value="proyecto">Proyecto</SelectItem>
                <SelectItem value="inspeccion">Inspección</SelectItem>
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
                <SelectItem value="email">Correo electrónico</SelectItem>
                <SelectItem value="telefono">Llamada telefónica</SelectItem>
                <SelectItem value="carta_aceptacion">Carta de aceptación</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="form-group">
          <Label>Fecha y hora del servicio</Label>
          <Controller
            name="fecha_servicio"
            control={control}
            render={({ field }) => (
              <Input
                type="datetime-local"
                value={formatDateTimeInputValue(field.value)}
                onChange={(event) => field.onChange(event.target.value)}
                error={errors.fecha_servicio?.message}
              />
            )}
          />
          <p className="mt-1 text-xs text-slate-500">
            Esta fecha alimenta la vista calendario del pipeline y la programación operativa.
          </p>
        </div>

        {/* Número de carta condicional */}
        <div
          className="overflow-hidden transition-all duration-200"
          style={{ maxHeight: origenTicket === "carta_aceptacion" ? "80px" : "0px", opacity: origenTicket === "carta_aceptacion" ? 1 : 0 }}
        >
          <div className="form-group pt-1">
            <Label>Número de Carta</Label>
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

        {/* Toggle facturación para servicio */}
        {tipoTicket === "servicio" && (
          <div className="mt-1 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <span className="text-sm text-slate-600">Facturación:</span>
            <div className="flex gap-1 rounded-lg bg-white p-0.5 shadow-sm ring-1 ring-slate-200">
              <button
                type="button"
                onClick={() => { setFacturacionTipo("fijo"); setValue("monto_servicio", 0) }}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  facturacionTipo === "fijo"
                    ? "bg-sky-500 text-white shadow"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Fijo
              </button>
              <button
                type="button"
                onClick={() => { setFacturacionTipo("por_hora"); setValue("monto_servicio", 0) }}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  facturacionTipo === "por_hora"
                    ? "bg-sky-500 text-white shadow"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Por hora
              </button>
            </div>
            {facturacionTipo === "por_hora" && (
              <div className="flex items-center gap-2 ml-2">
                <span className="text-xs text-slate-500">Tarifa:</span>
                <div className="flex items-center gap-1">
                  <span className="text-slate-500 text-xs">$</span>
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    value={tarifaHora}
                    onChange={(e) => setTarifaHora(Number(e.target.value) || 10)}
                    className="w-16 rounded-md border border-slate-300 bg-white px-2 py-1 text-center text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-sky-500/50"
                  />
                  <span className="text-slate-500 text-xs">/hora</span>
                </div>
                <span className="ml-1 text-xs text-slate-400">(el monto final se calcula al cerrar)</span>
              </div>
            )}
          </div>
        )}

        {/* Info badge para inspección */}
        {tipoTicket === "inspeccion" && (
          <div className="flex items-start gap-2.5 rounded-xl bg-sky-500/8 border border-sky-500/20 px-3 py-2.5 text-sm mt-1">
            <Info className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
            <p className="text-sky-300/80">
              Costo fijo: <span className="font-semibold text-sky-300">$20</span> â€" Al finalizar la inspección podrás convertirla en un servicio correctivo o proyecto.
            </p>
          </div>
        )}

        {/* Cotización vinculada (solo proyecto) â€" compacta */}
        {tipoTicket === "proyecto" && (
          <div className="mt-2 flex items-center gap-2 border-t border-slate-200 pt-2">
            <Link2 className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <span className="text-xs text-slate-500">Cotización vinculada:</span>
            {cotizacionVinculada ? (
              <>
                <span className="flex items-center gap-1 text-xs font-medium text-green-400">
                  <CheckCircle2 className="h-3 w-3" />
                  {cotizacionVinculada}
                </span>
                <button
                  type="button"
                  onClick={() => setCotizacionVinculada(null)}
                  className="ml-1 text-slate-400 transition-colors hover:text-slate-700"
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

      {/* â"€â"€ Datos del Cliente â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */}
      <div className="form-section">
        <h3 className="form-section-title">Datos del Cliente</h3>

        {/* Client search */}
        <div className="mb-4" ref={searchRef}>
          {selectedCliente ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sm">
                <CheckCircle2 className="h-4 w-4 text-sky-400 shrink-0" />
                <span className="truncate font-medium text-slate-900">
                  {selectedCliente.empresa ?? selectedCliente.nombre}
                </span>
                {selectedCliente.empresa && (
                  <span className="text-slate-500 text-xs truncate">- {selectedCliente.nombre}</span>
                )}
                <button
                  type="button"
                  onClick={clearCliente}
                  className="ml-auto shrink-0 text-slate-400 transition-colors hover:text-slate-700"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              {/* Contact selector when empresa has multiple contacts */}
              {selectedCliente.empresa && (selectedCliente.contactos ?? []).length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs text-slate-500">¿Quién realiza el requerimiento?</p>
                  <div className="flex flex-wrap gap-2">
                    {(selectedCliente.contactos ?? []).map((ct) => (
                      <button
                        key={ct.id}
                        type="button"
                        onClick={() => selectContacto(ct)}
                        className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${
                          selectedContacto?.id === ct.id
                            ? "bg-sky-500/20 border-sky-500/50 text-sky-300"
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        {ct.nombre} {ct.apellido ?? ""}
                        {ct.cargo ? ` · ${ct.cargo}` : ""}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="relative">
              <div className="relative flex items-center">
                <Search className="pointer-events-none absolute left-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={clientQuery}
                  onChange={(e) => setClientQuery(e.target.value)}
                  placeholder="Buscar cliente existente..."
                  className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-4 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-sky-500/40 focus:outline-none focus:ring-1 focus:ring-sky-500/50"
                />
              </div>
              {showDropdown && (
                <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                  {clientResults.length > 0 ? (
                    clientResults.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => selectCliente(c)}
                        className="w-full border-b border-slate-100 px-4 py-2.5 text-left transition-colors hover:bg-slate-50 last:border-0"
                      >
                        <p className="truncate text-sm font-medium text-slate-900">
                          {c.empresa ?? `${c.nombre}${c.apellido ? " " + c.apellido : ""}`}
                        </p>
                        {c.empresa && (
                          <p className="text-xs text-slate-500 truncate">{c.nombre}{c.apellido ? ` ${c.apellido}` : ""}</p>
                        )}
                      </button>
                    ))
                  ) : (
                    <p className="px-4 py-3 text-sm text-slate-500">No se encontraron clientes</p>
                  )}
                  <Link
                    href="/dashboard/clientes"
                    className="flex w-full items-center gap-2 border-t border-slate-100 px-4 py-2.5 text-xs text-sky-500 transition-colors hover:bg-sky-50"
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
            <Label>Correo Electrónico</Label>
            <Input
              type="email"
              placeholder="correo@ejemplo.com"
              error={errors.cliente_email?.message}
              {...register("cliente_email")}
            />
          </div>
          <div className="form-group">
            <Label>Teléfono *</Label>
            <Input
              type="tel"
              placeholder="+58 412 123 4567"
              error={errors.cliente_telefono?.message}
              {...register("cliente_telefono")}
            />
          </div>
        </div>

        <div className="form-group">
          <Label>Dirección *</Label>
          <Textarea
            placeholder="Dirección completa del cliente"
            error={errors.cliente_direccion?.message}
            {...register("cliente_direccion")}
          />
        </div>
      </div>

      {/* â"€â"€ Descripción del Trabajo â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */}
      <div className="form-section">
        <h3 className="form-section-title">
          {tipoTicket === "inspeccion" ? "Motivo de la Inspección" : "Descripción del Trabajo"}
        </h3>
        <div className="form-group">
          <Label>Asunto *</Label>
          <Input
            placeholder={
              tipoTicket === "inspeccion"
                ? "Breve descripción del motivo de la inspección"
                : "Breve descripción del servicio"
            }
            error={errors.asunto?.message}
            {...register("asunto")}
          />
        </div>

        <div className="form-group">
          <Label>
            {tipoTicket === "inspeccion" ? "Descripción de la Inspección *" : "Descripción Detallada *"}
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
          <Label>Notas para el Técnico</Label>
          <Textarea
            placeholder="Indica condiciones del lugar, equipos, accesos necesarios..."
            className="min-h-[100px]"
            error={errors.requerimientos?.message}
            {...register("requerimientos")}
          />
          <p className="text-xs text-slate-500 mt-1">
            Información que el técnico necesita saber antes de la visita
          </p>
        </div>

        {isBancaribeTicket && (
          <div className="rounded-xl border border-sky-200 bg-sky-50/60 p-4">
            <h4 className="mb-3 text-sm font-semibold text-slate-900">Datos operativos Bancaribe</h4>
            <div className="form-row">
              <div className="form-group">
                <Label>Agencia Bancaribe</Label>
                <Input
                  placeholder="Ej: Agencia Chacao"
                  error={errors.agencia_bancaribe?.message}
                  {...register("agencia_bancaribe")}
                />
              </div>
              <div className="form-group">
                <Label>Cupones usados</Label>
                <Controller
                  name="cupones_bancaribe"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      value={field.value ?? ""}
                      onChange={(event) => field.onChange(event.target.value === "" ? undefined : Number(event.target.value))}
                      error={errors.cupones_bancaribe?.message}
                    />
                  )}
                />
              </div>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Estos datos alimentarán reportes mensuales por agencia y total de cupones consumidos.
            </p>
          </div>
        )}
      </div>

      {/* â"€â"€ Materiales Planificados â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */}
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
              Del catálogo
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
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  {f === "all" ? "Todos" : f === "equipos" ? "Equipos" : "Materiales"}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={catalogQuery}
                onChange={(e) => setCatalogQuery(e.target.value)}
                placeholder="Buscar por nombre, código o categoría..."
                autoFocus
                className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-4 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-1 focus:ring-sky-500/50"
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
                    className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-white/70"
                  >
                    <div className="min-w-0 flex items-center gap-2">
                      {alreadyAdded && <CheckCircle2 className="h-3.5 w-3.5 text-green-400 shrink-0" />}
                      <div className="min-w-0">
                        <p className="truncate text-sm text-slate-900">{entry.description}</p>
                        <p className="text-xs text-slate-500">{entry.code} Â· {entry.category}</p>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-xs font-medium text-sky-400">${entry.unitPrice}</p>
                      <p className="text-xs text-slate-500">{entry.unit}</p>
                    </div>
                  </button>
                )
              })}
              {catalogFiltered.length === 0 && (catalogQuery || catalogFilter !== "all") && (
                <p className="py-4 text-center text-sm text-slate-500">
                  Sin resultados{catalogQuery ? ` para "${catalogQuery}"` : ""}
                </p>
              )}
            </div>
          </div>
        )}

        {materials.length === 0 && !showCatalogSearch ? (
          <p className="py-4 text-center text-sm text-slate-500">
            Sin materiales. Usa &quot;Del catálogo&quot; para buscar o &quot;Manual&quot; para agregar libremente.
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

      {/* ── Asignación ─────────────────────────────────────────────────── */}
      <div className="form-section">
        <h3 className="form-section-title">Asignación</h3>
        <div className="form-group">
          <div className="flex items-center justify-between mb-1.5">
            <Label>Técnico principal asignado *</Label>
            <button
              type="button"
              onClick={() => setShowTechDialog(true)}
              className="flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 transition-colors"
            >
              <UserPlus className="h-3.5 w-3.5" />
              Nuevo técnico
            </button>
          </div>
          <Controller
            name="tecnico_id"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value ?? ""}>
                <SelectTrigger error={errors.tecnico_id?.message}>
                  <SelectValue placeholder="Seleccionar técnico..." />
                </SelectTrigger>
                <SelectContent>
                  {technicians.map((tech) => (
                    <SelectItem key={tech.id} value={tech.id}>
                      {tech.nombre} {tech.apellido}
                    </SelectItem>
                  ))}
                  {technicians.length === 0 && (
                    <div className="px-3 py-2 text-sm text-slate-400">No hay técnicos disponibles</div>
                  )}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      {/* ── Documentos y Planos ────────────────────────────────────────── */}
      {tipoTicket !== "inspeccion" && (
        <div className="form-section">
          <h3 className="form-section-title flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documentos y Planos
            <span className="text-xs font-normal text-slate-400">(opcional)</span>
          </h3>
          <p className="mb-3 text-xs text-slate-500">
            Adjunta comprobantes, planos, notas de entrega, cartas de aceptación, órdenes de compra o cualquier archivo relevante al {tipoTicket === "proyecto" ? "proyecto" : "servicio"}.
            Los documentos se cargarán al crear el ticket y podrás clasificarlos según el tipo correspondiente.
          </p>

          {/* File picker row */}
          <div className="space-y-2">
            <label
              htmlFor="form-doc-upload"
              className="flex h-28 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 transition-colors hover:border-sky-400 hover:bg-sky-50/70"
            >
              <Upload className="mb-1.5 h-6 w-6 text-slate-400" />
              <p className="text-sm text-slate-600">
                <span className="font-medium">Seleccionar archivos</span>
              </p>
              <p className="text-xs text-slate-400 mt-0.5">PDF, Word, Excel, imágenes — máx. 25 MB c/u</p>
              <input
                id="form-doc-upload"
                type="file"
                multiple
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp"
                onChange={(e) => {
                  const files = Array.from(e.target.files ?? [])
                  const valid = files.filter((f) => {
                    const ext = f.name.split(".").pop()?.toLowerCase() ?? ""
                    return (
                      (DOCUMENTO_UPLOAD_CONFIG.allowedTypes.includes(f.type) ||
                        (DOCUMENTO_UPLOAD_CONFIG.allowedExtensions as readonly string[]).includes(ext)) &&
                      f.size <= DOCUMENTO_UPLOAD_CONFIG.maxSizeBytes
                    )
                  })
                  setPendingDocumentos((prev) => [
                    ...prev,
                    ...valid.map((file) => ({ file, tipo: "comprobante_servicio" as TipoDocumento, descripcion: "" })),
                  ])
                  // Reset input so the same file can be added again
                  e.target.value = ""
                }}
              />
            </label>

            {/* Pending documents list */}
            {pendingDocumentos.length > 0 && (
              <div className="space-y-2 mt-2">
                {pendingDocumentos.map((pending, idx) => (
                  <div key={idx} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-2">
                    <FileText className="h-4 w-4 shrink-0 text-slate-400" />
                    <p className="min-w-0 flex-1 truncate text-sm text-slate-700">{pending.file.name}</p>
                    <select
                      className="shrink-0 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-sky-500"
                      value={pending.tipo}
                      onChange={(e) => {
                        setPendingDocumentos((prev) =>
                          prev.map((p, i) => i === idx ? { ...p, tipo: e.target.value as TipoDocumento } : p)
                        )
                      }}
                    >
                      {DOCUMENTO_TIPO_OPTIONS.map((key) => (
                        <option key={key} value={key}>{TIPO_DOCUMENTO_LABELS[key]}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="shrink-0 rounded-md p-1 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                      onClick={() => setPendingDocumentos((prev) => prev.filter((_, i) => i !== idx))}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Actions ──────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="outline"
          disabled={isSubmitting}
          onClick={() => { pendingBorradorRef.current = true; setBorrador(true) }}
          className="border-slate-300 text-slate-700 hover:bg-slate-100"
        >
          {isSubmitting && pendingBorrador ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Guardando...</>
          ) : (
            "Guardar borrador"
          )}
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          onClick={() => { pendingBorradorRef.current = false; setBorrador(false) }}
        >
          {isSubmitting && !pendingBorrador ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creando...
            </>
          ) : (
            tipoTicket === "inspeccion" ? "Crear Inspección" : "Crear Ticket"
          )}
        </Button>
      </div>

      {/* ── Dialog: Nuevo Técnico ──────────────────────────────────────── */}
      <Dialog open={showTechDialog} onOpenChange={setShowTechDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nuevo Técnico</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Nombre *</Label>
                <Input
                  className="h-8 text-sm"
                  placeholder="Carlos"
                  value={techForm.nombre}
                  onChange={(e) => setTechForm({ ...techForm, nombre: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Apellido</Label>
                <Input
                  className="h-8 text-sm"
                  placeholder="Pérez"
                  value={techForm.apellido}
                  onChange={(e) => setTechForm({ ...techForm, apellido: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Email</Label>
              <Input
                className="h-8 text-sm"
                type="email"
                placeholder="tecnico@empresa.com"
                value={techForm.email}
                onChange={(e) => setTechForm({ ...techForm, email: e.target.value })}
              />
              <p className="text-[11px] text-slate-500">
                Opcional. Si lo dejas vacío, se crea solo el perfil sin acceso.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Teléfono</Label>
              <Input
                className="h-8 text-sm"
                placeholder="+58 412 000 0000"
                value={techForm.telefono}
                onChange={(e) => setTechForm({ ...techForm, telefono: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Contraseña temporal</Label>
              <Input
                className="h-8 text-sm"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={techForm.password}
                onChange={(e) => setTechForm({ ...techForm, password: e.target.value })}
              />
              <p className="text-[11px] text-slate-500">
                Opcional. Solo colócala si también vas a registrar el correo ahora.
              </p>
            </div>
            {techError && <p className="text-xs text-red-400">{techError}</p>}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => { setShowTechDialog(false); setTechError("") }}
              disabled={techLoading}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleCreateTechnician}
              disabled={techLoading}
            >
              {techLoading ? <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Creando...</> : "Crear técnico"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  )
}
