"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Smartphone, Building2, Banknote, Receipt,
  Copy, Check, CreditCard,
} from "lucide-react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { processPaymentAction } from "@/lib/actions/pagos"
import { formatCurrency } from "@/lib/utils"
import { cn } from "@/lib/utils"

// ── Bancos venezolanos ────────────────────────────────────────────────────────
const BANCOS_VE = [
  "100% Banco", "Bancamiga", "Bancaribe", "Banesco", "Banplus",
  "BDV (Banco de Venezuela)", "BBVA Provincial", "BFC Banco Fondo Común",
  "Bicentenario", "BNC", "BOD", "Exterior",
  "Mercantil", "Mi Banco", "Sofitasa", "Venezolano de Crédito",
]

// ── Métodos de pago ───────────────────────────────────────────────────────────
type MetodoPago = "pago_movil" | "transferencia" | "efectivo" | "deposito"

const METHODS = [
  {
    value: "pago_movil" as MetodoPago,
    label: "Pago Móvil",
    icon: Smartphone,
    activeClass: "border-sky-500/50 bg-sky-500/15 text-sky-300 shadow-[0_0_16px_rgba(14,165,233,0.15)]",
    inactiveClass: "border-white/10 bg-white/5 text-white/50 hover:border-white/20 hover:text-white/70",
    dotClass: "bg-sky-400",
  },
  {
    value: "transferencia" as MetodoPago,
    label: "Transferencia",
    icon: Building2,
    activeClass: "border-purple-500/50 bg-purple-500/15 text-purple-300 shadow-[0_0_16px_rgba(168,85,247,0.15)]",
    inactiveClass: "border-white/10 bg-white/5 text-white/50 hover:border-white/20 hover:text-white/70",
    dotClass: "bg-purple-400",
  },
  {
    value: "efectivo" as MetodoPago,
    label: "Efectivo",
    icon: Banknote,
    activeClass: "border-green-500/50 bg-green-500/15 text-green-300 shadow-[0_0_16px_rgba(34,197,94,0.15)]",
    inactiveClass: "border-white/10 bg-white/5 text-white/50 hover:border-white/20 hover:text-white/70",
    dotClass: "bg-green-400",
  },
  {
    value: "deposito" as MetodoPago,
    label: "Depósito",
    icon: Receipt,
    activeClass: "border-yellow-500/50 bg-yellow-500/15 text-yellow-300 shadow-[0_0_16px_rgba(234,179,8,0.15)]",
    inactiveClass: "border-white/10 bg-white/5 text-white/50 hover:border-white/20 hover:text-white/70",
    dotClass: "bg-yellow-400",
  },
] as const

// ── Copy button ───────────────────────────────────────────────────────────────
function CopyBtn({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    if (!text.trim()) return
    navigator.clipboard.writeText(text)
    setCopied(true)
    if (label) toast.success(`${label} copiado`, { duration: 1500 })
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={!text.trim()}
      className={cn(
        "absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 transition-all duration-100",
        "text-white/25 hover:text-white/70 hover:bg-white/10",
        "disabled:pointer-events-none disabled:opacity-0"
      )}
      title="Copiar"
    >
      {copied
        ? <Check className="h-3.5 w-3.5 text-green-400" />
        : <Copy className="h-3.5 w-3.5" />}
    </button>
  )
}

// ── Copyable input ────────────────────────────────────────────────────────────
function CopyInput({
  id, label, placeholder, value, onChange, required, type = "text",
}: {
  id: string; label: string; placeholder?: string; value: string
  onChange: (v: string) => void; required?: boolean; type?: string
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-white/70 text-xs font-medium">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pr-9"
        />
        <CopyBtn text={value} label={label} />
      </div>
    </div>
  )
}

