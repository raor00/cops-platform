"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUser } from "./auth"
import { isLocalMode } from "@/lib/local-mode"
import { ROLE_HIERARCHY } from "@/types"
import type {
  ActionResponse,
  Agencia,
  AgenciaCreateInput,
  AgenciaUpdateInput,
  AssignVisitaInput,
  BitacoraVisita,
  BitacoraVisitaInput,
  MantenimientoReportes,
  Region,
  RutinaCreateInput,
  RutinaEstado,
  RutinaMantenimiento,
  Viatico,
  ViaticoCreateInput,
  ViaticoEstado,
  VisitaEstado,
  VisitaMantenimiento,
} from "@/types"
import {
  agenciaCreateSchema,
  agenciaUpdateSchema,
  assignVisitaSchema,
  bitacoraVisitaSchema,
  rutinaCreateSchema,
  viaticoCreateSchema,
} from "@/lib/validations"
import {
  createDemoAgencia,
  createDemoRutinaConVisitas,
  createDemoViatico,
  deleteDemoAgencia,
  getDemoAgencias,
  getDemoBitacoraByVisita,
  getDemoMantenimientoReportes,
  getDemoMisVisitas,
  getDemoRutinaDetalle,
  getDemoRutinas,
  getDemoTechnicians,
  getDemoViaticos,
  getDemoVisitasMantenimiento,
  saveDemoBitacoraVisita,
  updateDemoAgencia,
  updateDemoRutinaEstado,
  updateDemoViaticoEstado,
  updateDemoVisitaEstado,
  assignDemoVisita,
} from "@/lib/mock-data"

function canCoordinate(role: string) {
  return ROLE_HIERARCHY[role as keyof typeof ROLE_HIERARCHY] >= 2
}

function canManageAgencias(role: string) {
  return ROLE_HIERARCHY[role as keyof typeof ROLE_HIERARCHY] >= 3
}

async function getSupabaseTechnicians() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("users")
    .select("id, nombre, apellido")
    .eq("rol", "tecnico")
    .eq("estado", "activo")
    .order("nombre", { ascending: true })

  if (error) {
    return { success: false as const, error: error.message }
  }

  return { success: true as const, data: data ?? [] }
}

export async function getMaintenanceTechnicians(): Promise<ActionResponse<Array<{ id: string; nombre: string; apellido: string }>>> {
  const user = await getCurrentUser()
  if (!user) return { success: false, error: "No autenticado" }
  if (!canCoordinate(user.rol)) return { success: false, error: "Sin permisos" }

  if (isLocalMode()) {
    return { success: true, data: getDemoTechnicians() }
  }

  const result = await getSupabaseTechnicians()
  if (!result.success) return { success: false, error: result.error }
  return { success: true, data: result.data }
}

function revalidateMantenimiento() {
  revalidatePath("/dashboard/mantenimiento")
  revalidatePath("/dashboard")
}

export async function getAgencias(search = ""): Promise<ActionResponse<Agencia[]>> {
  const user = await getCurrentUser()
  if (!user) return { success: false, error: "No autenticado" }
  if (!canCoordinate(user.rol)) return { success: false, error: "Sin permisos" }

  if (isLocalMode()) {
    return { success: true, data: getDemoAgencias(search) }
  }

  const supabase = await createClient()
  let query = supabase.from("agencias").select("*").order("nombre", { ascending: true })

  if (search.trim()) {
    const q = search.trim()
    query = query.or(`nombre.ilike.%${q}%,ciudad.ilike.%${q}%,region.ilike.%${q}%`)
  }

  const { data, error } = await query
  if (error) return { success: false, error: error.message }
  return { success: true, data: (data ?? []) as Agencia[] }
}

