/**
 * Cloud Storage abstraction — Cloudinary (priority) or Firebase Storage REST (fallback)
 *
 * IMPORTANT: All process.env reads happen inside functions, never at module level.
 * Next.js serverless can snapshot module-level constants at build time, meaning
 * env vars added after the initial build would not be picked up. Reading inside
 * functions guarantees runtime values every time.
 */

import crypto from "crypto"

// ── Config helpers — called at runtime, not at module load ───────────────────

function parseCloudinaryUrl(url: string): { cloud: string; key: string; secret: string } | null {
  try {
    // cloudinary://API_KEY:API_SECRET@CLOUD_NAME
    const match = url.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/)
    if (!match) return null
    return { key: match[1], secret: match[2], cloud: match[3] }
  } catch { return null }
}

function getCloudinaryConfig() {
  const parsed = parseCloudinaryUrl(process.env.CLOUDINARY_URL ?? "")
  return {
    cloud: (process.env.CLOUDINARY_CLOUD_NAME ?? parsed?.cloud ?? "").trim(),
    key: (process.env.CLOUDINARY_API_KEY ?? parsed?.key ?? "").trim(),
    secret: (process.env.CLOUDINARY_API_SECRET ?? parsed?.secret ?? "").trim(),
    preset: (process.env.CLOUDINARY_UPLOAD_PRESET ?? "").trim(),
  }
}

function getFirebaseConfig() {
  const rawKey = process.env.FIREBASE_PRIVATE_KEY ?? ""
  return {
    bucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL ?? "",
    privateKey: rawKey.replace(/\\n/g, "\n"),
  }
}

// ── Cloudinary path helpers ───────────────────────────────────────────────────

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

// ── Firebase access token ─────────────────────────────────────────────────────

async function getAccessToken(): Promise<string> {
  const { clientEmail, privateKey } = getFirebaseConfig()
  if (!clientEmail || !privateKey) {
    throw new Error("FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY no configurados")
  }

  const now = Math.floor(Date.now() / 1000)
  const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url")
  const claim = Buffer.from(
    JSON.stringify({
      iss: clientEmail,
      sub: clientEmail,
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
      scope: "https://www.googleapis.com/auth/devstorage.read_write",
    })
  ).toString("base64url")

  const sign = crypto.createSign("RSA-SHA256")
  sign.update(`${header}.${claim}`)
  const sig = sign.sign(privateKey, "base64url")
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

// ── Cloudinary upload ─────────────────────────────────────────────────────────

async function cloudinaryUpload(
  storagePath: string,
  buffer: Buffer,
  contentType: string
): Promise<{ url: string; publicId: string }> {
  const { cloud, key, secret, preset } = getCloudinaryConfig()
  if (!cloud) throw new Error("CLOUDINARY_CLOUD_NAME no configurado")

  const publicId = storagePath.replace(/\//g, "__")
  const blob = new Blob([buffer], { type: contentType })
  const filename = storagePath.split("/").pop() ?? "file"

  const form = new FormData()
  form.append("file", blob, filename)
  form.append("resource_type", "auto")

  if (key && secret) {
    const timestamp = Math.floor(Date.now() / 1000)
    const paramsToSign = `public_id=${publicId}&timestamp=${timestamp}`
    const signature = crypto
      .createHash("sha256")
      .update(paramsToSign + secret)
      .digest("hex")

    form.append("api_key", key)
    form.append("timestamp", String(timestamp))
    form.append("public_id", publicId)
    form.append("signature", signature)
  } else if (preset) {
    form.append("upload_preset", preset)
    form.append("public_id", publicId)
  } else {
    throw new Error("Cloudinary: configura CLOUDINARY_API_KEY + CLOUDINARY_API_SECRET o CLOUDINARY_UPLOAD_PRESET")
  }

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloud}/auto/upload`,
    { method: "POST", body: form }
  )

  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`Cloudinary upload fallido (${res.status}): ${txt}`)
  }

  const data = (await res.json()) as { secure_url: string; public_id: string }
  return { url: data.secure_url, publicId: data.public_id }
}

async function cloudinaryDelete(publicId: string): Promise<void> {
  const { cloud, key, secret } = getCloudinaryConfig()
  if (!cloud || !key || !secret) return

  try {
    const timestamp = Math.floor(Date.now() / 1000)
    const str = `public_id=${publicId}&timestamp=${timestamp}${secret}`
    const signature = crypto.createHash("sha1").update(str).digest("hex")

    const form = new FormData()
    form.append("public_id", publicId)
    form.append("timestamp", String(timestamp))
    form.append("api_key", key)
    form.append("signature", signature)

    await fetch(`https://api.cloudinary.com/v1_1/${cloud}/auto/destroy`, {
      method: "POST",
      body: form,
    })
  } catch {
    // Non-fatal
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function uploadFileToStorage(
  storagePath: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  const { cloud } = getCloudinaryConfig()

  if (cloud) {
    const { publicId, url } = await cloudinaryUpload(storagePath, buffer, contentType)
    return `${CLOUDINARY_PREFIX}${publicId}::${url}`
  }

  // Firebase Storage REST fallback
  const { bucket } = getFirebaseConfig()
  if (!bucket) {
    throw new Error(
      "No hay proveedor de almacenamiento configurado. " +
      "Configura CLOUDINARY_CLOUD_NAME (+ API_KEY + API_SECRET) en Vercel y redespliega."
    )
  }

  const token = await getAccessToken()
  const encodedPath = encodeURIComponent(storagePath)
  const url = `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(bucket)}/o?uploadType=media&name=${encodedPath}`

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

export async function getSignedDownloadUrl(storagePath: string): Promise<string> {
  if (isCloudinaryPath(storagePath)) {
    return extractCloudinaryParts(storagePath).url
  }

  const { bucket } = getFirebaseConfig()
  if (!bucket) return ""
  try {
    const token = await getAccessToken()
    const encodedPath = encodeURIComponent(storagePath)
    return `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(bucket)}/o/${encodedPath}?alt=media&access_token=${token}`
  } catch {
    return ""
  }
}

export async function deleteFileFromStorage(storagePath: string): Promise<void> {
  if (isCloudinaryPath(storagePath)) {
    await cloudinaryDelete(extractCloudinaryParts(storagePath).publicId)
    return
  }

  const { bucket } = getFirebaseConfig()
  if (!bucket) return
  try {
    const token = await getAccessToken()
    const encodedPath = encodeURIComponent(storagePath)
    await fetch(
      `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(bucket)}/o/${encodedPath}`,
      { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
    )
  } catch {
    // Non-fatal
  }
}