// ── Banco select ──────────────────────────────────────────────────────────────
function BancoSelect({
  id, label, value, onChange, required,
}: {
  id: string; label: string; value: string; onChange: (v: string) => void; required?: boolean
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-white/70 text-xs font-medium">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Seleccionar banco…" />
        </SelectTrigger>
        <SelectContent>
          {BANCOS_VE.map((b) => (
            <SelectItem key={b} value={b}>{b}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface PaymentDialogProps {
  payment: {
    id: string
    monto_a_pagar: number
    tecnico: { nombre: string; apellido: string }
    ticket: { numero_ticket: string; asunto: string }
  }
  open: boolean
  onOpenChange: (open: boolean) => void
}

// ── Component ─────────────────────────────────────────────────────────────────
export function PaymentDialog({ payment, open, onOpenChange }: PaymentDialogProps) {
  const router = useRouter()
  const [metodo, setMetodo] = useState<MetodoPago>("pago_movil")
  const [isLoading, setIsLoading] = useState(false)

  // Pago Móvil fields
  const [pmBanco, setPmBanco] = useState("")
  const [pmTelefono, setPmTelefono] = useState("")
  const [pmCedula, setPmCedula] = useState("")

  // Transferencia fields
  const [trBanco, setTrBanco] = useState("")
  const [trCuenta, setTrCuenta] = useState("")
  const [trTipo, setTrTipo] = useState<"corriente" | "ahorro" | "">("")
  const [trTitular, setTrTitular] = useState("")
  const [trCedula, setTrCedula] = useState("")

  // Depósito fields
  const [depBanco, setDepBanco] = useState("")
  const [depReferencia, setDepReferencia] = useState("")

  // Shared
  const [observaciones, setObservaciones] = useState("")

  function resetForm() {
    setMetodo("pago_movil")
    setPmBanco(""); setPmTelefono(""); setPmCedula("")
    setTrBanco(""); setTrCuenta(""); setTrTipo(""); setTrTitular(""); setTrCedula("")
    setDepBanco(""); setDepReferencia("")
    setObservaciones("")
  }

  function handleClose(v: boolean) {
    if (!v) resetForm()
    onOpenChange(v)
  }

  function isValid() {
    if (metodo === "pago_movil") return !!(pmBanco && pmTelefono && pmCedula)
    if (metodo === "transferencia") return !!(trBanco && trCuenta && trTitular && trCedula)
    if (metodo === "deposito") return !!depBanco
    return true // efectivo
  }

  function buildReferencia(): string {
    if (metodo === "pago_movil") {
      return JSON.stringify({ tipo: "pago_movil", banco: pmBanco, telefono: pmTelefono, cedula: pmCedula })
    }
    if (metodo === "transferencia") {
      return JSON.stringify({ tipo: "transferencia", banco: trBanco, numero_cuenta: trCuenta, tipo_cuenta: trTipo, titular: trTitular, cedula_rif: trCedula })
    }
    if (metodo === "deposito") {
      return JSON.stringify({ tipo: "deposito", banco: depBanco, referencia: depReferencia })
    }
    return ""
  }

  async function handleSubmit() {
    if (!isValid()) { toast.error("Completa los campos obligatorios"); return }
    setIsLoading(true)
    try {
      const result = await processPaymentAction(payment.id, {
        metodo_pago: metodo as "efectivo" | "transferencia" | "deposito" | "cheque",
        referencia_pago: buildReferencia(),
        observaciones: observaciones || undefined,
      })
      if (result.success) {
        toast.success("Solicitud de pago creada", { description: result.message })
        handleClose(false)
        router.refresh()
      } else {
        toast.error("Error al crear solicitud", { description: result.error })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const activeMethod = METHODS.find((m) => m.value === metodo)!

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      {/*
        Layout: flex-col + max-h-[90dvh]
        ├── header  — fijo (título + monto + selector)
        ├── body    — flex-1 overflow-y-auto (campos dinámicos + observaciones)
        └── footer  — fijo (botones)
      */}
      <DialogContent className="max-w-md w-[calc(100vw-2rem)] p-0 gap-0 flex flex-col max-h-[90dvh] overflow-hidden">

        {/* ── Header fijo ─────────────────────────────────── */}
        <div className="px-5 pt-5 pb-0 shrink-0 space-y-4">
          <DialogHeader className="space-y-0.5">
            <DialogTitle className="text-base">Crear Solicitud de Pago</DialogTitle>
            <DialogDescription className="text-xs text-white/40">
              {payment.tecnico.nombre} {payment.tecnico.apellido} · {payment.ticket.numero_ticket}
            </DialogDescription>
          </DialogHeader>

          {/* Monto — fila compacta */}
          <div className="flex items-center justify-between rounded-xl bg-white/[0.04] border border-white/10 px-4 py-2.5">
            <div>
              <p className="text-[11px] text-white/40">Monto a cancelar</p>
              <p className="text-lg font-bold text-white leading-tight">
                {formatCurrency(payment.monto_a_pagar)}
              </p>
            </div>
            <p className="text-xs text-white/30 truncate max-w-[45%] text-right">
              {payment.ticket.asunto}
            </p>
          </div>

          {/* Selector de método */}
          <div className="space-y-2">
            <p className="text-[11px] text-white/40 font-medium uppercase tracking-wide">Método de pago</p>
            <div className="grid grid-cols-4 gap-1.5">
              {METHODS.map((m) => {
                const Icon = m.icon
                const isActive = metodo === m.value
                return (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setMetodo(m.value)}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-xl border py-2 px-1 text-[10px] font-semibold transition-all duration-150 leading-tight",
                      isActive ? m.activeClass : m.inactiveClass
                    )}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <span className="text-center w-full">{m.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Divisor */}
          <div className="flex items-center gap-2 pt-1">
            <div className={cn("h-1.5 w-1.5 rounded-full shrink-0", activeMethod.dotClass)} />
            <span className="text-[11px] text-white/35">Datos para {activeMethod.label}</span>
            <div className="flex-1 h-px bg-white/[0.07]" />
          </div>
        </div>

        {/* ── Body scrollable ──────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3 scroll-smooth
          [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent
          [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">

          {/* Pago Móvil */}
          {metodo === "pago_movil" && (
            <div className="space-y-3 animate-fade-in">
              <BancoSelect id="pm-banco" label="Banco" value={pmBanco} onChange={setPmBanco} required />
              <div className="grid grid-cols-2 gap-3">
                <CopyInput
                  id="pm-telefono" label="Teléfono" placeholder="0414-0000000"
                  value={pmTelefono} onChange={setPmTelefono} required
                />
                <CopyInput
                  id="pm-cedula" label="Cédula" placeholder="V-00000000"
                  value={pmCedula} onChange={setPmCedula} required
                />
              </div>
            </div>
          )}

          {/* Transferencia */}
          {metodo === "transferencia" && (
            <div className="space-y-3 animate-fade-in">
              <div className="grid grid-cols-2 gap-3">
                <BancoSelect id="tr-banco" label="Banco" value={trBanco} onChange={setTrBanco} required />
                <div className="space-y-1.5">
                  <Label className="text-white/70 text-xs font-medium">
                    Tipo<span className="text-red-400 ml-0.5">*</span>
                  </Label>
                  <Select value={trTipo} onValueChange={(v) => setTrTipo(v as "corriente" | "ahorro")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tipo…" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="corriente">Corriente</SelectItem>
                      <SelectItem value="ahorro">Ahorro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <CopyInput
                id="tr-cuenta" label="N° de cuenta" placeholder="0000-0000-00-0000000000"
                value={trCuenta} onChange={setTrCuenta} required
              />
              <div className="grid grid-cols-2 gap-3">
                <CopyInput
                  id="tr-titular" label="Titular" placeholder="Nombre completo"
                  value={trTitular} onChange={setTrTitular} required
                />
                <CopyInput
                  id="tr-cedula" label="Cédula / RIF" placeholder="V-00000000"
                  value={trCedula} onChange={setTrCedula} required
                />
              </div>
            </div>
          )}

          {/* Efectivo */}
          {metodo === "efectivo" && (
            <div className="animate-fade-in flex items-center gap-3 rounded-xl border border-green-500/15 bg-green-500/[0.06] px-4 py-3">
              <Banknote className="h-7 w-7 shrink-0 text-green-400/60" />
              <div>
                <p className="text-sm font-medium text-white/70">Pago en efectivo</p>
                <p className="text-xs text-white/30 mt-0.5">Agrega observaciones si necesitas dejar registro</p>
              </div>
            </div>
          )}

          {/* Depósito */}
          {metodo === "deposito" && (
            <div className="space-y-3 animate-fade-in">
              <BancoSelect id="dep-banco" label="Banco" value={depBanco} onChange={setDepBanco} required />
              <CopyInput
                id="dep-referencia" label="N° de referencia (opcional)"
                placeholder="Referencia del depósito"
                value={depReferencia} onChange={setDepReferencia}
              />
            </div>
          )}

          {/* Observaciones */}
          <div className="space-y-1.5 pt-1">
            <Label htmlFor="obs" className="text-white/50 text-[11px] font-medium">
              Observaciones <span className="text-white/25">(opcional)</span>
            </Label>
            <Textarea
              id="obs"
              placeholder="Notas para administración…"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              rows={2}
              className="resize-none text-sm"
            />
          </div>
        </div>

        {/* ── Footer fijo ──────────────────────────────────── */}
        <div className="px-5 py-4 border-t border-white/[0.07] shrink-0">
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" size="sm" onClick={() => handleClose(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button size="sm" onClick={handleSubmit} isLoading={isLoading} disabled={!isValid()}>
              <CreditCard className="h-4 w-4" />
              Crear Solicitud
            </Button>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  )
}