export async function createAgencia(input: AgenciaCreateInput): Promise<ActionResponse<Agencia>> {
  const user = await getCurrentUser()
  if (!user) return { success: false, error: "No autenticado" }
  if (!canManageAgencias(user.rol)) return { success: false, error: "Sin permisos" }

  const parsed = agenciaCreateSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" }

  if (isLocalMode()) {
    const data = createDemoAgencia(parsed.data)
    revalidateMantenimiento()
    return { success: true, data, message: "Agencia creada" }
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("agencias")
    .insert({
      ...parsed.data,
      direccion: parsed.data.direccion || null,
      contacto: parsed.data.contacto || null,
      estado_operativo: parsed.data.estado_operativo || "activa",
    })
    .select()
    .single()

  if (error) return { success: false, error: error.message }
  revalidateMantenimiento()
  return { success: true, data: data as Agencia, message: "Agencia creada" }
}

export async function updateAgencia(id: number, input: AgenciaUpdateInput): Promise<ActionResponse<Agencia>> {
  const user = await getCurrentUser()
  if (!user) return { success: false, error: "No autenticado" }
  if (!canManageAgencias(user.rol)) return { success: false, error: "Sin permisos" }

  const parsed = agenciaUpdateSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" }

  if (isLocalMode()) {
    const data = updateDemoAgencia(id, parsed.data)
    if (!data) return { success: false, error: "Agencia no encontrada" }
    revalidateMantenimiento()
    return { success: true, data, message: "Agencia actualizada" }
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("agencias")
    .update({
      ...parsed.data,
      direccion: parsed.data.direccion === undefined ? undefined : parsed.data.direccion || null,
      contacto: parsed.data.contacto === undefined ? undefined : parsed.data.contacto || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single()

  if (error) return { success: false, error: error.message }
  revalidateMantenimiento()
  return { success: true, data: data as Agencia, message: "Agencia actualizada" }
}

export async function deleteAgencia(id: number): Promise<ActionResponse<void>> {
  const user = await getCurrentUser()
  if (!user) return { success: false, error: "No autenticado" }
  if (!canManageAgencias(user.rol)) return { success: false, error: "Sin permisos" }

  if (isLocalMode()) {
    const ok = deleteDemoAgencia(id)
    if (!ok) return { success: false, error: "No se puede eliminar una agencia con visitas asociadas" }
    revalidateMantenimiento()
    return { success: true, message: "Agencia eliminada" }
  }

  const supabase = await createClient()
  const { error } = await supabase.from("agencias").delete().eq("id", id)
  if (error) return { success: false, error: error.message }
  revalidateMantenimiento()
  return { success: true, message: "Agencia eliminada" }
}

export async function getRutinas(): Promise<ActionResponse<RutinaMantenimiento[]>> {
  const user = await getCurrentUser()
  if (!user) return { success: false, error: "No autenticado" }
  if (!canCoordinate(user.rol)) return { success: false, error: "Sin permisos" }

  if (isLocalMode()) {
    return { success: true, data: getDemoRutinas() }
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("rutinas_mantenimiento")
    .select("*, creador:users!rutinas_mantenimiento_creado_por_fkey(id, nombre, apellido, rol)")
    .order("anio", { ascending: false })
    .order("trimestre", { ascending: false })

  if (error) return { success: false, error: error.message }
  return { success: true, data: (data ?? []) as RutinaMantenimiento[] }
}

export async function createRutinaConVisitas(input: RutinaCreateInput): Promise<ActionResponse<{ rutina: RutinaMantenimiento; visitas: VisitaMantenimiento[] }>> {
  const user = await getCurrentUser()
  if (!user) return { success: false, error: "No autenticado" }
  if (!canCoordinate(user.rol)) return { success: false, error: "Sin permisos" }

  const parsed = rutinaCreateSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" }

  if (isLocalMode()) {
    const data = createDemoRutinaConVisitas(parsed.data, user)
    revalidateMantenimiento()
    return { success: true, data, message: "Rutina creada" }
  }

  const supabase = await createClient()

  const { data: agencias, error: agenciaError } = await (async () => {
    let query = supabase.from("agencias").select("*")
    if (parsed.data.agencia_ids && parsed.data.agencia_ids.length > 0) {
      query = query.in("id", parsed.data.agencia_ids)
    } else {
      query = query.in("region", parsed.data.regiones as string[])
    }
    return query.neq("estado_operativo", "inactiva")
  })()

  if (agenciaError) return { success: false, error: agenciaError.message }
  if (!agencias || agencias.length === 0) return { success: false, error: "No hay agencias objetivo para esta rutina" }

  const { data: rutina, error: rutinaError } = await supabase
    .from("rutinas_mantenimiento")
    .insert({
      titulo: parsed.data.titulo,
      trimestre: parsed.data.trimestre,
      anio: parsed.data.anio,
      fecha_inicio: parsed.data.fecha_inicio,
      fecha_fin: parsed.data.fecha_fin,
      regiones: parsed.data.regiones,
      equipos_objetivo: parsed.data.equipos_objetivo,
      presupuesto_viaticos: parsed.data.presupuesto_viaticos ?? null,
      creado_por: user.id,
      estado: parsed.data.estado || "programada",
    })
    .select("*, creador:users!rutinas_mantenimiento_creado_por_fkey(id, nombre, apellido, rol)")
    .single()

  if (rutinaError || !rutina) return { success: false, error: rutinaError?.message ?? "No se pudo crear la rutina" }

  const visitasPayload = agencias.map((agencia) => ({
    rutina_id: rutina.id,
    agencia_id: agencia.id,
    tecnico_id: null,
    fecha_programada: null,
    fecha_realizada: null,
    estado: "pendiente",
    equipos_asignados: parsed.data.equipos_objetivo,
    observaciones_programacion: null,
  }))

  const { data: visitas, error: visitasError } = await supabase
    .from("visitas_mantenimiento")
    .insert(visitasPayload)
    .select(`
      *,
      agencia:agencias(*),
      tecnico:users!visitas_mantenimiento_tecnico_id_fkey(id, nombre, apellido, rol),
      rutina:rutinas_mantenimiento(*)
    `)

  if (visitasError) return { success: false, error: visitasError.message }

  revalidateMantenimiento()
  return { success: true, data: { rutina: rutina as RutinaMantenimiento, visitas: (visitas ?? []) as VisitaMantenimiento[] }, message: "Rutina creada" }
}

export async function updateRutinaEstado(id: string, estado: RutinaEstado): Promise<ActionResponse<RutinaMantenimiento>> {
  const user = await getCurrentUser()
  if (!user) return { success: false, error: "No autenticado" }
  if (!canCoordinate(user.rol)) return { success: false, error: "Sin permisos" }

  if (isLocalMode()) {
    const data = updateDemoRutinaEstado(id, estado)
    if (!data) return { success: false, error: "Rutina no encontrada" }
    revalidateMantenimiento()
    return { success: true, data, message: "Estado actualizado" }
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("rutinas_mantenimiento")
    .update({ estado, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*, creador:users!rutinas_mantenimiento_creado_por_fkey(id, nombre, apellido, rol)")
    .single()

  if (error) return { success: false, error: error.message }
  revalidateMantenimiento()
  return { success: true, data: data as RutinaMantenimiento, message: "Estado actualizado" }
}

export async function getRutinaDetalle(id: string): Promise<ActionResponse<{ rutina: RutinaMantenimiento; visitas: VisitaMantenimiento[]; resumen: { total: number; completadas: number; pendientes: number; asignadas: number } }>> {
  const user = await getCurrentUser()
  if (!user) return { success: false, error: "No autenticado" }
  if (!canCoordinate(user.rol)) return { success: false, error: "Sin permisos" }

  if (isLocalMode()) {
    const data = getDemoRutinaDetalle(id)
    if (!data) return { success: false, error: "Rutina no encontrada" }
    return { success: true, data }
  }

  const supabase = await createClient()
  const { data: rutina, error: rutinaError } = await supabase
    .from("rutinas_mantenimiento")
    .select("*, creador:users!rutinas_mantenimiento_creado_por_fkey(id, nombre, apellido, rol)")
    .eq("id", id)
    .single()

  if (rutinaError || !rutina) return { success: false, error: rutinaError?.message ?? "Rutina no encontrada" }

  const { data: visitas, error: visitasError } = await supabase
    .from("visitas_mantenimiento")
    .select(`
      *,
      agencia:agencias(*),
      tecnico:users!visitas_mantenimiento_tecnico_id_fkey(id, nombre, apellido, rol),
      rutina:rutinas_mantenimiento(*)
    `)
    .eq("rutina_id", id)

  if (visitasError) return { success: false, error: visitasError.message }
  const items = (visitas ?? []) as VisitaMantenimiento[]

  return {
    success: true,
    data: {
      rutina: rutina as RutinaMantenimiento,
      visitas: items,
      resumen: {
        total: items.length,
        completadas: items.filter((item) => item.estado === "completada").length,
        pendientes: items.filter((item) => item.estado === "pendiente").length,
        asignadas: items.filter((item) => item.tecnico_id && item.fecha_programada).length,
      },
    },
  }
}

export async function getVisitasMantenimiento(filters: {
  rutinaId?: string
  region?: Region
  tecnicoId?: string
  estado?: VisitaEstado
} = {}): Promise<ActionResponse<VisitaMantenimiento[]>> {
  const user = await getCurrentUser()
  if (!user) return { success: false, error: "No autenticado" }
  if (!canCoordinate(user.rol)) return { success: false, error: "Sin permisos" }

  if (isLocalMode()) {
    return {
      success: true,
      data: getDemoVisitasMantenimiento({
        rutinaId: filters.rutinaId,
        region: filters.region,
        tecnicoId: filters.tecnicoId,
        estado: filters.estado,
      }),
    }
  }

  const supabase = await createClient()
  let query = supabase
    .from("visitas_mantenimiento")
    .select(`
      *,
      agencia:agencias(*),
      tecnico:users!visitas_mantenimiento_tecnico_id_fkey(id, nombre, apellido, rol),
      rutina:rutinas_mantenimiento(*)
    `)

  if (filters.rutinaId) query = query.eq("rutina_id", filters.rutinaId)
  if (filters.tecnicoId) query = query.eq("tecnico_id", filters.tecnicoId)
  if (filters.estado) query = query.eq("estado", filters.estado)
  if (filters.region) query = query.eq("agencia.region", filters.region)

  const { data, error } = await query.order("fecha_programada", { ascending: true, nullsFirst: false })
  if (error) return { success: false, error: error.message }
  return { success: true, data: (data ?? []) as VisitaMantenimiento[] }
}

export async function assignVisita(input: AssignVisitaInput): Promise<ActionResponse<VisitaMantenimiento[]>> {
  const user = await getCurrentUser()
  if (!user) return { success: false, error: "No autenticado" }
  if (!canCoordinate(user.rol)) return { success: false, error: "Sin permisos" }

  const parsed = assignVisitaSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" }

  if (isLocalMode()) {
    const data = assignDemoVisita(parsed.data)
    revalidateMantenimiento()
    return { success: true, data, message: "Visitas asignadas" }
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("visitas_mantenimiento")
    .update({
      tecnico_id: parsed.data.tecnico_id,
      fecha_programada: parsed.data.fecha_programada,
      observaciones_programacion: parsed.data.observaciones_programacion || null,
      updated_at: new Date().toISOString(),
    })
    .in("id", parsed.data.visita_ids)
    .select(`
      *,
      agencia:agencias(*),
      tecnico:users!visitas_mantenimiento_tecnico_id_fkey(id, nombre, apellido, rol),
      rutina:rutinas_mantenimiento(*)
    `)

  if (error) return { success: false, error: error.message }
  revalidateMantenimiento()
  return { success: true, data: (data ?? []) as VisitaMantenimiento[], message: "Visitas asignadas" }
}

export async function updateVisitaEstado(visitaId: string, estado: VisitaEstado): Promise<ActionResponse<VisitaMantenimiento>> {
  const user = await getCurrentUser()
  if (!user) return { success: false, error: "No autenticado" }
  if (user.rol === "tecnico") {
    const propia = await getMisVisitas()
    if (!propia.success || !propia.data?.some((visita) => visita.id === visitaId)) {
      return { success: false, error: "No tienes acceso a esta visita" }
    }
  } else if (!canCoordinate(user.rol)) {
    return { success: false, error: "Sin permisos" }
  }

  if (isLocalMode()) {
    const data = updateDemoVisitaEstado(visitaId, { estado })
    if (!data) return { success: false, error: "Visita no encontrada" }
    revalidateMantenimiento()
    return { success: true, data, message: "Estado actualizado" }
  }

  const supabase = await createClient()
  const payload: Record<string, unknown> = {
    estado,
    updated_at: new Date().toISOString(),
  }
  if (estado === "completada") payload.fecha_realizada = new Date().toISOString()

  const { data, error } = await supabase
    .from("visitas_mantenimiento")
    .update(payload)
    .eq("id", visitaId)
    .select(`
      *,
      agencia:agencias(*),
      tecnico:users!visitas_mantenimiento_tecnico_id_fkey(id, nombre, apellido, rol),
      rutina:rutinas_mantenimiento(*)
    `)
    .single()

  if (error) return { success: false, error: error.message }
  revalidateMantenimiento()
  return { success: true, data: data as VisitaMantenimiento, message: "Estado actualizado" }
}

export async function getMisVisitas(): Promise<ActionResponse<VisitaMantenimiento[]>> {
  const user = await getCurrentUser()
  if (!user) return { success: false, error: "No autenticado" }

  if (isLocalMode()) {
    return { success: true, data: getDemoMisVisitas(user.id) }
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("visitas_mantenimiento")
    .select(`
      *,
      agencia:agencias(*),
      tecnico:users!visitas_mantenimiento_tecnico_id_fkey(id, nombre, apellido, rol),
      rutina:rutinas_mantenimiento(*)
    `)
    .eq("tecnico_id", user.id)
    .order("fecha_programada", { ascending: true, nullsFirst: false })

  if (error) return { success: false, error: error.message }
  return { success: true, data: (data ?? []) as VisitaMantenimiento[] }
}

export async function getBitacoraByVisita(visitaId: string): Promise<ActionResponse<BitacoraVisita | null>> {
  const user = await getCurrentUser()
  if (!user) return { success: false, error: "No autenticado" }

  if (isLocalMode()) {
    return { success: true, data: getDemoBitacoraByVisita(visitaId) }
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("bitacora_visita")
    .select("*, creador:users!bitacora_visita_creado_por_fkey(id, nombre, apellido, rol)")
    .eq("visita_id", visitaId)
    .maybeSingle()

  if (error) return { success: false, error: error.message }
  return { success: true, data: (data ?? null) as BitacoraVisita | null }
}

export async function saveBitacoraVisita(input: BitacoraVisitaInput): Promise<ActionResponse<BitacoraVisita>> {
  const user = await getCurrentUser()
  if (!user) return { success: false, error: "No autenticado" }

  const parsed = bitacoraVisitaSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" }

  if (isLocalMode()) {
    const data = saveDemoBitacoraVisita(parsed.data, user)
    revalidateMantenimiento()
    return { success: true, data, message: "Bitácora guardada" }
  }

  const supabase = await createClient()
  const { data: existing } = await supabase
    .from("bitacora_visita")
    .select("id")
    .eq("visita_id", parsed.data.visita_id)
    .maybeSingle()

  if (existing?.id) {
    const { data, error } = await supabase
      .from("bitacora_visita")
      .update({
        log: parsed.data.log,
        checklist: parsed.data.checklist,
        fotos: parsed.data.fotos ?? [],
        repuestos_usados: parsed.data.repuestos_usados ?? [],
        repuestos_devueltos: parsed.data.repuestos_devueltos ?? [],
        repuestos_pendientes: parsed.data.repuestos_pendientes ?? [],
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
      .select("*, creador:users!bitacora_visita_creado_por_fkey(id, nombre, apellido, rol)")
      .single()

    if (error) return { success: false, error: error.message }
    revalidateMantenimiento()
    return { success: true, data: data as BitacoraVisita, message: "Bitácora actualizada" }
  }

  const { data, error } = await supabase
    .from("bitacora_visita")
    .insert({
      visita_id: parsed.data.visita_id,
      log: parsed.data.log,
      checklist: parsed.data.checklist,
      fotos: parsed.data.fotos ?? [],
      repuestos_usados: parsed.data.repuestos_usados ?? [],
      repuestos_devueltos: parsed.data.repuestos_devueltos ?? [],
      repuestos_pendientes: parsed.data.repuestos_pendientes ?? [],
      creado_por: user.id,
    })
    .select("*, creador:users!bitacora_visita_creado_por_fkey(id, nombre, apellido, rol)")
    .single()

  if (error) return { success: false, error: error.message }
  revalidateMantenimiento()
  return { success: true, data: data as BitacoraVisita, message: "Bitácora guardada" }
}

export async function getViaticos(): Promise<ActionResponse<Viatico[]>> {
  const user = await getCurrentUser()
  if (!user) return { success: false, error: "No autenticado" }

  if (isLocalMode()) {
    return { success: true, data: getDemoViaticos(user) }
  }

  const supabase = await createClient()
  let query = supabase
    .from("viaticos")
    .select(`
      *,
      visita:visitas_mantenimiento(
        *,
        agencia:agencias(*),
        tecnico:users!visitas_mantenimiento_tecnico_id_fkey(id, nombre, apellido, rol),
        rutina:rutinas_mantenimiento(*)
      ),
      tecnico:users!viaticos_tecnico_id_fkey(id, nombre, apellido, rol),
      aprobador:users!viaticos_aprobado_por_fkey(id, nombre, apellido, rol)
    `)
    .order("created_at", { ascending: false })

  if (!canCoordinate(user.rol)) {
    query = query.eq("tecnico_id", user.id)
  }

  const { data, error } = await query
  if (error) return { success: false, error: error.message }
  return { success: true, data: (data ?? []) as Viatico[] }
}

export async function createViatico(input: ViaticoCreateInput): Promise<ActionResponse<Viatico>> {
  const user = await getCurrentUser()
  if (!user) return { success: false, error: "No autenticado" }

  const parsed = viaticoCreateSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" }

  if (isLocalMode()) {
    const data = createDemoViatico(parsed.data, user)
    if (!data) return { success: false, error: "No se pudo crear el viático" }
    revalidateMantenimiento()
    return { success: true, data, message: "Viático enviado" }
  }

  const supabase = await createClient()
  let visita: VisitaMantenimiento | null = null
  if (parsed.data.visita_id) {
    const { data } = await supabase
      .from("visitas_mantenimiento")
      .select("*")
      .eq("id", parsed.data.visita_id)
      .single()
    visita = (data as VisitaMantenimiento | null) ?? null
  }

  const tecnicoId = visita?.tecnico_id || parsed.data.tecnico_id || user.id
  const rutinaId = visita?.rutina_id || parsed.data.rutina_id || null

  const { data, error } = await supabase
    .from("viaticos")
    .insert({
      visita_id: parsed.data.visita_id || null,
      tecnico_id: tecnicoId,
      rutina_id: rutinaId,
      ruta: parsed.data.ruta,
      monto: parsed.data.monto,
      detalle: parsed.data.detalle || null,
      observaciones: parsed.data.observaciones || null,
      estado: "enviado",
      fecha_envio: new Date().toISOString(),
    })
    .select(`
      *,
      visita:visitas_mantenimiento(
        *,
        agencia:agencias(*),
        tecnico:users!visitas_mantenimiento_tecnico_id_fkey(id, nombre, apellido, rol),
        rutina:rutinas_mantenimiento(*)
      ),
      tecnico:users!viaticos_tecnico_id_fkey(id, nombre, apellido, rol),
      aprobador:users!viaticos_aprobado_por_fkey(id, nombre, apellido, rol)
    `)
    .single()

  if (error) return { success: false, error: error.message }
  revalidateMantenimiento()
  return { success: true, data: data as Viatico, message: "Viático enviado" }
}

export async function updateViaticoEstado(id: string, estado: ViaticoEstado): Promise<ActionResponse<Viatico>> {
  const user = await getCurrentUser()
  if (!user) return { success: false, error: "No autenticado" }
  if (!canCoordinate(user.rol)) return { success: false, error: "Sin permisos" }

  if (isLocalMode()) {
    const data = updateDemoViaticoEstado(id, estado, user)
    if (!data) return { success: false, error: "Viático no encontrado" }
    revalidateMantenimiento()
    return { success: true, data, message: "Estado de viático actualizado" }
  }

  const payload: Record<string, unknown> = {
    estado,
    updated_at: new Date().toISOString(),
  }
  if (estado === "aprobado" || estado === "rechazado") {
    payload.fecha_aprobacion = new Date().toISOString()
    payload.aprobado_por = user.id
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("viaticos")
    .update(payload)
    .eq("id", id)
    .select(`
      *,
      visita:visitas_mantenimiento(
        *,
        agencia:agencias(*),
        tecnico:users!visitas_mantenimiento_tecnico_id_fkey(id, nombre, apellido, rol),
        rutina:rutinas_mantenimiento(*)
      ),
      tecnico:users!viaticos_tecnico_id_fkey(id, nombre, apellido, rol),
      aprobador:users!viaticos_aprobado_por_fkey(id, nombre, apellido, rol)
    `)
    .single()

  if (error) return { success: false, error: error.message }
  revalidateMantenimiento()
  return { success: true, data: data as Viatico, message: "Estado de viático actualizado" }
}

export async function getMantenimientoReportes(): Promise<ActionResponse<MantenimientoReportes>> {
  const user = await getCurrentUser()
  if (!user) return { success: false, error: "No autenticado" }
  if (!canCoordinate(user.rol)) return { success: false, error: "Sin permisos" }

  if (isLocalMode()) {
    return { success: true, data: getDemoMantenimientoReportes() }
  }

  const [rutinasResult, visitasResult, viaticosResult] = await Promise.all([
    getRutinas(),
    getVisitasMantenimiento(),
    getViaticos(),
  ])

  if (!rutinasResult.success || !rutinasResult.data) return { success: false, error: rutinasResult.error ?? "Error cargando rutinas" }
  if (!visitasResult.success || !visitasResult.data) return { success: false, error: visitasResult.error ?? "Error cargando visitas" }
  if (!viaticosResult.success || !viaticosResult.data) return { success: false, error: viaticosResult.error ?? "Error cargando viáticos" }

  const supabase = await createClient()
  const { data: bitacoras, error: bitacoraError } = await supabase
    .from("bitacora_visita")
    .select("*, creador:users!bitacora_visita_creado_por_fkey(id, nombre, apellido, rol)")
    .order("created_at", { ascending: false })
    .limit(10)

  if (bitacoraError) return { success: false, error: bitacoraError.message }

  const rutinas = rutinasResult.data
  const visitas = visitasResult.data
  const viaticos = viaticosResult.data
  const agenciasAtendidas = new Set(visitas.filter((visita) => visita.estado === "completada").map((visita) => visita.agencia_id)).size
  const resumen: MantenimientoReportes = {
    resumen: {
      total_rutinas: rutinas.length,
      total_visitas: visitas.length,
      visitas_completadas: visitas.filter((visita) => visita.estado === "completada").length,
      visitas_pendientes: visitas.filter((visita) => visita.estado !== "completada" && visita.estado !== "cancelada").length,
      agencias_atendidas: agenciasAtendidas,
      viaticos_aprobados_monto: viaticos.filter((viatico) => viatico.estado === "aprobado").reduce((sum, viatico) => sum + Number(viatico.monto), 0),
      viaticos_pendientes_monto: viaticos.filter((viatico) => viatico.estado === "planeado" || viatico.estado === "enviado").reduce((sum, viatico) => sum + Number(viatico.monto), 0),
    },
    progreso_por_rutina: rutinas.map((rutina) => {
      const items = visitas.filter((visita) => visita.rutina_id === rutina.id)
      const completadas = items.filter((visita) => visita.estado === "completada").length
      const pendientes = items.filter((visita) => visita.estado !== "completada" && visita.estado !== "cancelada").length
      return {
        rutina_id: rutina.id,
        titulo: rutina.titulo,
        estado: rutina.estado,
        total_visitas: items.length,
        completadas,
        pendientes,
        porcentaje_avance: items.length > 0 ? Math.round((completadas / items.length) * 100) : 0,
      }
    }),
    visitas_por_tecnico: (isLocalMode() ? getDemoTechnicians() : (await getSupabaseTechnicians()).data ?? []).map((tecnico) => {
      const items = visitas.filter((visita) => visita.tecnico_id === tecnico.id)
      return {
        tecnico_id: tecnico.id,
        tecnico_nombre: `${tecnico.nombre} ${tecnico.apellido}`,
        total: items.length,
        completadas: items.filter((visita) => visita.estado === "completada").length,
        en_proceso: items.filter((visita) => visita.estado === "en_proceso").length,
      }
    }),
    viaticos_por_rutina: rutinas.map((rutina) => {
      const items = viaticos.filter((viatico) => viatico.rutina_id === rutina.id)
      return {
        rutina_id: rutina.id,
        titulo: rutina.titulo,
        presupuesto: rutina.presupuesto_viaticos || 0,
        aprobado: items.filter((viatico) => viatico.estado === "aprobado").reduce((sum, viatico) => sum + Number(viatico.monto), 0),
        pendiente: items.filter((viatico) => viatico.estado === "planeado" || viatico.estado === "enviado").reduce((sum, viatico) => sum + Number(viatico.monto), 0),
      }
    }),
    ultimas_bitacoras: ((bitacoras ?? []) as BitacoraVisita[]).map((bitacora) => {
      const visita = visitas.find((item) => item.id === bitacora.visita_id)
      return {
        bitacora_id: bitacora.id,
        visita_id: bitacora.visita_id,
        agencia_nombre: visita?.agencia?.nombre || "Agencia",
        tecnico_nombre: bitacora.creador ? `${bitacora.creador.nombre} ${bitacora.creador.apellido}` : "Sin técnico",
        created_at: bitacora.created_at,
        log: bitacora.log,
      }
    }),
  }

  return { success: true, data: resumen }
}
