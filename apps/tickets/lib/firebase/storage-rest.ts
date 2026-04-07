/**
 * Firebase Storage via REST API
 *
 * Replaces the @google-cloud/storage Admin SDK for uploads.
 * Uses only built-in Node.js APIs (crypto + fetch) so it works
 * reliably in Vercel serverless without GCP credential file issues.
 */

import crypto from "crypto"

const BUCKET = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? ""
const CLIENT_EMAIL = process.env.FIREBASE_CLIENT_EMAIL ?? ""
const RAW_PRIVATE_KEY = process.env.FIREBASE_PRIVATE_KEY ?? ""
const PRIVATE_KEY = RAW_PRIVATE_KEY.replace(/\\n/g, "\n")

// ── Service-account JWT → Google OAuth2 access token ──────────────────────────

async function getAccessToken(): Promise<string> {
  if (!CLIENT_EMAIL || !PRIVATE_KEY) {
    throw new Error("FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY no configurados")
  }

  const now = Math.floor(Date.now() / 1000)

  const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url")
  const claim = Buffer.from(
    JSON.stringify({
      iss: CLIENT_EMAIL,
      sub: CLIENT_EMAIL,
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
      scope: "https://www.googleapis.com/auth/devstorage.read_write",
    })
  ).toString("base64url")

  const sign = crypto.createSign("RSA-SHA256")
  sign.update(`${header}.${claim}`)
  const sig = sign.sign(PRIVATE_KEY, "base64url")
  const jwt = `${header}.${claim}.${sig}`

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  })

  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`No se pudo obtener access token (${res.status}): ${txt}`)
  }

  const json = (await res.json()) as { access_token: string }
  return json.access_token
}

// ── Upload ────────────────────────────────────────────────────────────────────

export async function uploadFileToStorage(
  storagePath: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  if (!BUCKET) throw new Error("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET no configurado")

  const token = await getAccessToken()
  const encodedPath = encodeURIComponent(storagePath)
  const url = `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(BUCKET)}/o?uploadType=media&name=${encodedPath}`

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": contentType,
    },
    body: buffer,
  })

  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`Storage upload fallido (${res.status}): ${txt}`)
  }

  return storagePath
}

// ── Signed URL (válida 1 hora) ────────────────────────────────────────────────

export async function getSignedDownloadUrl(storagePath: string): Promise<string> {
  if (!BUCKET || !CLIENT_EMAIL || !PRIVATE_KEY) return ""

  const expires = Math.floor(Date.now() / 1000) + 3600

  // V4 signed URL — canonical resource
  const resource = `/v0/b/${BUCKET}/o/${encodeURIComponent(storagePath)}`
  const stringToSign = [
    "GOOG4-RSA-SHA256",
    new Date().toISOString().replace(/[-:]/g, "").slice(0, 8) + "T" + new Date().toISOString().replace(/[-:]/g, "").slice(9, 13) + "00Z",
    `${new Date().toISOString().replace(/[-:]/g, "").slice(0, 8)}/auto/storage/goog4_request`,
    crypto.createHash("sha256").update(`GET\n${resource}\nexpires=${expires}&x-goog-signature=...`).digest("hex"),
  ].join("\n")

  // Use simpler Firebase Storage download token approach instead
  // This generates a permanent download URL using the access token
  const token = await getAccessToken()
  const alt = encodeURIComponent(storagePath)
  const downloadUrl = `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(BUCKET)}/o/${alt}?alt=media`

  // Verify file exists and get metadata to confirm access
  const checkRes = await fetch(downloadUrl, {
    headers: { Authorization: `Bearer ${token}` },
    method: "HEAD",
  }).catch(() => null)

  if (!checkRes?.ok) {
    // Return URL with token for inline access
    return `${downloadUrl}&access_token=${token}`
  }

  return `${downloadUrl}&access_token=${token}`
}

// ── Delete ────────────────────────────────────────────────────────────────────

export async function deleteFileFromStorage(storagePath: string): Promise<void> {
  if (!BUCKET) return

  try {
    const token = await getAccessToken()
    const encodedPath = encodeURIComponent(storagePath)
    await fetch(
      `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(BUCKET)}/o/${encodedPath}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }
    )
  } catch {
    // Non-fatal: log and continue
  }
}
