import { afterEach, describe, it } from "node:test"
import assert from "node:assert/strict"

import {
  getMissingFirebaseEnvKeys,
  hasFirebaseAdminConfig,
  hasFirebaseClientConfig,
  isFirebaseMode,
  isLocalMode,
  resolveTicketsDataMode,
} from "../lib/local-mode.ts"

const ORIGINAL_ENV = { ...process.env }

function restoreEnv() {
  for (const key of Object.keys(process.env)) {
    if (!(key in ORIGINAL_ENV)) {
      delete process.env[key]
    }
  }

  for (const [key, value] of Object.entries(ORIGINAL_ENV)) {
    process.env[key] = value
  }
}

function clearFirebaseEnv() {
  for (const key of [
    "TICKETS_LOCAL_MODE",
    "NEXT_PUBLIC_TICKETS_LOCAL_MODE",
    "FIREBASE_PROJECT_ID",
    "FIREBASE_CLIENT_EMAIL",
    "FIREBASE_PRIVATE_KEY",
    "NEXT_PUBLIC_FIREBASE_API_KEY",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
    "NEXT_PUBLIC_FIREBASE_APP_ID",
  ]) {
    delete process.env[key]
  }
}

function setFirebaseEnv() {
  process.env.FIREBASE_PROJECT_ID = "demo-project"
  process.env.FIREBASE_CLIENT_EMAIL = "demo@project.iam.gserviceaccount.com"
  process.env.FIREBASE_PRIVATE_KEY = "-----BEGIN PRIVATE KEY-----\\ndemo\\n-----END PRIVATE KEY-----"
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY = "api-key"
  process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = "demo.firebaseapp.com"
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = "demo-project"
  process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = "demo.appspot.com"
  process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = "123456"
  process.env.NEXT_PUBLIC_FIREBASE_APP_ID = "app-id"
}

afterEach(() => {
  restoreEnv()
})

describe("local-mode", () => {
  it("entra en modo local cuando Firebase no está configurado", () => {
    clearFirebaseEnv()
    process.env.NODE_ENV = "development"

    assert.equal(hasFirebaseAdminConfig(), false)
    assert.equal(hasFirebaseClientConfig(), false)
    assert.equal(isLocalMode(), true)
    assert.equal(isFirebaseMode(), false)
  })

  it("entra en modo Firebase cuando existen credenciales públicas y admin", () => {
    clearFirebaseEnv()
    setFirebaseEnv()

    assert.equal(hasFirebaseAdminConfig(), true)
    assert.equal(hasFirebaseClientConfig(), true)
    assert.equal(isLocalMode(), false)
    assert.equal(isFirebaseMode(), true)
  })

  it("respeta el flag explícito de modo local", () => {
    clearFirebaseEnv()
    setFirebaseEnv()
    process.env.TICKETS_LOCAL_MODE = "true"

    assert.equal(isLocalMode(), true)
    assert.equal(isFirebaseMode(), false)
  })

  it("en producción no cae a modo local implícito cuando falta Firebase", () => {
    clearFirebaseEnv()
    process.env.NODE_ENV = "production"

    assert.equal(resolveTicketsDataMode(), "firebase")
    assert.equal(isLocalMode(), false)
    assert.equal(isFirebaseMode(), true)
  })

  it("reporta las variables Firebase faltantes", () => {
    clearFirebaseEnv()
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY = "api-key"

    assert.deepEqual(getMissingFirebaseEnvKeys(), [
      "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
      "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
      "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
      "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
      "NEXT_PUBLIC_FIREBASE_APP_ID",
      "FIREBASE_PROJECT_ID",
      "FIREBASE_CLIENT_EMAIL",
      "FIREBASE_PRIVATE_KEY",
    ])
  })
})
