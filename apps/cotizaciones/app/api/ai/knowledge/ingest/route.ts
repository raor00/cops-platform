import { NextRequest, NextResponse } from "next/server"
import { ingestKnowledgeDocument } from "@/lib/ai/knowledge/knowledge"
import * as XLSX from "xlsx"
import { PDFParse } from "pdf-parse"

export const runtime = "nodejs"

function extOf(name: string): string {
  const idx = name.lastIndexOf(".")
  return idx >= 0 ? name.slice(idx + 1).toLowerCase() : ""
}

function safeString(value: FormDataEntryValue | null): string {
  if (!value || typeof value !== "string") return ""
  return value.trim()
}

async function fileToBuffer(file: File): Promise<Buffer> {
  const ab = await file.arrayBuffer()
  return Buffer.from(ab)
}

function rowsToText(rows: unknown[][], maxRows = 250): string {
  const limited = rows.slice(0, maxRows)
  return limited
    .map((r) => r.map((c) => String(c ?? "")).join("\t").trim())
    .filter(Boolean)
    .join("\n")
}

async function extractTextFromSpreadsheet(file: File): Promise<{ text: string; sourceType: "xlsx" | "csv" }> {
  const ext = extOf(file.name)
  const buf = await fileToBuffer(file)

  if (ext === "csv" || file.type.includes("csv")) {
    const text = new TextDecoder("utf-8").decode(buf)
    const wb = XLSX.read(text, { type: "string" })
    const sheetName = wb.SheetNames[0]
    const sheet = sheetName ? wb.Sheets[sheetName] : undefined
    const rows = sheet ? (XLSX.utils.sheet_to_json(sheet, { header: 1 }) as unknown[][]) : []
    return { text: rowsToText(rows), sourceType: "csv" }
  }

  const wb = XLSX.read(buf, { type: "buffer" })
  const sheetName = wb.SheetNames[0]
  const sheet = sheetName ? wb.Sheets[sheetName] : undefined
  const rows = sheet ? (XLSX.utils.sheet_to_json(sheet, { header: 1 }) as unknown[][]) : []
  return { text: rowsToText(rows), sourceType: "xlsx" }
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const file = form.get("file")
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "missing_file", message: "Debes adjuntar un archivo." }, { status: 400 })
    }

    const client = safeString(form.get("client"))
    const date = safeString(form.get("date"))
    const total = safeString(form.get("total"))
    const currency = safeString(form.get("currency"))
    const notes = safeString(form.get("notes"))

    const ext = extOf(file.name)
    let sourceType: "pdf" | "xlsx" | "csv" | "text" = "text"
    let extractedText = ""

    if (ext === "pdf" || file.type === "application/pdf") {
      sourceType = "pdf"
      const buf = await fileToBuffer(file)
      const parser = new PDFParse({ data: buf })
      try {
        const parsed = await parser.getText()
        extractedText = parsed.text || ""
      } finally {
        await parser.destroy()
      }
    } else if (ext === "xlsx" || ext === "xls" || ext === "csv" || file.type.includes("spreadsheet") || file.type.includes("csv")) {
      const parsed = await extractTextFromSpreadsheet(file)
      sourceType = parsed.sourceType
      extractedText = parsed.text
    } else if (ext === "txt") {
      sourceType = "text"
      extractedText = await file.text()
    } else {
      return NextResponse.json(
        { error: "unsupported_file", message: "Formato no soportado. Usa PDF, XLSX o CSV." },
        { status: 400 },
      )
    }

    const header = [
      "COTIZACION HISTORICA (ingesta COPIBOT)",
      client ? `Cliente: ${client}` : "",
      date ? `Fecha: ${date}` : "",
      total ? `Total: ${total}` : "",
      currency ? `Moneda: ${currency}` : "",
      notes ? `Notas: ${notes}` : "",
    ].filter(Boolean).join("\n")

    const text = `${header}\n\n${extractedText}`.trim()
    const result = await ingestKnowledgeDocument({
      sourceType,
      sourceName: file.name,
      text,
      metadata: {
        client: client || undefined,
        date: date || undefined,
        total: total || undefined,
        currency: currency || undefined,
      },
    })

    return NextResponse.json({ ok: true, ...result }, { status: 200 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown_error"
    if (msg === "supabase_not_configured") {
      return NextResponse.json(
        { error: "supabase_not_configured", message: "Supabase no esta configurado para Base de Conocimiento." },
        { status: 500 },
      )
    }
    return NextResponse.json(
      { error: "ingest_failed", message: "No se pudo ingerir el documento.", details: msg },
      { status: 500 },
    )
  }
}
