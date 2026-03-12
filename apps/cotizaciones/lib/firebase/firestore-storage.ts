import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  type WhereFilterOp,
  where,
} from "firebase/firestore"
import { getFirebaseDb } from "./config"

/** Elimina campos undefined (Firestore los rechaza) */
export function cleanDoc<T extends object>(data: T): T {
  return JSON.parse(JSON.stringify(data)) as T
}

export async function firestoreGetAll<T extends { id: string }>(
  col: string,
  orderField = "createdAt",
  dir: "asc" | "desc" = "desc",
  maxDocs = 500,
): Promise<T[]> {
  const db = getFirebaseDb()
  const q = query(collection(db, col), orderBy(orderField, dir), limit(maxDocs))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as T))
}

export async function firestoreGetById<T>(col: string, id: string): Promise<T | null> {
  const db = getFirebaseDb()
  const snap = await getDoc(doc(db, col, id))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as T
}

export async function firestoreSave<T extends { id: string }>(col: string, data: T): Promise<void> {
  const db = getFirebaseDb()
  await setDoc(doc(db, col, data.id), cleanDoc(data), { merge: true })
}

export async function firestoreDelete(col: string, id: string): Promise<void> {
  const db = getFirebaseDb()
  await deleteDoc(doc(db, col, id))
}

export async function firestoreQuery<T extends { id: string }>(
  col: string,
  field: string,
  op: WhereFilterOp,
  value: unknown,
): Promise<T[]> {
  const db = getFirebaseDb()
  const q = query(collection(db, col), where(field, op, value))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as T))
}

export async function firestoreSetField(col: string, id: string, data: Record<string, unknown>): Promise<void> {
  const db = getFirebaseDb()
  await setDoc(doc(db, col, id), cleanDoc(data), { merge: true })
}
