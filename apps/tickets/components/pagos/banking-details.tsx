"use client"

import { useState } from "react"
import { Copy, Check, Smartphone, Building2, Banknote, Receipt } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

// ── Types ─────────────────────────────────────────────────────────────────────
type PagoMovilData  = { tipo: "pago_movil";   banco: string; telefono: string; cedula: string }
type TransfData     = { tipo: "transferencia"; banco: string; numero_cuenta: string; tipo_cuenta: string; titular: string; cedula_rif: string }
type DepositoData   = { tipo: "deposito";      banco: string; referencia?: string }

type BankingData = PagoMovilData | TransfData | DepositoData

export function parseBankingDetails(referencia_pago: string | null): BankingData | null {
  if (!referencia_pago) return null
  try {
    const parsed = JSON.parse(referencia_pago)
    if (parsed && typeof parsed === "object" && parsed.tipo) return parsed as BankingData
  } catch { /* not JSON, plain string */ }
  return null
}

// ── Copy chip ─────────────────────────────────────────────────────────────────
function CopyChip({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(value)
    setCopied(true)
    toast.success(`${label} copiado`, { duration: 1200 })
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button
      onClick={handleCopy}
      className={cn(
        "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs transition-all duration-100",
        "bg-white/[0.04] border border-white/10 hover:bg-white/10 hover:border-white/20",
        "text-white/70 hover:text-white group"
      )}
    >
      <span className="text-white/40 shrink-0">{label}:</span>
      <span className="font-mono font-medium truncate max-w-[120px]">{value}</span>
      {copied
        ? <Check className="h-3 w-3 text-green-400 shrink-0" />
        : <Copy className="h-3 w-3 text-white/25 group-hover:text-white/60 shrink-0" />}
    </button>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
interface BankingDetailsProps {
  referencia_pago: string | null
  metodo_pago?: string | null
}

const METHOD_META: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  pago_movil:    { icon: Smartphone, label: "Pago Móvil",    color: "text-sky-400" },
  transferencia: { icon: Building2,  label: "Transferencia", color: "text-purple-400" },
  efectivo:      { icon: Banknote,   label: "Efectivo",      color: "text-green-400" },
  deposito:      { icon: Receipt,    label: "Depósito",      color: "text-yellow-400" },
}

export function BankingDetails({ referencia_pago, metodo_pago }: BankingDetailsProps) {
  const data = parseBankingDetails(referencia_pago)
  const meta = METHOD_META[metodo_pago ?? ""] ?? METHOD_META[data?.tipo ?? ""] ?? null

  if (!data && metodo_pago === "efectivo") {
    return (
      <div className="flex items-center gap-1.5 text-xs text-green-400/80">
        <Banknote className="h-3.5 w-3.5" />
        Efectivo
      </div>
    )
  }

  if (!data) return null

  const Icon = meta?.icon ?? Copy

  return (
    <div className="mt-2 space-y-1.5">
      {/* Method badge */}
      {meta && (
        <div className={cn("flex items-center gap-1.5 text-xs font-medium", meta.color)}>
          <Icon className="h-3.5 w-3.5" />
          {meta.label}
        </div>
      )}

      {/* Copy chips per field */}
      <div className="flex flex-wrap gap-1.5">
        {data.tipo === "pago_movil" && (
          <>
            <CopyChip label="Banco"    value={(data as PagoMovilData).banco} />
            <CopyChip label="Teléfono" value={(data as PagoMovilData).telefono} />
            <CopyChip label="Cédula"   value={(data as PagoMovilData).cedula} />
          </>
        )}
        {data.tipo === "transferencia" && (
          <>
            <CopyChip label="Banco"   value={(data as TransfData).banco} />
            <CopyChip label="Cuenta"  value={(data as TransfData).numero_cuenta} />
            {(data as TransfData).tipo_cuenta && (
              <CopyChip label="Tipo" value={(data as TransfData).tipo_cuenta} />
            )}
            <CopyChip label="Titular" value={(data as TransfData).titular} />
            <CopyChip label="Cédula"  value={(data as TransfData).cedula_rif} />
          </>
        )}
        {data.tipo === "deposito" && (
          <>
            <CopyChip label="Banco" value={(data as DepositoData).banco} />
            {(data as DepositoData).referencia && (
              <CopyChip label="Ref." value={(data as DepositoData).referencia!} />
            )}
          </>
        )}
      </div>
    </div>
  )
}
