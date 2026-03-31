import { afterEach, describe, it } from "node:test"
import assert from "node:assert/strict"
import { createHmac } from "node:crypto"

import { verifyTicketsBridgeToken } from "../lib/platform-bridge.ts"

const ORIGINAL_SECRET = process.env.PLATFORM_TICKETS_BRIDGE_SECRET

function encode(value: unknown) {
  return Buffer.from(JSON.stringify(value)).toString("base64url")
}

function signToken(payload: Record<string, unknown>, secret: string) {
  const header = encode({ alg: "HS256", typ: "COPS-BRIDGE" })
  const body = encode(payload)
  const signature = createHmac("sha256", secret)
    .update(`${header}.${body}`)
    .digest("base64url")

  return `${header}.${body}.${signature}`
}

afterEach(() => {
  if (ORIGINAL_SECRET === undefined) {
    delete process.env.PLATFORM_TICKETS_BRIDGE_SECRET
  } else {
    process.env.PLATFORM_TICKETS_BRIDGE_SECRET = ORIGINAL_SECRET
  }
})

describe("platform-bridge", () => {
  it("acepta tokens válidos firmados con el secreto compartido", () => {
    process.env.PLATFORM_TICKETS_BRIDGE_SECRET = "1234567890abcdef"
    const now = Math.floor(Date.now() / 1000)
    const token = signToken(
      {
        sub: "user-123",
        role: "gerente",
        iat: now - 5,
        exp: now + 300,
        nonce: "nonce-1",
      },
      process.env.PLATFORM_TICKETS_BRIDGE_SECRET,
    )

    const result = verifyTicketsBridgeToken(token)

    assert.equal(result.valid, true)
    if (result.valid) {
      assert.equal(result.payload.sub, "user-123")
      assert.equal(result.payload.role, "gerente")
    }
  })

  it("rechaza tokens expirados", () => {
    process.env.PLATFORM_TICKETS_BRIDGE_SECRET = "1234567890abcdef"
    const now = Math.floor(Date.now() / 1000)
    const token = signToken(
      {
        sub: "user-123",
        role: "gerente",
        iat: now - 300,
        exp: now - 10,
        nonce: "nonce-1",
      },
      process.env.PLATFORM_TICKETS_BRIDGE_SECRET,
    )

    const result = verifyTicketsBridgeToken(token)
    assert.equal(result.valid, false)
    if (!result.valid) {
      assert.equal(result.reason, "expired")
    }
  })
})
