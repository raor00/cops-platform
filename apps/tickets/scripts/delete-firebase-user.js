#!/usr/bin/env node

const { initializeApp, cert, getApps } = require("firebase-admin/app")
const { getAuth } = require("firebase-admin/auth")
const { getFirestore } = require("firebase-admin/firestore")

function getAdminApp() {
  if (getApps().length > 0) return getApps()[0]

  const privateKey = (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n")

  if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !privateKey) {
    throw new Error("Faltan credenciales Firebase Admin: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY")
  }

  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey,
    }),
  })
}

async function main() {
  const [, , uid, ...flags] = process.argv
  const dryRun = flags.includes("--dry-run")

  if (!uid) {
    console.error("Uso: node scripts/delete-firebase-user.js <uid> [--dry-run]")
    process.exit(1)
  }

  const app = getAdminApp()
  const auth = getAuth(app)
  const db = getFirestore(app)

  const userRef = db.collection("users").doc(uid)
  const userDoc = await userRef.get()

  if (!userDoc.exists) {
    console.log(`Firestore: no existe documento users/${uid}`)
  } else {
    console.log("Firestore profile:", { id: uid, ...userDoc.data() })
  }

  try {
    const authUser = await auth.getUser(uid)
    console.log("Auth user:", { uid: authUser.uid, email: authUser.email || null, disabled: authUser.disabled })
  } catch (error) {
    console.log(`Auth: no existe usuario ${uid} o no pudo leerse (${error.message})`)
  }

  if (dryRun) {
    console.log("Dry run completado. No se eliminó nada.")
    return
  }

  if (userDoc.exists) {
    await userRef.delete()
    console.log(`Eliminado Firestore users/${uid}`)
  }

  try {
    await auth.deleteUser(uid)
    console.log(`Eliminado Firebase Auth ${uid}`)
  } catch (error) {
    console.log(`Auth: no se eliminó ${uid} (${error.message})`)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
