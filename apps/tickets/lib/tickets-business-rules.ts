import type { Ticket, TicketCreateInput, TicketUpdateInput } from "@/types"
import { DEFAULT_INSPECTION_AMOUNT, DEFAULT_SERVICE_AMOUNT } from "@/types"

const BIGOTT_KEYWORD = "bigott"

function normalizeClientText(value?: string | null): string {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
}

export function isBigottClient(clienteEmpresa?: string | null, clienteNombre?: string | null): boolean {
  const empresa = normalizeClientText(clienteEmpresa)
  const nombre = normalizeClientText(clienteNombre)
  return empresa.includes(BIGOTT_KEYWORD) || nombre.includes(BIGOTT_KEYWORD)
}

export function shouldAllowWorkedTime(ticketLike: {
  tipo?: string | null
  cliente_empresa?: string | null
  cliente_nombre?: string | null
}): boolean {
  return ticketLike.tipo === "servicio" && isBigottClient(ticketLike.cliente_empresa, ticketLike.cliente_nombre)
}

export function prependAgencyToDescription(descripcion: string, agencia?: string | null): string {
  const agenciaLimpia = (agencia ?? "").trim()
  const descripcionLimpia = (descripcion ?? "").trim()

  if (!agenciaLimpia) return descripcionLimpia

  const firstLine = `Sede / Agencia: ${agenciaLimpia}`
  const lines = descripcionLimpia.split(/\r?\n/).map((line) => line.trim())
  const agencyLineRegex = /^sede\s*\/\s*agencia\s*:/i

  if (lines[0] && agencyLineRegex.test(lines[0])) {
    lines[0] = firstLine
    return lines.filter(Boolean).join("\n")
  }

  const cleanedLines = lines.filter((line) => line && !agencyLineRegex.test(line))
  if (!cleanedLines.length) return firstLine

  return `${firstLine}\n\n${cleanedLines.join("\n")}`
}

export function enforceCreateBillingRules(input: TicketCreateInput): Pick<TicketCreateInput, "monto_servicio" | "facturacion_tipo" | "tarifa_hora"> {
  if (input.tipo === "inspeccion") {
    return { monto_servicio: DEFAULT_INSPECTION_AMOUNT, facturacion_tipo: "fijo", tarifa_hora: null }
  }

  if (input.tipo !== "servicio") {
    return {
      monto_servicio: input.monto_servicio ?? 0,
      facturacion_tipo: "fijo",
      tarifa_hora: null,
    }
  }

  const canUseHourly = isBigottClient(input.cliente_empresa, input.cliente_nombre) && input.facturacion_tipo === "por_hora"

  return {
    monto_servicio: canUseHourly ? (input.monto_servicio ?? DEFAULT_SERVICE_AMOUNT) : DEFAULT_SERVICE_AMOUNT,
    facturacion_tipo: canUseHourly ? "por_hora" : "fijo",
    tarifa_hora: canUseHourly ? (input.tarifa_hora ?? 10) : null,
  }
}

export function enforceUpdateBillingRules(
  currentTicket: Ticket,
  input: TicketUpdateInput
): Pick<TicketUpdateInput, "monto_servicio"> {
  if (currentTicket.tipo !== "servicio") {
    return { monto_servicio: input.monto_servicio }
  }

  const nextEmpresa = input.cliente_empresa ?? currentTicket.cliente_empresa
  const nextNombre = input.cliente_nombre ?? currentTicket.cliente_nombre
  const isBigott = isBigottClient(nextEmpresa, nextNombre)

  if (!isBigott) {
    return { monto_servicio: DEFAULT_SERVICE_AMOUNT }
  }

  return { monto_servicio: input.monto_servicio ?? currentTicket.monto_servicio ?? DEFAULT_SERVICE_AMOUNT }
}
