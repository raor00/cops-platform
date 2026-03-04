import { NextResponse } from "next/server"

export const runtime = "nodejs"

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("timeout")), timeoutMs)
    promise
      .then((v) => {
        clearTimeout(t)
        resolve(v)
      })
      .catch((err) => {
        clearTimeout(t)
        reject(err)
      })
  })
}

function describeFetchError(err: unknown): string {
  if (!(err instanceof Error)) return String(err)
  const anyErr = err as any
  const cause = anyErr?.cause
  const code = cause?.code || anyErr?.code
  const address = cause?.address || anyErr?.address
  const port = cause?.port || anyErr?.port
  const extra = [code, address && port ? `${address}:${port}` : address].filter(Boolean).join(" ")
  return extra ? `${err.message} (${extra})` : err.message
}

export async function GET() {
  const baseUrlRaw = process.env.OLLAMA_BASE_URL || ""
  const model = process.env.OLLAMA_MODEL || "qwen3.5:2b"

  if (!baseUrlRaw) {
    return NextResponse.json(
      { ok: false, error: "missing_ollama_base_url", message: "OLLAMA_BASE_URL no esta configurado." },
      { status: 400 },
    )
  }

  const baseUrl = baseUrlRaw.replace(/\/$/, "")

  try {
    const started = Date.now()
    const res = await withTimeout(fetch(`${baseUrl}/api/tags`, { method: "GET" }), 4000)
    const latencyMs = Date.now() - started
    if (!res.ok) {
      return NextResponse.json(
        { ok: false, error: `ollama_http_${res.status}`, message: "Ollama respondio con error.", baseUrl, latencyMs },
        { status: 502 },
      )
    }
    const payload = (await res.json()) as { models?: Array<{ name?: string }> }
    const models = (payload.models || [])
      .map((m) => m.name)
      .filter(Boolean) as string[]
    const modelPresent = models.includes(model)
    return NextResponse.json(
      { ok: true, baseUrl, model, latencyMs, reachable: true, modelPresent, models: models.slice(0, 50) },
      { status: 200 },
    )
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        error: "ollama_unreachable",
        message: "No se pudo conectar a Ollama.",
        details: describeFetchError(e),
        baseUrl,
      },
      { status: 502 },
    )
  }
}

