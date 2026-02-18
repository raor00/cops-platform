"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { ActionResponse, TechnicianPayment } from "@/types"
import { ROLE_HIERARCHY } from "@/types"
import type { PaymentProcessInput } from "@/lib/validations"
import { getCurrentUser } from "./auth"
import { isLocalMode } from "@/lib/local-mode"
import { processPaymentDemo } from "@/lib/mock-data"

// ─────────────────────────────────────────────────────────────────────────────
// PROCESAR PAGO (Gerente+)
// ─────────────────────────────────────────────────────────────────────────────

export async function processPaymentAction(
  paymentId: string,
  input: PaymentProcessInput
): Promise<ActionResponse<TechnicianPayment>> {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { success: false, error: "No autenticado" }
  if (ROLE_HIERARCHY[currentUser.rol] < 3) return { success: false, error: "Sin permisos para procesar pagos" }

  if (isLocalMode()) {
    const result = processPaymentDemo(paymentId, input, currentUser)
    if (!result) return { success: false, error: "Pago no encontrado" }
    revalidatePath("/dashboard/pagos")
    return { success: true, data: result, message: "Pago procesado exitosamente" }
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("pagos_tecnicos")
    .update({
      estado_pago: "pagado",
      fecha_pago: new Date().toISOString(),
      metodo_pago: input.metodo_pago,
      referencia_pago: input.referencia_pago || null,
      pagado_por: currentUser.id,
      observaciones: input.observaciones || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", paymentId)
    .eq("estado_pago", "pendiente")
    .select()
    .single()

  if (error) return { success: false, error: error.message }
  if (!data) return { success: false, error: "Pago no encontrado o ya procesado" }

  revalidatePath("/dashboard/pagos")
  return { success: true, data: data as TechnicianPayment, message: "Pago procesado exitosamente" }
}
