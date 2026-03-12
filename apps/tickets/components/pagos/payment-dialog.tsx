"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Banknote,
  Building2,
  Check,
  Copy,
  CreditCard,
  Receipt,
  Smartphone,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { processPaymentAction } from "@/lib/actions/pagos"
import { formatCurrency } from "@/lib/utils"
import { cn } from "@/lib/utils"

const BANCOS_VE = [
  "100% Banco",
  "Bancamiga",
  "Bancaribe",
  "Banesco",
  "Banplus",
  "BDV (Banco de Venezuela)",
  "BBVA Provincial",
  "BFC Banco Fondo Comun",
  "Bicentenario",
  "BNC",
  "BOD",
  "Exterior",
  "Mercantil",
  "Mi Banco",
  "Sofitasa",
  "Venezolano de Credito",
]

type MetodoPago = "pago_movil" | "transferencia" | "efectivo" | "deposito"

const METHODS = [
  {
    value: "pago_movil" as MetodoPago,
    label: "Pago Movil",
    icon: Smartphone,
    activeClass: "border-sky-200 bg-sky-50 text-sky-700 shadow-[0_0_16px_rgba(14,165,233,0.08)]",
    inactiveClass: "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-700",
    dotClass: "bg-sky-500",
  },
  {
    value: "transferencia" as MetodoPago,
    label: "Transferencia",
    icon: Building2,
    activeClass: "border-violet-200 bg-violet-50 text-violet-700 shadow-[0_0_16px_rgba(139,92,246,0.08)]",
    inactiveClass: "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-700",
    dotClass: "bg-violet-500",
  },
  {
    value: "efectivo" as MetodoPago,
    label: "Efectivo",
    icon: Banknote,
    activeClass: "border-green-200 bg-green-50 text-green-700 shadow-[0_0_16px_rgba(34,197,94,0.08)]",
    inactiveClass: "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-700",
    dotClass: "bg-green-500",
  },
  {
    value: "deposito" as MetodoPago,
    label: "Deposito",
    icon: Receipt,
    activeClass: "border-amber-200 bg-amber-50 text-amber-700 shadow-[0_0_16px_rgba(245,158,11,0.08)]",
    inactiveClass: "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-700",
    dotClass: "bg-amber-500",
  },
] as const

function CopyBtn({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    if (!text.trim()) return
    navigator.clipboard.writeText(text)
    setCopied(true)
    if (label) {
      toast.success(`${label} copiado`, { duration: 1500 })
    }
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={!text.trim()}
      className={cn(
        "absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 transition-colors",
        "text-slate-300 hover:bg-slate-100 hover:text-slate-600",
        "disabled:pointer-events-none disabled:opacity-0"
      )}
      title="Copiar"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-green-600" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </button>
  )
}

function CopyInput({
  id,
  label,
  placeholder,
  value,
  onChange,
  required,
  type = "text",
}: {
  id: string
  label: string
  placeholder?: string
  value: string
  onChange: (v: string) => void
  required?: boolean
  type?: string
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs font-medium text-slate-600">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="pr-9"
        />
        <CopyBtn text={value} label={label} />
      </div>
    </div>
  )
}

