import { initializeApp, getApps, cert, type App } from "firebase-admin/app"
import { getFirestore, type Firestore } from "firebase-admin/firestore"
import { getAuth, type Auth } from "firebase-admin/auth"
import { getStorage, type Storage } from "firebase-admin/storage"

function getAdminApp(): App {
  if (getApps().length > 0) return getApps()[0]!

  const privateKey = (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n")

  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      privateKey,
    }),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  })
}

export function getAdminFirestore(): Firestore {
  return getFirestore(getAdminApp())
}

export function getAdminAuth(): Auth {
  return getAuth(getAdminApp())
}

export function getAdminStorage(): Storage {
  return getStorage(getAdminApp())
}

/** Elimina campos undefined — Firestore los rechaza */
export function cleanForFirestore<T extends object>(obj: T): T {
  return JSON.parse(JSON.stringify(obj)) as T
}

/** Convierte Timestamps de Firestore a ISO strings */
export function fromFirestoreDoc<T>(id: string, data: FirebaseFirestore.DocumentData): T {
  const cleaned: Record<string, unknown> = { id }
  for (const [key, val] of Object.entries(data)) {
    if (val && typeof val === "object" && "toDate" in val && typeof val.toDate === "function") {
      cleaned[key] = (val.toDate() as Date).toISOString()
    } else {
      cleaned[key] = val
    }
  }
  return cleaned as T
}
