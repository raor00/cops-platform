interface EmbedOptions {
  baseUrl: string
  model: string
  timeoutMs: number
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("ollama_embed_timeout")), timeoutMs)
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

export async function embedTextWithOllama(text: string, options: EmbedOptions): Promise<number[]> {
  const baseUrl = options.baseUrl.replace(/\/$/, "")

  // Newer Ollama: /api/embed { model, input }
  const tryEmbed = async () => {
    const res = await withTimeout(
      fetch(`${baseUrl}/api/embed`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ model: options.model, input: text }),
      }),
      options.timeoutMs,
    )
    if (!res.ok) throw new Error(`ollama_embed_http_${res.status}`)
    const payload = (await res.json()) as { embeddings?: number[][] }
    const v = payload.embeddings?.[0]
    if (!v || !Array.isArray(v)) throw new Error("ollama_embed_empty")
    return v
  }

  // Older Ollama: /api/embeddings { model, prompt }
  const tryEmbeddings = async () => {
    const res = await withTimeout(
      fetch(`${baseUrl}/api/embeddings`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ model: options.model, prompt: text }),
      }),
      options.timeoutMs,
    )
    if (!res.ok) throw new Error(`ollama_embed_http_${res.status}`)
    const payload = (await res.json()) as { embedding?: number[] }
    if (!payload.embedding || !Array.isArray(payload.embedding)) throw new Error("ollama_embed_empty")
    return payload.embedding
  }

  try {
    return await tryEmbed()
  } catch (err) {
    const msg = err instanceof Error ? err.message : ""
    // If endpoint doesn't exist, fallback.
    if (msg.includes("404") || msg.includes("not found")) {
      return await tryEmbeddings()
    }
    // Otherwise attempt legacy too, but preserve the original error if that fails.
    try {
      return await tryEmbeddings()
    } catch {
      throw err
    }
  }
}

