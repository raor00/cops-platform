"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type {
  ActionResponse,
  Cliente,
  ClienteCreateInput,
  ClienteUpdateInput,
  PaginatedResponse,
} from "@/types"
import { ROLE_HIERARCHY, hasPermission } from "@/types"
import { getCurrentUser } from "./auth"
import { isLocalMode, isFirebaseMode } from "@/lib/local-mode"
import { getAdminFirestore, fromFirestoreDoc, cleanForFirestore } from "@/lib/firebase/admin"
import {
  getDemoClientes,
  getDemoClienteById,
  createDemoCliente,
  updateDemoCliente,
  deleteDemoCliente,
  searchDemoClientes,
} from "@/lib/mock-data"

async function fbGetAllClientes(): Promise<Cliente[]> {
  const db = getAdminFirestore()
  const snap = await db.collection("clientes").orderBy("created_at", "desc").get()
  return snap.docs.map((d) => fromFirestoreDoc<Cliente>(d.id, d.data()))
}

// ─────────────────────────────────────────────────────────────────────────────
// GET CLIENTES
// ─────────────────────────────────────────────────────────────────────────────

export async function getClientes(
  options: { page?: number; pageSize?: number; search?: string; estado?: string } = {}
): Promise<ActionResponse<PaginatedResponse<Cliente>>> {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { success: false, error: "No autenticado" }
  if (!hasPermission(currentUser.rol, "clients:view")) return { success: false, error: "Sin permisos" }

  if (isLocalMode()) return { success: true, data: getDemoClientes(options) }

  if (isFirebaseMode()) {
    try {
      let all = await fbGetAllClientes()
      if (options.estado) all = all.filter((c) => c.estado === options.estado)
      if (options.search) {
        const q = options.search.toLowerCase()
        all = all.filter(
          (c) =>
            c.nombre?.toLowerCase().includes(q) ||
            (c.empresa as string | undefined)?.toLowerCase().includes(q) ||
            (c.rif_cedula as string | undefined)?.toLowerCase().includes(q)
        )
      }
      const page = options.page || 1
      const pageSize = options.pageSize || 20
      const start = (page - 1) * pageSize
      return {
        success: true,
        data: {
          data: all.slice(start, start + pageSize),
          total: all.length,
          page,
          pageSize,
          totalPages: Math.ceil(all.length / pageSize),
        },
      }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
  }

  const supabase = await createClient()
  const page = options.page || 1
  const pageSize = options.pageSize || 20
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase.from("clientes").select("*", { count: "exact" })
  if (options.search) {
    const s = options.search.replace(/[,().%\\]/g, "")
    query = query.or(`nombre.ilike.%${s}%,empresa.ilike.%${s}%,rif_cedula.ilike.%${s}%`)
  }
  if (options.estado) query = query.eq("estado", options.estado)
  query = query.order("created_at", { ascending: false }).range(from, to)

  const { data, error, count } = await query
  if (error) return { success: false, error: error.message }

  return {
    success: true,
    data: {
      data: (data ?? []) as Cliente[],
      total: count ?? 0,
      page,
      pageSize,
      totalPages: Math.ceil((count ?? 0) / pageSize),
    },
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET CLIENTE BY ID
// ─────────────────────────────────────────────────────────────────────────────

export async function getClienteById(id: string): Promise<ActionResponse<Cliente>> {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { success: false, error: "No autenticado" }
  if (!hasPermission(currentUser.rol, "clients:view")) return { success: false, error: "Sin permisos" }

  if (isLocalMode()) {
    const data = getDemoClienteById(id)
    if (!data) return { success: false, error: "Cliente no encontrado" }
    return { success: true, data }
  }

  if (isFirebaseMode()) {
    try {
      const db = getAdminFirestore()
      const doc = await db.collection("clientes").doc(id).get()
      if (!doc.exists) return { success: false, error: "Cliente no encontrado" }
      return { success: true, data: fromFirestoreDoc<Cliente>(doc.id, doc.data()!) }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.from("clientes").select("*").eq("id", id).single()
  if (error) return { success: false, error: error.message }
  return { success: true, data: data as Cliente }
}

// ─────────────────────────────────────────────────────────────────────────────
// CREATE CLIENTE
// ─────────────────────────────────────────────────────────────────────────────

export async function createCliente(input: ClienteCreateInput): Promise<ActionResponse<Cliente>> {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { success: false, error: "No autenticado" }
  if (!hasPermission(currentUser.rol, "clients:create")) return { success: false, error: "Sin permisos" }

  if (isLocalMode()) {
    const data = createDemoCliente(input)
    revalidatePath("/dashboard/clientes")
    return { success: true, data, message: "Cliente creado exitosamente" }
  }

  if (isFirebaseMode()) {
    try {
      const db = getAdminFirestore()
      const now = new Date().toISOString()
      const ref = db.collection("clientes").doc()
      const clienteData = cleanForFirestore({
        nombre: input.nombre,
        apellido: input.apellido || null,
        empresa: input.empresa || null,
        email: input.email || null,
        telefono: input.telefono,
        direccion: input.direccion,
        rif_cedula: input.rif_cedula || null,
        observaciones: input.observaciones || null,
        contactos: (input.contactos ?? []).map((ct) => ({ ...ct, id: crypto.randomUUID() })),
        estado: "activo",
        created_at: now,
        updated_at: now,
      })
      await ref.set(clienteData)
      revalidatePath("/dashboard/clientes")
      return { success: true, data: { id: ref.id, ...clienteData } as Cliente, message: "Cliente creado exitosamente" }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("clientes")
    .insert({
      nombre: input.nombre,
      apellido: input.apellido || null,
      empresa: input.empresa || null,
      email: input.email || null,
      telefono: input.telefono,
      direccion: input.direccion,
      rif_cedula: input.rif_cedula || null,
      observaciones: input.observaciones || null,
      contactos: (input.contactos ?? []).map((ct) => ({ ...ct, id: crypto.randomUUID() })),
      estado: "activo",
    })
    .select()
    .single()

  if (error) return { success: false, error: error.message }
  revalidatePath("/dashboard/clientes")
  return { success: true, data: data as Cliente, message: "Cliente creado exitosamente" }
}

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE CLIENTE
// ─────────────────────────────────────────────────────────────────────────────

export async function updateCliente(
  id: string,
  input: ClienteUpdateInput
): Promise<ActionResponse<Cliente>> {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { success: false, error: "No autenticado" }
  if (!hasPermission(currentUser.rol, "clients:edit")) return { success: false, error: "Sin permisos" }

  if (isLocalMode()) {
    const data = updateDemoCliente(id, input)
    if (!data) return { success: false, error: "Cliente no encontrado" }
    revalidatePath("/dashboard/clientes")
    return { success: true, data, message: "Cliente actualizado" }
  }

  if (isFirebaseMode()) {
    try {
      const db = getAdminFirestore()
      const ref = db.collection("clientes").doc(id)
      const snap = await ref.get()
      if (!snap.exists) return { success: false, error: "Cliente no encontrado" }
      const update = cleanForFirestore({ ...input, updated_at: new Date().toISOString() })
      await ref.update(update)
      revalidatePath("/dashboard/clientes")
      return {
        success: true,
        data: fromFirestoreDoc<Cliente>(id, { ...snap.data()!, ...update }),
        message: "Cliente actualizado",
      }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("clientes")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) return { success: false, error: error.message }
  revalidatePath("/dashboard/clientes")
  return { success: true, data: data as Cliente, message: "Cliente actualizado" }
}

// ─────────────────────────────────────────────────────────────────────────────
// DELETE CLIENTE
// ─────────────────────────────────────────────────────────────────────────────

export async function deleteCliente(id: string): Promise<ActionResponse<void>> {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { success: false, error: "No autenticado" }
  if (ROLE_HIERARCHY[currentUser.rol] < 3) return { success: false, error: "Sin permisos" }

  if (isLocalMode()) {
    const ok = deleteDemoCliente(id)
    if (!ok) return { success: false, error: "Cliente no encontrado" }
    revalidatePath("/dashboard/clientes")
    return { success: true, message: "Cliente eliminado" }
  }

  if (isFirebaseMode()) {
    try {
      await getAdminFirestore().collection("clientes").doc(id).delete()
      revalidatePath("/dashboard/clientes")
      return { success: true, message: "Cliente eliminado" }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
  }

  const supabase = await createClient()
  const { error } = await supabase.from("clientes").delete().eq("id", id)
  if (error) return { success: false, error: error.message }
  revalidatePath("/dashboard/clientes")
  return { success: true, message: "Cliente eliminado" }
}

// ─────────────────────────────────────────────────────────────────────────────
// SEARCH CLIENTES
// ─────────────────────────────────────────────────────────────────────────────

export async function searchClientes(query: string): Promise<ActionResponse<Cliente[]>> {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { success: false, error: "No autenticado" }
  if (!hasPermission(currentUser.rol, "clients:view")) return { success: false, error: "Sin permisos" }

  if (isLocalMode()) return { success: true, data: searchDemoClientes(query) }

  if (isFirebaseMode()) {
    try {
      const all = await fbGetAllClientes()
      const q = query.toLowerCase()
      const filtered = all
        .filter(
          (c) =>
            c.estado === "activo" &&
            (c.nombre?.toLowerCase().includes(q) ||
              (c.empresa as string | undefined)?.toLowerCase().includes(q))
        )
        .slice(0, 10)
      return { success: true, data: filtered }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("clientes")
    .select("*")
    .or(`nombre.ilike.%${query.replace(/[,().%\\]/g, "")}%,empresa.ilike.%${query.replace(/[,().%\\]/g, "")}%`)
    .eq("estado", "activo")
    .limit(10)

  if (error) return { success: false, error: error.message }
  return { success: true, data: (data ?? []) as Cliente[] }
}
