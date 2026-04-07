/**
 * Cloud Storage abstraction — Firebase Storage REST API or Cloudinary
 *
 * Priority:
 *   1. Cloudinary  — if CLOUDINARY_CLOUD_NAME is set (free, no billing country needed)
 *   2. Firebase Storage REST API — fallback using service-account JWT + GCS API
 *
 * Only built-in Node.js APIs (crypto + fetch), no extra packages.
 */

import crypto from "crypto"

// ── Cloudinary config ─────────────────────────────────────────────────────────
const CLOUDINARY_CLOUD = process.env.CLOUDINARY_CLOUD_NAME ?? ""
const CLOUDINARY_PRESET = process.env.CLOUDINARY_UPLOAD_PRESET ?? ""
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY ?? ""
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET ?? ""

// ── Firebase Storage config ───────────────────────────────────────────────────
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

// ── Cloudinary ────────────────────────────────────────────────────────────────

/**
 * Upload via Cloudinary.
 * Uses signed upload (API key + secret) if available — no preset needed.
 * Falls back to unsigned upload with a preset.
 */
async function cloudinaryUpload(
  storagePath: string,
  buffer: Buffer,
  contentType: string
): Promise<{ url: string; publicId: string }> {
  if (!CLOUDINARY_CLOUD) throw new Error("CLOUDINARY_CLOUD_NAME no configurado")

  const publicId = storagePath.replace(/\//g, "__")
  const blob = new Blob([buffer], { type: contentType })
  const filename = storagePath.split("/").pop() ?? "file"

  const form = new FormData()
  form.append("file", blob, filename)
  form.append("resource_type", "auto")

  if (CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET) {
    // Signed upload — no preset required
    const timestamp = Math.floor(Date.now() / 1000)
    const paramsToSign = `public_id=${publicId}&timestamp=${timestamp}`
    const signature = crypto
      .createHash("sha256")
      .update(paramsToSign + CLOUDINARY_API_SECRET)
      .digest("hex")

    form.append("api_key", CLOUDINARY_API_KEY)
    form.append("timestamp", String(timestamp))
    form.append("public_id", publicId)
    form.append("signature", signature)
  } else if (CLOUDINARY_PRESET) {
    // Unsigned upload with preset
    form.append("upload_preset", CLOUDINARY_PRESET)
    form.append("public_id", publicId)
  } else {
    throw new Error("Cloudinary: configura CLOUDINARY_API_KEY + CLOUDINARY_API_SECRET o CLOUDINARY_UPLOAD_PRESET")
  }

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/auto/upload`,
    { method: "POST", body: form }
  )

  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`Cloudinary upload fallido (${res.status}): ${txt}`)
  }

  const data = (await res.json()) as { secure_url: string; public_id: string }
  return { url: data.secure_url, publicId: data.public_id }
}

/** Delete from Cloudinary using API key + secret (signed request). */
async function cloudinaryDelete(publicId: string): Promise<void> {
  if (!CLOUDINARY_CLOUD || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) return

  try {
    const timestamp = Math.floor(Date.now() / 1000)
    const str = `public_id=${publicId}&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`
    const signature = crypto.createHash("sha1").update(str).digest("hex")

    const form = new FormData()
    form.append("public_id", publicId)
    form.append("timestamp", String(timestamp))
    form.append("api_key", CLOUDINARY_API_KEY)
    form.append("signature", signature)

    await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/auto/destroy`, {
      method: "POST",
      body: form,
    })
  } catch {
    // Non-fatal
  }
}

// ── Cloudinary URL store (publicId → url) ────────────────────────────────────
// After upload, Cloudinary returns a permanent URL. We store publicId in
// storage_path as "cloudinary::{publicId}" so we can reconstruct the URL.

// storagePath format for Cloudinary: "cloudinary::{publicId}::{secureUrl}"
// This way we always have the download URL without extra API calls.
const CLOUDINARY_PREFIX = "cloudinary::"

function isCloudinaryPath(storagePath: string): boolean {
  return storagePath.startsWith(CLOUDINARY_PREFIX)
}

function extractCloudinaryParts(storagePath: string): { publicId: string; url: string } {
  const withoutPrefix = storagePath.replace(CLOUDINARY_PREFIX, "")
  const sepIdx = withoutPrefix.indexOf("::")
  if (sepIdx === -1) return { publicId: withoutPrefix, url: "" }
  return {
    publicId: withoutPrefix.slice(0, sepIdx),
    url: withoutPrefix.slice(sepIdx + 2),
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Upload a file to Cloudinary (if configured) or Firebase Storage REST.
 * Returns the storagePath to persist in the DB.
 *
 * For Cloudinary, storagePath is "cloudinary::{publicId}".
 * For Firebase, storagePath is the GCS object path.
 */
export async function uploadFileToStorage(
  storagePath: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  if (CLOUDINARY_CLOUD) {
    const { publicId, url } = await cloudinaryUpload(storagePath, buffer, contentType)
    return `${CLOUDINARY_PREFIX}${publicId}::${url}`
  }

  // Firebase Storage REST fallback
  if (!BUCKET) throw new Error(
    "CLOUDINARY_CLOUD_NAME no está configurado. " +
    "Agrega CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET en Vercel → Settings → Environment Variables y redespliega."
  )

  const token = await getAccessToken()
  const encodedPath = encodeURIComponent(storagePath)
  const url = `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(BUCKET)}/o?uploadType=media&name=${encodedPath}`

  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": contentType },
    body: buffer,
  })

  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`Storage upload fallido (${res.status}): ${txt}`)
  }

  return storagePath
}

/**
 * Get a download URL for the stored file.
 * Cloudinary URLs are permanent and don't need signing.
 */
export async function getSignedDownloadUrl(storagePath: string): Promise<string> {
  if (isCloudinaryPath(storagePath)) {
    // URL is embedded in the storage_path — no extra API call needed
    return extractCloudinaryParts(storagePath).url
  }

  // Firebase Storage: return URL with access token
  if (!BUCKET) return ""
  try {
    const token = await getAccessToken()
    const encodedPath = encodeURIComponent(storagePath)
    return `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(BUCKET)}/o/${encodedPath}?alt=media&access_token=${token}`
  } catch {
    return ""
  }
}

/**
 * Delete a stored file.
 */
export async function deleteFileFromStorage(storagePath: string): Promise<void> {
  if (isCloudinaryPath(storagePath)) {
    await cloudinaryDelete(extractCloudinaryParts(storagePath).publicId)
    return
  }

  // Firebase Storage delete
  if (!BUCKET) return
  try {
    const token = await getAccessToken()
    const encodedPath = encodeURIComponent(storagePath)
    await fetch(
      `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(BUCKET)}/o/${encodedPath}`,
      { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
    )
  } catch {
    // Non-fatal
  }
}
