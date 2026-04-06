"use server"

import { revalidatePath } from "next/cache"
import { getCurrentUser } from "./auth"
import { isLocalMode, isFirebaseMode } from "@/lib/local-mode"
import { getDemoConfig, updateDemoConfig } from "@/lib/mock-data"
import { hasPermission } from "@/types"
import type { ActionResponse, SystemConfig } from "@/types"
import { getAdminFirestore, fromFirestoreDoc, cleanForFirestore } from "@/lib/firebase/admin"

const DEFAULT_CONFIG_DATA = [
  { clave: 'nombre_empresa', valor: 'COPS Electronics', descripcion: 'Nombre de la empresa', tipo_dato: 'string' as const },
  { clave: 'moneda', valor: 'USD', descripcion: 'Moneda del sistema', tipo_dato: 'string' as const },
  { clave: 'comision_tecnico', valor: '50', descripcion: 'Porcentaje de comision tecnico (%)', tipo_dato: 'number' as const },
  { clave: 'monto_servicio_base', valor: '50', descripcion: 'Monto base por servicio', tipo_dato: 'number' as const },
  { clave: 'monto_inspeccion', valor: '20', descripcion: 'Monto por inspeccion', tipo_dato: 'number' as const },
]

export async function getConfiguracion(): Promise<ActionResponse<SystemConfig[]>> {
  const user = await getCurrentUser()
  if (!user) return { success: false, error: 'No autenticado' }
  if (!hasPermission(user.rol, 'config:view')) return { success: false, error: 'Sin permisos para ver configuracion' }

  if (isLocalMode()) return { success: true, data: getDemoConfig() }

  if (isFirebaseMode()) {
    try {
      const db = getAdminFirestore()
      const snap = await db.collection('configuracion').get()
      if (snap.empty) {
        const now = new Date().toISOString()
        const batch = db.batch()
        for (const cfg of DEFAULT_CONFIG_DATA) {
          const d = cleanForFirestore({ id: cfg.clave, ...cfg, updated_at: now })
          batch.set(db.collection('configuracion').doc(cfg.clave), d)
        }
        await batch.commit()
        return { success: true, data: DEFAULT_CONFIG_DATA.map((c, i) => ({ id: i + 1, ...c, updated_at: now } as unknown as SystemConfig)) }
      }
      const data = snap.docs.map((d) => fromFirestoreDoc<SystemConfig>(d.id, d.data()))
      data.sort((a, b) => a.clave.localeCompare(b.clave))
      return { success: true, data }
    } catch (err) { return { success: false, error: (err as Error).message } }
  }

  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()
  const { data, error } = await supabase.from('system_config').select('*').order('clave')
  if (error) return { success: false, error: error.message }
  return { success: true, data: data as SystemConfig[] }
}

export async function updateConfigValue(clave: string, valor: string): Promise<ActionResponse<SystemConfig>> {
  const user = await getCurrentUser()
  if (!user) return { success: false, error: 'No autenticado' }
  if (!hasPermission(user.rol, 'config:edit')) return { success: false, error: 'Se requiere rol Vicepresidente o superior para editar la configuracion' }

  if (isLocalMode()) {
    const updated = updateDemoConfig(clave, valor)
    if (!updated) return { success: false, error: 'Clave de configuracion no encontrada' }
    revalidatePath('/dashboard/configuracion')
    return { success: true, data: updated, message: 'Configuracion actualizada' }
  }

  if (isFirebaseMode()) {
    try {
      const db = getAdminFirestore()
      const ref = db.collection('configuracion').doc(clave)
      const snap = await ref.get()
      const now = new Date().toISOString()
      if (!snap.exists) {
        const newCfg = cleanForFirestore({ id: 0, clave, valor, descripcion: clave, tipo_dato: 'string', updated_at: now })
        await ref.set(newCfg)
        revalidatePath('/dashboard/configuracion')
        return { success: true, data: newCfg as SystemConfig, message: 'Configuracion actualizada' }
      }
      await ref.update({ valor, updated_at: now })
      revalidatePath('/dashboard/configuracion')
      return { success: true, data: fromFirestoreDoc<SystemConfig>(clave, { ...snap.data()!, valor, updated_at: now }), message: 'Configuracion actualizada' }
    } catch (err) { return { success: false, error: (err as Error).message } }
  }

  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()
  const { data, error } = await supabase.from('system_config').update({ valor, updated_at: new Date().toISOString() }).eq('clave', clave).select().single()
  if (error) return { success: false, error: error.message }
  revalidatePath('/dashboard/configuracion')
  return { success: true, data: data as SystemConfig, message: 'Configuracion actualizada' }
}
