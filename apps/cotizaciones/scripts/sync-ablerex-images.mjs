import fs from "node:fs/promises"
import path from "node:path"
import vm from "node:vm"

const ROOT = process.cwd()
const CATALOG_FILE = path.join(ROOT, "lib", "ablerex-catalog.ts")
const IMAGE_DIR = path.join(ROOT, "public", "catalogo", "ablerex")
const IMAGE_URL_BASE = "/catalogo/ablerex"
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"

const BAD_URL_HINTS = [
  "logo",
  "icon",
  "avatar",
  "linkedin",
  "facebook",
  "instagram",
  "youtube",
  "favicon",
  "banner",
  "placeholder",
]

function sanitizeCode(code) {
  return code.replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/-+/g, "-")
}

function htmlDecode(input) {
  return input
    .replaceAll("&quot;", "\"")
    .replaceAll("&amp;", "&")
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
}

function guessExt(contentType, sourceUrl) {
  if (contentType?.includes("image/png")) return ".png"
  if (contentType?.includes("image/webp")) return ".webp"
  if (contentType?.includes("image/gif")) return ".gif"
  if (contentType?.includes("image/svg")) return ".svg"
  if (contentType?.includes("image/jpeg")) return ".jpg"

  const extFromUrl = path.extname(new URL(sourceUrl).pathname).toLowerCase()
  if ([".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"].includes(extFromUrl)) {
    return extFromUrl === ".jpeg" ? ".jpg" : extFromUrl
  }
  return ".jpg"
}

async function parseCatalog() {
  const src = await fs.readFile(CATALOG_FILE, "utf8")
  const code = src
    .replace(/^import[^\n]*\n/, "")
    .replace("export const ABLEREX_CATALOG: CatalogItem[] =", "globalThis.ABLEREX_CATALOG =")
  const context = { globalThis: {} }
  vm.createContext(context)
  vm.runInContext(code, context)
  const items = context.globalThis.ABLEREX_CATALOG
  if (!Array.isArray(items)) {
    throw new Error("No se pudo parsear ABLEREX_CATALOG")
  }
  return items
}

async function writeCatalog(items) {
  const lines = items.map((item) => `  ${JSON.stringify(item)},`).join("\n")
  const content = `import type { CatalogItem } from "./quotation-types"\n\nexport const ABLEREX_CATALOG: CatalogItem[] = [\n${lines}\n]\n`
  await fs.writeFile(CATALOG_FILE, content, "utf8")
}

async function searchImageCandidates(query) {
  const url = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&form=HDRSC3`
  const res = await fetch(url, {
    headers: { "user-agent": UA, "accept-language": "es-ES,es;q=0.9,en;q=0.8" },
    signal: AbortSignal.timeout(20000),
  })
  if (!res.ok) return []
  const html = await res.text()
  const matches = [...html.matchAll(/\sm=\"({[^\"]*?murl[^\"]*?})\"/g)].slice(0, 40)
  const urls = []
  for (const m of matches) {
    try {
      const json = JSON.parse(htmlDecode(m[1]))
      if (json?.murl && typeof json.murl === "string") {
        urls.push(json.murl)
      }
    } catch {
      // ignore malformed entry
    }
  }
  return [...new Set(urls)]
}

function isLikelyBadImage(url) {
  const lower = url.toLowerCase()
  if (!/^https?:\/\//.test(lower)) return true
  if (BAD_URL_HINTS.some((h) => lower.includes(h))) return true
  return false
}

async function downloadCandidate(url, fileBase) {
  if (isLikelyBadImage(url)) return null
  try {
    const res = await fetch(url, {
      headers: { "user-agent": UA, referer: "https://www.bing.com/" },
      signal: AbortSignal.timeout(25000),
    })
    if (!res.ok) return null
    const contentType = res.headers.get("content-type") || ""
    if (!contentType.startsWith("image/")) return null
    const data = Buffer.from(await res.arrayBuffer())
    if (data.length < 8_000) return null

    const ext = guessExt(contentType, url)
    const filename = `${fileBase}${ext}`
    const absolute = path.join(IMAGE_DIR, filename)
    await fs.writeFile(absolute, data)
    return `${IMAGE_URL_BASE}/${filename}`
  } catch {
    return null
  }
}

async function main() {
  await fs.mkdir(IMAGE_DIR, { recursive: true })
  const items = await parseCatalog()

  let found = 0
  let skippedExisting = 0
  let failed = 0

  for (let i = 0; i < items.length; i += 1) {
    const item = items[i]
    const base = sanitizeCode(item.code || `ablerex-${i + 1}`)

    if (item.imageUrl && typeof item.imageUrl === "string" && item.imageUrl.trim()) {
      skippedExisting += 1
      continue
    }

    const existing = await fs
      .readdir(IMAGE_DIR)
      .then((files) => files.find((f) => f.startsWith(`${base}.`)))
      .catch(() => null)

    if (existing) {
      item.imageUrl = `${IMAGE_URL_BASE}/${existing}`
      skippedExisting += 1
      continue
    }

    const queries = [
      `${item.code} Ablerex UPS`,
      `${item.code} Ablerex`,
      `${item.description} Ablerex`,
    ]

    let assigned = null
    for (const q of queries) {
      const candidates = await searchImageCandidates(q)
      for (const c of candidates) {
        assigned = await downloadCandidate(c, base)
        if (assigned) break
      }
      if (assigned) break
    }

    if (assigned) {
      item.imageUrl = assigned
      found += 1
      // eslint-disable-next-line no-console
      console.log(`[${i + 1}/${items.length}] OK   ${item.code} -> ${assigned}`)
    } else {
      item.imageUrl = ""
      failed += 1
      // eslint-disable-next-line no-console
      console.log(`[${i + 1}/${items.length}] FAIL ${item.code}`)
    }
  }

  await writeCatalog(items)
  // eslint-disable-next-line no-console
  console.log(`\nResumen: nuevas=${found}, existentes=${skippedExisting}, sin_imagen=${failed}, total=${items.length}`)
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err)
  process.exit(1)
})

