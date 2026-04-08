/**
 * Cloud Storage abstraction — Cloudinary (priority) or Firebase Storage REST (fallback)
 *
 * IMPORTANT: All process.env reads happen inside functions, never at module level.
 * Next.js serverless can snapshot module-level constants at build time, meaning
 * env vars added after the initial build would not be picked up. Reading inside
 * functions guarantees runtime values every time.
 */

import crypto from "crypto"
import { getAdminStorage } from "@/lib/firebase/admin"

// ── Config helpers — called at runtime, not at module load ───────────────────

function parseCloudinaryUrl(url: string): { cloud: string; key: string; secret: string } | null {
  try {
    // cloudinary://API_KEY:API_SECRET@CLOUD_NAME
    const normalized = url.trim().replace(/[<>]/g, "")
    const match = normalized.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/)
    if (!match) return null
    return { key: match[1], secret: match[2], cloud: match[3] }
  } catch { return null }
}

function getCloudinaryConfig() {
  const parsed = parseCloudinaryUrl(process.env.CLOUDINARY_URL ?? process.env.NEXT_PUBLIC_CLOUDINARY_URL ?? "")
  return {
    cloud: (
      process.env.CLOUDINARY_CLOUD_NAME ??
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ??
      process.env.CLOUDINARY_CLOUD ??
      parsed?.cloud ??
      ""
    ).trim(),
    key: (
      process.env.CLOUDINARY_API_KEY ??
      process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY ??
      parsed?.key ??
      ""
    ).trim(),
    secret: (process.env.CLOUDINARY_API_SECRET ?? parsed?.secret ?? "").trim(),
    preset: (
      process.env.CLOUDINARY_UPLOAD_PRESET ??
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ??
      ""
    ).trim(),
  }
}

function hasAnyCloudinaryEnv() {
  return Boolean(
    process.env.CLOUDINARY_URL ||
    process.env.NEXT_PUBLIC_CLOUDINARY_URL ||
    process.env.CLOUDINARY_CLOUD_NAME ||
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
    process.env.CLOUDINARY_CLOUD ||
    process.env.CLOUDINARY_API_KEY ||
    process.env.CLOUDINARY_API_SECRET ||
    process.env.CLOUDINARY_UPLOAD_PRESET ||
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
  )
}

function getFirebaseConfig() {
  const projectId = (process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "").trim()
  return {
    projectId,
    bucket: (process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "")
      .replace(/^gs:\/\//, "")
      .trim(),
    adminBucket: (process.env.FIREBASE_STORAGE_BUCKET ?? "")
      .replace(/^gs:\/\//, "")
      .trim(),
  }
}

function getFirebaseBucketCandidates(): string[] {
  const { bucket, adminBucket, projectId } = getFirebaseConfig()
  return [...new Set([
    bucket,
    adminBucket,
    projectId ? `${projectId}.firebasestorage.app` : "",
    projectId ? `${projectId}.appspot.com` : "",
  ].filter(Boolean))]
}

async function discoverFirebaseBuckets(): Promise<string[]> {
  try {
    const storage = getAdminStorage() as unknown as {
      getBuckets?: () => Promise<[Array<{ name: string }>]>
    }

    if (!storage.getBuckets) return []

    const [buckets] = await storage.getBuckets()
    return buckets.map((bucket) => bucket.name).filter(Boolean)
  } catch {
    return []
  }
}

async function getFirebaseBucketNamesOrThrow(): Promise<string[]> {
  const discovered = await discoverFirebaseBuckets()
  const candidates = [...new Set([...getFirebaseBucketCandidates(), ...discovered])]
  if (candidates.length === 0) {
    throw new Error(
      "No hay proveedor de almacenamiento configurado. Configura FIREBASE_STORAGE_BUCKET o NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET, o Cloudinary."
    )
  }

  return candidates
}

async function withFirebaseBucketFallback<T>(
  operation: (bucketName: string) => Promise<T>
): Promise<T> {
  const candidates = await getFirebaseBucketNamesOrThrow()
  let lastError: unknown = null

  for (const bucketName of candidates) {
    try {
      return await operation(bucketName)
    } catch (error) {
      lastError = error
      const message = error instanceof Error ? error.message : String(error)
      if (!message.toLowerCase().includes("bucket does not exist")) {
        throw error
      }
    }
  }

  throw lastError instanceof Error
    ? new Error(`No se encontró un bucket válido para Storage. Intentados: ${candidates.join(", ")}. Último error: ${lastError.message}`)
    : new Error(`No se encontró un bucket válido para Storage. Intentados: ${candidates.join(", ")}`)
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

  if (hasAnyCloudinaryEnv()) {
    throw new Error(
      "Cloudinary está configurado parcialmente. Verifica CLOUDINARY_CLOUD_NAME/CLOUDINARY_URL y sus credenciales o upload preset."
    )
  }

  // Firebase Storage REST fallback
  await withFirebaseBucketFallback(async (bucketName) => {
    const file = getAdminStorage().bucket(bucketName).file(storagePath)
    await file.save(buffer, {
      resumable: false,
      contentType,
      metadata: {
        contentType,
        cacheControl: "public, max-age=3600",
      },
    })
  })

  return storagePath
}

export async function getSignedDownloadUrl(storagePath: string): Promise<string> {
  if (isCloudinaryPath(storagePath)) {
    return extractCloudinaryParts(storagePath).url
  }

  try {
    return await withFirebaseBucketFallback(async (bucketName) => {
      const file = getAdminStorage().bucket(bucketName).file(storagePath)
      const [url] = await file.getSignedUrl({
        action: "read",
        expires: Date.now() + 60 * 60 * 1000,
      })
      return url
    })
  } catch {
    return ""
  }
}

export async function deleteFileFromStorage(storagePath: string): Promise<void> {
  if (isCloudinaryPath(storagePath)) {
    await cloudinaryDelete(extractCloudinaryParts(storagePath).publicId)
    return
  }

  try {
    await withFirebaseBucketFallback(async (bucketName) => {
      await getAdminStorage().bucket(bucketName).file(storagePath).delete({ ignoreNotFound: true })
    })
  } catch {
    // Non-fatal
  }
}
