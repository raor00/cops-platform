import { addDoc, collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore"
import type { Cliente, ClienteCreateInput } from "@cops/shared"
import type { ActionResponse } from "./catalogo-firestore"
import { getFirebaseDb } from "./firebase/config"
import { cleanDoc } from "./firebase/firestore-storage"

const COLLECTION_NAME = "clientes"

type ClienteRecord = Partial<Cliente>

function normalizeCliente(id: string, input: ClienteRecord): Cliente {
  const now = new Date().toISOString()

  return {
    id,
    nombre: String(input.nombre ?? "").trim(),
    apellido: input.apellido?.trim() || "",
    empresa: input.empresa?.trim() || "",
    email: input.email?.trim() || "",
    telefono: String(input.telefono ?? "").trim(),
    direccion: String(input.direccion ?? "").trim(),
    rif_cedula: input.rif_cedula?.trim() || "",
    estado: input.estado === "inactivo" ? "inactivo" : "activo",
    observaciones: input.observaciones?.trim() || "",
    contactos: input.contactos ?? [],
    created_at: input.created_at ?? now,
    updated_at: input.updated_at ?? input.created_at ?? now,
  }
}

function getClienteSearchIndex(cliente: Cliente): string {
  return [cliente.nombre, cliente.apellido, cliente.empresa, cliente.telefono, cliente.email, cliente.rif_cedula]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
}

function validateCliente(input: Pick<Cliente, "nombre" | "telefono" | "direccion">): string | null {
  if (!input.nombre.trim()) return "El nombre del cliente es obligatorio"
  if (!input.telefono.trim()) return "El teléfono del cliente es obligatorio"
  if (!input.direccion.trim()) return "La dirección del cliente es obligatoria"
  return null
}

let _clientesCache: Cliente[] | null = null
let _cacheTimestamp = 0
const CACHE_TTL = 60000 // 1 minuto

async function listClientes(): Promise<Cliente[]> {
  const now = Date.now()
  if (_clientesCache && now - _cacheTimestamp < CACHE_TTL) {
    return _clientesCache
  }

  const db = getFirebaseDb()
  const snapshot = await getDocs(collection(db, COLLECTION_NAME))

  const clientes = snapshot.docs
    .map((itemDoc) => normalizeCliente(itemDoc.id, itemDoc.data() as ClienteRecord))
    .sort((a, b) => {
      const companyA = (a.empresa || `${a.nombre} ${a.apellido || ""}`).trim()
      const companyB = (b.empresa || `${b.nombre} ${b.apellido || ""}`).trim()
      return companyA.localeCompare(companyB, "es", { sensitivity: "base" })
    })

  _clientesCache = clientes
  _cacheTimestamp = now
  return clientes
}

export function invalidateClientesCache(): void {
  _clientesCache = null
  _cacheTimestamp = 0
}

export async function getClientes(): Promise<ActionResponse<Cliente[]>> {
  try {
    const clientes = await listClientes()
    return { success: true, data: clientes.filter((cliente) => cliente.estado === "activo") }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

export async function searchClientes(query: string): Promise<ActionResponse<Cliente[]>> {
  try {
    const clientes = await listClientes()
    const normalizedQuery = query.trim().toLowerCase()
    const activeClientes = clientes.filter((cliente) => cliente.estado === "activo")

    if (!normalizedQuery) {
      return { success: true, data: activeClientes.slice(0, 20) }
    }

    const results = activeClientes.filter((cliente) => getClienteSearchIndex(cliente).includes(normalizedQuery))
    return { success: true, data: results.slice(0, 20) }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

export async function getClienteById(id: string): Promise<ActionResponse<Cliente>> {
  try {
    if (!id.trim()) return { success: false, error: "El ID del cliente es obligatorio" }

    const db = getFirebaseDb()
    const clienteDoc = await getDoc(doc(db, COLLECTION_NAME, id))

    if (!clienteDoc.exists()) return { success: false, error: "Cliente no encontrado" }

    return {
      success: true,
      data: normalizeCliente(clienteDoc.id, clienteDoc.data() as ClienteRecord),
    }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

export async function createCliente(input: ClienteCreateInput): Promise<ActionResponse<Cliente>> {
  try {
    const normalized = normalizeCliente("temp", {
      ...input,
      estado: input.estado ?? "activo",
    })

    const validationError = validateCliente(normalized)
    if (validationError) return { success: false, error: validationError }

    const db = getFirebaseDb()
    const now = new Date().toISOString()
    const payload = cleanDoc({
      ...normalized,
      created_at: now,
      updated_at: now,
    })

    const docRef = await addDoc(collection(db, COLLECTION_NAME), payload)
    const cliente = normalizeCliente(docRef.id, { ...payload, id: docRef.id })

    await setDoc(doc(db, COLLECTION_NAME, docRef.id), cleanDoc(cliente), { merge: true })

    invalidateClientesCache()

    return { success: true, data: cliente, message: "Cliente creado exitosamente" }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}