function BancoSelect({
  id,
  label,
  value,
  onChange,
  required,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  required?: boolean
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs font-medium text-slate-600">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id}>
          <SelectValue placeholder="Seleccionar banco..." />
        </SelectTrigger>
        <SelectContent>
          {BANCOS_VE.map((bank) => (
            <SelectItem key={bank} value={bank}>
              {bank}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

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

export function PaymentDialog({ payment, open, onOpenChange }: PaymentDialogProps) {
  const router = useRouter()
  const [metodo, setMetodo] = useState<MetodoPago>("pago_movil")
  const [isLoading, setIsLoading] = useState(false)

  const [pmBanco, setPmBanco] = useState("")
  const [pmTelefono, setPmTelefono] = useState("")
  const [pmCedula, setPmCedula] = useState("")

  const [trBanco, setTrBanco] = useState("")
  const [trCuenta, setTrCuenta] = useState("")
  const [trTipo, setTrTipo] = useState<"corriente" | "ahorro" | "">("")
  const [trTitular, setTrTitular] = useState("")
  const [trCedula, setTrCedula] = useState("")

  const [depBanco, setDepBanco] = useState("")
  const [depReferencia, setDepReferencia] = useState("")

  const [observaciones, setObservaciones] = useState("")

  function resetForm() {
    setMetodo("pago_movil")
    setPmBanco("")
    setPmTelefono("")
    setPmCedula("")
    setTrBanco("")
    setTrCuenta("")
    setTrTipo("")
    setTrTitular("")
    setTrCedula("")
    setDepBanco("")
    setDepReferencia("")
    setObservaciones("")
  }

  function handleClose(nextOpen: boolean) {
    if (!nextOpen) {
      resetForm()
    }
    onOpenChange(nextOpen)
  }

  function isValid() {
    if (metodo === "pago_movil") return Boolean(pmBanco && pmTelefono && pmCedula)
    if (metodo === "transferencia") return Boolean(trBanco && trCuenta && trTitular && trCedula)
    if (metodo === "deposito") return Boolean(depBanco)
    return true
  }

  function buildReferencia() {
    if (metodo === "pago_movil") {
      return JSON.stringify({
        tipo: "pago_movil",
        banco: pmBanco,
        telefono: pmTelefono,
        cedula: pmCedula,
      })
    }

    if (metodo === "transferencia") {
      return JSON.stringify({
        tipo: "transferencia",
        banco: trBanco,
        numero_cuenta: trCuenta,
        tipo_cuenta: trTipo,
        titular: trTitular,
        cedula_rif: trCedula,
      })
    }

    if (metodo === "deposito") {
      return JSON.stringify({
        tipo: "deposito",
        banco: depBanco,
        referencia: depReferencia,
      })
    }

    return ""
  }

  async function handleSubmit() {
    if (!isValid()) {
      toast.error("Completa los campos obligatorios")
      return
    }

    setIsLoading(true)

    try {
      const result = await processPaymentAction(payment.id, {
        metodo_pago: metodo as "efectivo" | "transferencia" | "deposito" | "cheque",
        referencia_pago: buildReferencia(),
        observaciones: observaciones || undefined,
      })

      if (!result.success) {
        toast.error("Error al crear solicitud", {
          description: result.error,
        })
        return
      }

      toast.success("Solicitud de pago creada", {
        description: result.message,
      })
      handleClose(false)
      router.refresh()
    } finally {
      setIsLoading(false)
    }
  }

  const activeMethod = METHODS.find((method) => method.value === metodo)!

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="flex max-h-[90dvh] w-[calc(100vw-2rem)] max-w-md flex-col gap-0 overflow-hidden p-0">
        <div className="shrink-0 space-y-4 px-5 pb-0 pt-5">
          <DialogHeader className="space-y-0.5">
            <DialogTitle className="text-base text-slate-900">Crear Solicitud de Pago</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              {payment.tecnico.nombre} {payment.tecnico.apellido} · {payment.ticket.numero_ticket}
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5">
            <div>
              <p className="text-[11px] text-slate-500">Monto a cancelar</p>
              <p className="text-lg font-bold leading-tight text-slate-900">
                {formatCurrency(payment.monto_a_pagar)}
              </p>
            </div>
            <p className="max-w-[45%] truncate text-right text-xs text-slate-400">
              {payment.ticket.asunto}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
              Metodo de pago
            </p>
            <div className="grid grid-cols-4 gap-1.5">
              {METHODS.map((method) => {
                const Icon = method.icon
                const isActive = method.value === metodo

                return (
                  <button
                    key={method.value}
                    type="button"
                    onClick={() => setMetodo(method.value)}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-xl border px-1 py-2 text-[10px] font-semibold leading-tight transition-all",
                      isActive ? method.activeClass : method.inactiveClass
                    )}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <span className="w-full text-center">{method.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <div className={cn("h-1.5 w-1.5 shrink-0 rounded-full", activeMethod.dotClass)} />
            <span className="text-[11px] text-slate-400">Datos para {activeMethod.label}</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-5 py-3 scroll-smooth [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1">
          {metodo === "pago_movil" && (
            <div className="animate-fade-in space-y-3">
              <BancoSelect id="pm-banco" label="Banco" value={pmBanco} onChange={setPmBanco} required />
              <div className="grid grid-cols-2 gap-3">
                <CopyInput
                  id="pm-telefono"
                  label="Telefono"
                  placeholder="0414-0000000"
                  value={pmTelefono}
                  onChange={setPmTelefono}
                  required
                />
                <CopyInput
                  id="pm-cedula"
                  label="Cedula"
                  placeholder="V-00000000"
                  value={pmCedula}
                  onChange={setPmCedula}
                  required
                />
              </div>
            </div>
          )}

          {metodo === "transferencia" && (
            <div className="animate-fade-in space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <BancoSelect id="tr-banco" label="Banco" value={trBanco} onChange={setTrBanco} required />
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-600">
                    Tipo<span className="ml-0.5 text-red-500">*</span>
                  </Label>
                  <Select value={trTipo} onValueChange={(value) => setTrTipo(value as "corriente" | "ahorro")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tipo..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="corriente">Corriente</SelectItem>
                      <SelectItem value="ahorro">Ahorro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <CopyInput
                id="tr-cuenta"
                label="N° de cuenta"
                placeholder="0000-0000-00-0000000000"
                value={trCuenta}
                onChange={setTrCuenta}
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <CopyInput
                  id="tr-titular"
                  label="Titular"
                  placeholder="Nombre completo"
                  value={trTitular}
                  onChange={setTrTitular}
                  required
                />
                <CopyInput
                  id="tr-cedula"
                  label="Cedula / RIF"
                  placeholder="V-00000000"
                  value={trCedula}
                  onChange={setTrCedula}
                  required
                />
              </div>
            </div>
          )}

          {metodo === "efectivo" && (
            <div className="animate-fade-in flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
              <Banknote className="h-7 w-7 shrink-0 text-green-600/70" />
              <div>
                <p className="text-sm font-medium text-slate-800">Pago en efectivo</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Agrega observaciones si necesitas dejar registro
                </p>
              </div>
            </div>
          )}

          {metodo === "deposito" && (
            <div className="animate-fade-in space-y-3">
              <BancoSelect id="dep-banco" label="Banco" value={depBanco} onChange={setDepBanco} required />
              <CopyInput
                id="dep-referencia"
                label="N° de referencia (opcional)"
                placeholder="Referencia del deposito"
                value={depReferencia}
                onChange={setDepReferencia}
              />
            </div>
          )}

          <div className="space-y-1.5 pt-1">
            <Label htmlFor="obs" className="text-[11px] font-medium text-slate-500">
              Observaciones <span className="text-slate-400">(opcional)</span>
            </Label>
            <Textarea
              id="obs"
              placeholder="Notas para administracion..."
              value={observaciones}
              onChange={(event) => setObservaciones(event.target.value)}
              rows={2}
              className="resize-none text-sm"
            />
          </div>
        </div>

        <DialogFooter className="shrink-0 border-t border-slate-200 px-5 py-4 sm:justify-end">
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => handleClose(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button size="sm" onClick={handleSubmit} isLoading={isLoading} disabled={!isValid()}>
              <CreditCard className="h-4 w-4" />
              Crear Solicitud
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
