import type { AIDraftRequest } from "@/lib/quotation-ai-types"
import { chunkText } from "./text-chunk"
import { redactText } from "./redact"
import { embedTextWithOllama } from "./ollama-embeddings"
import { createSupabaseAdminClient, isSupabaseConfigured } from "./supabase-admin"

type SourceType = "pdf" | "xlsx" | "csv" | "text"

function embeddingToSqlLiteral(vec: number[]): string {
  // pgvector input format: [0.1,0.2,...]
  return `[${vec.map((n) => (Number.isFinite(n) ? Number(n).toFixed(8) : "0")).join(",")}]`
}

export function redactKnowledgeForExternalProvider(chunks: string[]): string[] {
  return chunks
    .map((c) => redactText(c))
    .map((c) => (c.length > 900 ? `${c.slice(0, 900)}…` : c))
}

function getEmbeddingModel(): string {
  return process.env.OLLAMA_EMBED_MODEL || "nomic-embed-text"
}

function getEmbeddingTimeoutMs(): number {
  return Number(process.env.OLLAMA_EMBED_TIMEOUT_MS || 12000)
}

function getOllamaBaseUrl(): string {
  return process.env.OLLAMA_BASE_URL || ""
}

export async function retrieveKnowledgeContext(params: { input: AIDraftRequest; topK: number }): Promise<string[]> {
  if (!isSupabaseConfigured()) return []
  const baseUrl = getOllamaBaseUrl()
  if (!baseUrl) return []

  const supabase = createSupabaseAdminClient()
  const queryEmbedding = await embedTextWithOllama(params.input.message, {
    baseUrl,
    model: getEmbeddingModel(),
    timeoutMs: getEmbeddingTimeoutMs(),
  })

  const { data, error } = await (supabase as any).rpc("match_ai_knowledge_chunks", {
    query_embedding: embeddingToSqlLiteral(queryEmbedding),
    match_count: params.topK,
    min_similarity: 0.45,
  })

  if (error) return []
  const rows = (data || []) as Array<{ chunk_text?: string; similarity?: number }>
  return rows.map((r) => r.chunk_text || "").filter(Boolean)
}

export async function ingestKnowledgeDocument(params: {
  sourceType: SourceType
  sourceName: string
  text: string
  metadata?: Record<string, unknown>
}): Promise<{ documentId: string; chunkCount: number }> {
  if (!isSupabaseConfigured()) {
    throw new Error("supabase_not_configured")
  }

  const baseUrl = getOllamaBaseUrl()
  if (!baseUrl) {
    throw new Error("ollama_base_url_required_for_embeddings")
  }

  const supabase = createSupabaseAdminClient()

  const cleaned = (params.text || "").trim()
  if (cleaned.length < 50) throw new Error("knowledge_text_too_short")
  if (cleaned.length > 300_000) throw new Error("knowledge_text_too_large")

  const { data: docRow, error: docErr } = await (supabase as any)
    .from("ai_knowledge_documents")
    .insert({
      source_type: params.sourceType,
      source_name: params.sourceName,
      metadata: params.metadata || {},
    })
    .select("id")
    .single()

  if (docErr || !docRow?.id) {
    throw new Error("knowledge_document_insert_failed")
  }

  const chunks = chunkText(cleaned, { chunkSize: 850, overlap: 140, maxChunks: 220 })
  if (chunks.length === 0) throw new Error("knowledge_chunking_failed")

  const embedModel = getEmbeddingModel()
  const embedTimeoutMs = getEmbeddingTimeoutMs()

  // Embed sequentially to avoid hammering Ollama on small servers.
  const rows: Array<{ document_id: string; chunk_text: string; embedding: string }> = []
  for (const c of chunks) {
    const embedding = await embedTextWithOllama(c, { baseUrl, model: embedModel, timeoutMs: embedTimeoutMs })
    rows.push({ document_id: docRow.id, chunk_text: c, embedding: embeddingToSqlLiteral(embedding) })
  }

  // Insert in batches.
  const batchSize = 50
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize)
    const { error } = await (supabase as any).from("ai_knowledge_chunks").insert(batch)
    if (error) throw new Error("knowledge_chunks_insert_failed")
  }

  return { documentId: docRow.id, chunkCount: chunks.length }
}
