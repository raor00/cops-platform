"use server"

import { revalidatePath } from "next/cache"
import type { ActionResponse, AppNotification, AppNotificationType, UserProfile } from "@/types"
import { getCurrentUser } from "./auth"
import { isFirebaseMode, isLocalMode } from "@/lib/local-mode"
import { addDemoNotification, getDemoConfig, getDemoNotificationsByUser, getDemoUsers, markDemoNotificationsRead } from "@/lib/mock-data"
import { cleanForFirestore, fromFirestoreDoc, getAdminFirestore } from "@/lib/firebase/admin"

function parseRecipientIds(raw?: string | null): string[] {
  return (raw ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
}

async function getAdministrativeNotificationRecipients(): Promise<string[]> {
  if (isLocalMode()) {
    const users = getDemoUsers()
    const config = getDemoConfig().find((item) => item.clave === "notif_user_admin_recipient_ids")
    const configured = parseRecipientIds(config?.valor)
    const presidents = users.filter((user) => user.rol === "presidente").map((user) => user.id)
    return [...new Set([...presidents, ...configured])]
  }

  if (isFirebaseMode()) {
    const db = getAdminFirestore()
    const [usersSnap, configDoc] = await Promise.all([
      db.collection("users").where("rol", "==", "presidente").get(),
      db.collection("configuracion").doc("notif_user_admin_recipient_ids").get(),
    ])

    const presidents = usersSnap.docs.filter((doc) => doc.data().hidden !== true).map((doc) => doc.id)
    const configured = parseRecipientIds(configDoc.exists ? String(configDoc.data()?.valor ?? "") : "")
    return [...new Set([...presidents, ...configured])]
  }

  return []
}

export async function notifyAdministrativeUserEvent(input: {
  actor: Pick<UserProfile, "id" | "nombre" | "apellido">
  affectedUser: Pick<UserProfile, "id" | "nombre" | "apellido" | "rol" | "estado">
  type: AppNotificationType
  title: string
  message: string
}): Promise<void> {
  const recipients = await getAdministrativeNotificationRecipients()
  const finalRecipients = recipients.filter((recipientId) => recipientId !== input.actor.id)
  if (finalRecipients.length === 0) return

  if (isLocalMode()) {
    finalRecipients.forEach((recipientId) => {
      addDemoNotification({
        user_id: recipientId,
        title: input.title,
        message: input.message,
        type: input.type,
        entity_type: "user",
        entity_id: input.affectedUser.id,
      })
    })
    return
  }

  if (isFirebaseMode()) {
    const db = getAdminFirestore()
    const batch = db.batch()
    const now = new Date().toISOString()

    finalRecipients.forEach((recipientId) => {
      const ref = db.collection("notifications").doc()
      batch.set(ref, cleanForFirestore({
        user_id: recipientId,
        title: input.title,
        message: input.message,
        type: input.type,
        entity_type: "user",
        entity_id: input.affectedUser.id,
        read_at: null,
        created_at: now,
      }))
    })

    await batch.commit()
  }
}

export async function getMyNotifications(limit = 8): Promise<ActionResponse<AppNotification[]>> {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { success: false, error: "No autenticado" }

  if (isLocalMode()) {
    return { success: true, data: getDemoNotificationsByUser(currentUser.id).slice(0, limit) }
  }

  if (isFirebaseMode()) {
    try {
      const db = getAdminFirestore()
      const snap = await db
        .collection("notifications")
        .where("user_id", "==", currentUser.id)
        .orderBy("created_at", "desc")
        .limit(limit)
        .get()

      return {
        success: true,
        data: snap.docs.map((doc) => fromFirestoreDoc<AppNotification>(doc.id, doc.data())),
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "No se pudieron cargar las notificaciones" }
    }
  }

  return { success: false, error: "Notificaciones requieren configuración Firebase válida" }
}

export async function markMyNotificationsRead(): Promise<ActionResponse> {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { success: false, error: "No autenticado" }

  if (isLocalMode()) {
    markDemoNotificationsRead(currentUser.id)
    return { success: true }
  }

  if (isFirebaseMode()) {
    try {
      const db = getAdminFirestore()
      const snap = await db.collection("notifications").where("user_id", "==", currentUser.id).where("read_at", "==", null).get()
      const batch = db.batch()
      const now = new Date().toISOString()
      snap.docs.forEach((doc) => batch.update(doc.ref, { read_at: now }))
      await batch.commit()
      revalidatePath("/dashboard", "layout")
      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "No se pudieron actualizar las notificaciones" }
    }
  }

  return { success: false, error: "Notificaciones requieren configuración Firebase válida" }
}
