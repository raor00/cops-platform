"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUser } from "./auth"
import { isLocalMode, isFirebaseMode } from "@/lib/local-mode"
import { getAdminFirestore, cleanForFirestore, fromFirestoreDoc } from "@/lib/firebase/admin"
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

async function getFirebaseTechnicians(): Promise<Array<{ id: string; nombre: string; apellido: string }>> {
  const db = getAdminFirestore()
  const snap = await db
    .collection("users")
    .where("rol", "==", "tecnico")
    .where("estado", "==", "activo")
    .orderBy("nombre", "asc")
    .get()
  return snap.docs.map((doc) => {
    const d = doc.data()
    return { id: doc.id, nombre: d.nombre as string, apellido: d.apellido as string }
  })
}

export async function getMaintenanceTechnicians(): Promise<ActionResponse<Array<{ id: string; nombre: string; apellido: string }>>> {
  const user = await getCurrentUser()
  if (!user) return { success: false, error: "No autenticado" }
  if (!canCoordinate(user.rol)) return { success: false, error: "Sin permisos" }

  if (isLocalMode()) {
    return { success: true, data: getDemoTechnicians() }
  }

  if (isFirebaseMode()) {
    try {
      return { success: true, data: await getFirebaseTechnicians() }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
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

  if (isFirebaseMode()) {
    try {
      const db = getAdminFirestore()
      const snap = await db.collection("agencias").orderBy("nombre", "asc").get()
      let all = snap.docs.map((doc) => fromFirestoreDoc<Agencia>(doc.id, doc.data()))
      if (search.trim()) {
        const q = search.trim().toLowerCase()
        all = all.filter(
          (a) =>
            a.nombre?.toLowerCase().includes(q) ||
            (a.ciudad as string | undefined)?.toLowerCase().includes(q) ||
            (a.region as string | undefined)?.toLowerCase().includes(q)
        )
      }
      return { success: true, data: all }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
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

  if (isFirebaseMode()) {
    try {
      const db = getAdminFirestore()
      const now = new Date().toISOString()
      const ref = db.collection("agencias").doc()
      const payload = cleanForFirestore({
        ...parsed.data,
        direccion: parsed.data.direccion || null,
        contacto: parsed.data.contacto || null,
        estado_operativo: parsed.data.estado_operativo || "activa",
        created_at: now,
        updated_at: now,
      })
      await ref.set(payload)
      revalidateMantenimiento()
      return { success: true, data: fromFirestoreDoc<Agencia>(ref.id, payload), message: "Agencia creada" }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
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

  if (isFirebaseMode()) {
    try {
      const db = getAdminFirestore()
      const ref = db.collection("agencias").doc(String(id))
      const snap = await ref.get()
      if (!snap.exists) return { success: false, error: "Agencia no encontrada" }
      const updatePayload = cleanForFirestore({
        ...parsed.data,
        direccion: parsed.data.direccion === undefined ? undefined : parsed.data.direccion || null,
        contacto: parsed.data.contacto === undefined ? undefined : parsed.data.contacto || null,
        updated_at: new Date().toISOString(),
      })
      await ref.update(updatePayload)
      revalidateMantenimiento()
      return {
        success: true,
        data: fromFirestoreDoc<Agencia>(ref.id, { ...snap.data()!, ...updatePayload }),
        message: "Agencia actualizada",
      }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
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

  if (isFirebaseMode()) {
    try {
      await getAdminFirestore().collection("agencias").doc(String(id)).delete()
      revalidateMantenimiento()
      return { success: true, message: "Agencia eliminada" }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
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

  if (isFirebaseMode()) {
    try {
      const db = getAdminFirestore()
      const snap = await db
        .collection("rutinas_mantenimiento")
        .orderBy("anio", "desc")
        .orderBy("trimestre", "desc")
        .get()
      const rutinas = snap.docs.map((doc) => fromFirestoreDoc<RutinaMantenimiento>(doc.id, doc.data()))
      return { success: true, data: rutinas }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
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

  if (isFirebaseMode()) {
    try {
      const db = getAdminFirestore()

      // Resolve target agencias
      let agenciasSnap = await db.collection("agencias").where("estado_operativo", "!=", "inactiva").get()
      let agencias = agenciasSnap.docs.map((doc) => fromFirestoreDoc<Agencia>(doc.id, doc.data()))
      if (parsed.data.agencia_ids && parsed.data.agencia_ids.length > 0) {
        const ids = parsed.data.agencia_ids.map(String)
        agencias = agencias.filter((a) => ids.includes(String(a.id)))
      } else if (parsed.data.regiones && parsed.data.regiones.length > 0) {
        agencias = agencias.filter((a) => (parsed.data.regiones as string[]).includes(a.region as string))
      }

      if (agencias.length === 0) {
        return { success: false, error: "No hay agencias objetivo para esta rutina" }
      }

      const now = new Date().toISOString()
      const rutinaRef = db.collection("rutinas_mantenimiento").doc()
      const rutinaPayload = cleanForFirestore({
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
        created_at: now,
        updated_at: now,
      })
      await rutinaRef.set(rutinaPayload)
      const rutina = fromFirestoreDoc<RutinaMantenimiento>(rutinaRef.id, rutinaPayload)

      // Batch-create visitas
      const batch = db.batch()
      const visitaRefs: FirebaseFirestore.DocumentReference[] = []
      for (const agencia of agencias) {
        const visitaRef = db.collection("visitas_mantenimiento").doc()
        visitaRefs.push(visitaRef)
        batch.set(
          visitaRef,
          cleanForFirestore({
            rutina_id: rutinaRef.id,
            agencia_id: String(agencia.id),
            agencia_nombre: agencia.nombre,
            tecnico_id: null,
            fecha_programada: null,
            fecha_realizada: null,
            estado: "pendiente",
            equipos_asignados: parsed.data.equipos_objetivo,
            observaciones_programacion: null,
            created_at: now,
            updated_at: now,
          })
        )
      }
      await batch.commit()

      const visitas = visitaRefs.map((ref, i) =>
        fromFirestoreDoc<VisitaMantenimiento>(ref.id, {
          rutina_id: rutinaRef.id,
          agencia_id: String(agencias[i]!.id),
          agencia_nombre: agencias[i]!.nombre,
          agencia: agencias[i],
          tecnico_id: null,
          fecha_programada: null,
          fecha_realizada: null,
          estado: "pendiente",
          equipos_asignados: parsed.data.equipos_objetivo,
          observaciones_programacion: null,
          created_at: now,
          updated_at: now,
        })
      )

      revalidateMantenimiento()
      return { success: true, data: { rutina, visitas }, message: "Rutina creada" }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
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

  if (isFirebaseMode()) {
    try {
      const db = getAdminFirestore()
      const ref = db.collection("rutinas_mantenimiento").doc(id)
      const snap = await ref.get()
      if (!snap.exists) return { success: false, error: "Rutina no encontrada" }
      const update = { estado, updated_at: new Date().toISOString() }
      await ref.update(update)
      revalidateMantenimiento()
      return {
        success: true,
        data: fromFirestoreDoc<RutinaMantenimiento>(id, { ...snap.data()!, ...update }),
        message: "Estado actualizado",
      }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
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

  if (isFirebaseMode()) {
    try {
      const db = getAdminFirestore()
      const rutinaSnap = await db.collection("rutinas_mantenimiento").doc(id).get()
      if (!rutinaSnap.exists) return { success: false, error: "Rutina no encontrada" }
      const rutina = fromFirestoreDoc<RutinaMantenimiento>(rutinaSnap.id, rutinaSnap.data()!)

      const visitasSnap = await db
        .collection("visitas_mantenimiento")
        .where("rutina_id", "==", id)
        .get()
      const items = visitasSnap.docs.map((doc) => fromFirestoreDoc<VisitaMantenimiento>(doc.id, doc.data()))

      return {
        success: true,
        data: {
          rutina,
          visitas: items,
          resumen: {
            total: items.length,
            completadas: items.filter((item) => item.estado === "completada").length,
            pendientes: items.filter((item) => item.estado === "pendiente").length,
            asignadas: items.filter((item) => item.tecnico_id && item.fecha_programada).length,
          },
        },
      }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
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

  if (isFirebaseMode()) {
    try {
      const db = getAdminFirestore()
      let ref: FirebaseFirestore.Query = db.collection("visitas_mantenimiento")
      if (filters.rutinaId) ref = ref.where("rutina_id", "==", filters.rutinaId)
      if (filters.tecnicoId) ref = ref.where("tecnico_id", "==", filters.tecnicoId)
      if (filters.estado) ref = ref.where("estado", "==", filters.estado)

      const snap = await ref.get()
      let items = snap.docs.map((doc) => fromFirestoreDoc<VisitaMantenimiento>(doc.id, doc.data()))

      // Filter by region in memory (no JOIN available)
      if (filters.region) {
        items = items.filter((v) => (v.agencia as { region?: string } | undefined)?.region === filters.region)
      }

      // Sort by fecha_programada asc, nulls last
      items.sort((a, b) => {
        if (!a.fecha_programada && !b.fecha_programada) return 0
        if (!a.fecha_programada) return 1
        if (!b.fecha_programada) return -1
        return a.fecha_programada < b.fecha_programada ? -1 : 1
      })

      return { success: true, data: items }
    } catch (err) {
      return { success: false, error: (err as Error).message }
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

  if (isFirebaseMode()) {
    try {
      const db = getAdminFirestore()
      const now = new Date().toISOString()
      const updatePayload = cleanForFirestore({
        tecnico_id: parsed.data.tecnico_id,
        fecha_programada: parsed.data.fecha_programada,
        observaciones_programacion: parsed.data.observaciones_programacion || null,
        updated_at: now,
      })

      const batch = db.batch()
      for (const visitaId of parsed.data.visita_ids) {
        batch.update(db.collection("visitas_mantenimiento").doc(visitaId), updatePayload)
      }
      await batch.commit()

      // Retrieve updated docs
      const updated: VisitaMantenimiento[] = []
      for (const visitaId of parsed.data.visita_ids) {
        const snap = await db.collection("visitas_mantenimiento").doc(visitaId).get()
        if (snap.exists) {
          updated.push(fromFirestoreDoc<VisitaMantenimiento>(snap.id, snap.data()!))
        }
      }

      revalidateMantenimiento()
      return { success: true, data: updated, message: "Visitas asignadas" }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
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

  if (isFirebaseMode()) {
    try {
      const db = getAdminFirestore()
      const ref = db.collection("visitas_mantenimiento").doc(visitaId)
      const snap = await ref.get()
      if (!snap.exists) return { success: false, error: "Visita no encontrada" }
      const now = new Date().toISOString()
      const updatePayload: Record<string, unknown> = { estado, updated_at: now }
      if (estado === "completada") updatePayload.fecha_realizada = now
      await ref.update(cleanForFirestore(updatePayload))
      revalidateMantenimiento()
      return {
        success: true,
        data: fromFirestoreDoc<VisitaMantenimiento>(visitaId, { ...snap.data()!, ...updatePayload }),
        message: "Estado actualizado",
      }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
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

  if (isFirebaseMode()) {
    try {
      const db = getAdminFirestore()
      const snap = await db
        .collection("visitas_mantenimiento")
        .where("tecnico_id", "==", user.id)
        .get()
      const items = snap.docs.map((doc) => fromFirestoreDoc<VisitaMantenimiento>(doc.id, doc.data()))
      items.sort((a, b) => {
        if (!a.fecha_programada && !b.fecha_programada) return 0
        if (!a.fecha_programada) return 1
        if (!b.fecha_programada) return -1
        return a.fecha_programada < b.fecha_programada ? -1 : 1
      })
      return { success: true, data: items }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
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

  if (isFirebaseMode()) {
    try {
      const db = getAdminFirestore()
      const snap = await db
        .collection("bitacora_visita")
        .where("visita_id", "==", visitaId)
        .limit(1)
        .get()
      if (snap.empty) return { success: true, data: null }
      const doc = snap.docs[0]!
      return { success: true, data: fromFirestoreDoc<BitacoraVisita>(doc.id, doc.data()) }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
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

  if (isFirebaseMode()) {
    try {
      const db = getAdminFirestore()
      const now = new Date().toISOString()
      // Check for existing bitacora for this visita
      const existingSnap = await db
        .collection("bitacora_visita")
        .where("visita_id", "==", parsed.data.visita_id)
        .limit(1)
        .get()

      const payload = cleanForFirestore({
        visita_id: parsed.data.visita_id,
        log: parsed.data.log,
        checklist: parsed.data.checklist,
        fotos: parsed.data.fotos ?? [],
        repuestos_usados: parsed.data.repuestos_usados ?? [],
        repuestos_devueltos: parsed.data.repuestos_devueltos ?? [],
        repuestos_pendientes: parsed.data.repuestos_pendientes ?? [],
        updated_at: now,
      })

      if (!existingSnap.empty) {
        const existingDoc = existingSnap.docs[0]!
        await existingDoc.ref.update(payload)
        revalidateMantenimiento()
        return {
          success: true,
          data: fromFirestoreDoc<BitacoraVisita>(existingDoc.id, { ...existingDoc.data(), ...payload }),
          message: "Bitácora actualizada",
        }
      }

      const ref = db.collection("bitacora_visita").doc()
      const insertPayload = cleanForFirestore({ ...payload, creado_por: user.id, created_at: now })
      await ref.set(insertPayload)
      revalidateMantenimiento()
      return {
        success: true,
        data: fromFirestoreDoc<BitacoraVisita>(ref.id, insertPayload),
        message: "Bitácora guardada",
      }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
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

  if (isFirebaseMode()) {
    try {
      const db = getAdminFirestore()
      let ref: FirebaseFirestore.Query = db.collection("viaticos").orderBy("created_at", "desc")
      if (!canCoordinate(user.rol)) {
        ref = db.collection("viaticos").where("tecnico_id", "==", user.id).orderBy("created_at", "desc")
      }
      const snap = await ref.get()
      const viaticos = snap.docs.map((doc) => fromFirestoreDoc<Viatico>(doc.id, doc.data()))
      return { success: true, data: viaticos }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
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

  if (isFirebaseMode()) {
    try {
      const db = getAdminFirestore()
      const now = new Date().toISOString()

      // Resolve visita to get tecnico_id and rutina_id
      let tecnicoId: string = parsed.data.tecnico_id || user.id
      let rutinaId: string | null = parsed.data.rutina_id || null

      if (parsed.data.visita_id) {
        const visitaSnap = await db.collection("visitas_mantenimiento").doc(parsed.data.visita_id).get()
        if (visitaSnap.exists) {
          const vd = visitaSnap.data()!
          if (vd.tecnico_id) tecnicoId = vd.tecnico_id as string
          if (vd.rutina_id) rutinaId = vd.rutina_id as string
        }
      }

      const ref = db.collection("viaticos").doc()
      const payload = cleanForFirestore({
        visita_id: parsed.data.visita_id || null,
        tecnico_id: tecnicoId,
        rutina_id: rutinaId,
        ruta: parsed.data.ruta,
        monto: parsed.data.monto,
        detalle: parsed.data.detalle || null,
        observaciones: parsed.data.observaciones || null,
        estado: "enviado",
        fecha_envio: now,
        created_at: now,
        updated_at: now,
      })
      await ref.set(payload)
      revalidateMantenimiento()
      return { success: true, data: fromFirestoreDoc<Viatico>(ref.id, payload), message: "Viático enviado" }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
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

  if (isFirebaseMode()) {
    try {
      const db = getAdminFirestore()
      const ref = db.collection("viaticos").doc(id)
      const snap = await ref.get()
      if (!snap.exists) return { success: false, error: "Viático no encontrado" }
      const now = new Date().toISOString()
      const updatePayload: Record<string, unknown> = { estado, updated_at: now }
      if (estado === "aprobado" || estado === "rechazado") {
        updatePayload.fecha_aprobacion = now
        updatePayload.aprobado_por = user.id
      }
      await ref.update(cleanForFirestore(updatePayload))
      revalidateMantenimiento()
      return {
        success: true,
        data: fromFirestoreDoc<Viatico>(id, { ...snap.data()!, ...updatePayload }),
        message: "Estado de viático actualizado",
      }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
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

  const rutinas = rutinasResult.data
  const visitas = visitasResult.data
  const viaticos = viaticosResult.data

  // Fetch last 10 bitacoras and technicians list — route through correct backend
  let bitacoras: BitacoraVisita[] = []
  let tecnicos: Array<{ id: string; nombre: string; apellido: string }> = []

  if (isFirebaseMode()) {
    try {
      const db = getAdminFirestore()
      const bitacoraSnap = await db
        .collection("bitacora_visita")
        .orderBy("created_at", "desc")
        .limit(10)
        .get()
      bitacoras = bitacoraSnap.docs.map((doc) => fromFirestoreDoc<BitacoraVisita>(doc.id, doc.data()))
      tecnicos = await getFirebaseTechnicians()
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
  } else {
    const supabase = await createClient()
    const { data: bitacorasData, error: bitacoraError } = await supabase
      .from("bitacora_visita")
      .select("*, creador:users!bitacora_visita_creado_por_fkey(id, nombre, apellido, rol)")
      .order("created_at", { ascending: false })
      .limit(10)

    if (bitacoraError) return { success: false, error: bitacoraError.message }
    bitacoras = (bitacorasData ?? []) as BitacoraVisita[]
    const tecnicosResult = await getSupabaseTechnicians()
    tecnicos = tecnicosResult.success ? tecnicosResult.data : []
  }

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
    visitas_por_tecnico: tecnicos.map((tecnico) => {
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
    ultimas_bitacoras: bitacoras.map((bitacora) => {
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
