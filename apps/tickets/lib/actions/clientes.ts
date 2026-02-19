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
import { isLocalMode } from "@/lib/local-mode"
import {
  getDemoClientes,
  getDemoClienteById,
  createDemoCliente,
  updateDemoCliente,
  deleteDemoCliente,
  searchDemoClientes,
} from "@/lib/mock-data"

// ─────────────────────────────────────────────────────────────────────────────
// GET CLIENTES (paginado + búsqueda)
// ─────────────────────────────────────────────────────────────────────────────

export async function getClientes(
  options: { page?: number; pageSize?: number; search?: string; estado?: string } = {}
): Promise<ActionResponse<PaginatedResponse<Cliente>>> {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { success: false, error: "No autenticado" }
  if (!hasPermission(currentUser.rol, "clients:view")) return { success: false, error: "Sin permisos" }

  if (isLocalMode()) {
    const data = getDemoClientes(options)
    return { success: true, data }
  }

  const supabase = await createClient()
  const page = options.page || 1
  const pageSize = options.pageSize || 20
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase.from("clientes").select("*", { count: "exact" })

  if (options.search) {
    const s = options.search
    query = query.or(`nombre.ilike.%${s}%,empresa.ilike.%${s}%,rif_cedula.ilike.%${s}%`)
  }
  if (options.estado) {
    query = query.eq("estado", options.estado)
  }

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
// DELETE CLIENTE (gerente+)
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

  const supabase = await createClient()
  const { error } = await supabase.from("clientes").delete().eq("id", id)
  if (error) return { success: false, error: error.message }
  revalidatePath("/dashboard/clientes")
  return { success: true, message: "Cliente eliminado" }
}

// ─────────────────────────────────────────────────────────────────────────────
// SEARCH CLIENTES (autocomplete)
// ─────────────────────────────────────────────────────────────────────────────

export async function searchClientes(query: string): Promise<ActionResponse<Cliente[]>> {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { success: false, error: "No autenticado" }
  if (!hasPermission(currentUser.rol, "clients:view")) return { success: false, error: "Sin permisos" }

  if (isLocalMode()) {
    return { success: true, data: searchDemoClientes(query) }
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("clientes")
    .select("*")
    .or(`nombre.ilike.%${query}%,empresa.ilike.%${query}%`)
    .eq("estado", "activo")
    .limit(10)

  if (error) return { success: false, error: error.message }
  return { success: true, data: (data ?? []) as Cliente[] }
}
