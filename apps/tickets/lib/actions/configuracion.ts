"use server"

import { revalidatePath } from "next/cache"
import { getCurrentUser } from "./auth"
import { isLocalMode } from "@/lib/local-mode"
import { getDemoConfig, updateDemoConfig } from "@/lib/mock-data"
import { hasPermission } from "@/types"
import type { ActionResponse, SystemConfig } from "@/types"

export async function getConfiguracion(): Promise<ActionResponse<SystemConfig[]>> {
  const user = await getCurrentUser()
  if (!user) return { success: false, error: "No autenticado" }
  if (!hasPermission(user.rol, "config:view")) return { success: false, error: "Sin permisos para ver configuración" }

  if (isLocalMode()) {
    return { success: true, data: getDemoConfig() }
  }

  const { createClient } = await import("@/lib/supabase/server")
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("system_config")
    .select("*")
    .order("clave")

  if (error) return { success: false, error: error.message }
  return { success: true, data: data as SystemConfig[] }
}

export async function updateConfigValue(
  clave: string,
  valor: string
): Promise<ActionResponse<SystemConfig>> {
  const user = await getCurrentUser()
  if (!user) return { success: false, error: "No autenticado" }
  if (!hasPermission(user.rol, "config:edit")) return { success: false, error: "Se requiere rol Vicepresidente o superior para editar la configuración" }

  if (isLocalMode()) {
    const updated = updateDemoConfig(clave, valor)
    if (!updated) return { success: false, error: "Clave de configuración no encontrada" }
    revalidatePath("/dashboard/configuracion")
    return { success: true, data: updated, message: "Configuración actualizada" }
  }

  const { createClient } = await import("@/lib/supabase/server")
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("system_config")
    .update({ valor, updated_at: new Date().toISOString() })
    .eq("clave", clave)
    .select()
    .single()

  if (error) return { success: false, error: error.message }
  revalidatePath("/dashboard/configuracion")
  return { success: true, data: data as SystemConfig, message: "Configuración actualizada" }
}
