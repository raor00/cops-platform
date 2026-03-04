export function chunkText(input: string, opts?: { chunkSize?: number; overlap?: number; maxChunks?: number }): string[] {
  const chunkSize = opts?.chunkSize ?? 800
  const overlap = opts?.overlap ?? 120
  const maxChunks = opts?.maxChunks ?? 220

  const text = (input || "").replace(/\s+/g, " ").trim()
  if (!text) return []

  const chunks: string[] = []
  let start = 0
  while (start < text.length && chunks.length < maxChunks) {
    const end = Math.min(text.length, start + chunkSize)
    const chunk = text.slice(start, end).trim()
    if (chunk) chunks.push(chunk)
    if (end >= text.length) break
    start = Math.max(0, end - overlap)
  }
  return chunks
}

