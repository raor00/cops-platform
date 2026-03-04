"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import type { AIDraftRequest, AIDraftResponse } from "@/lib/quotation-ai-types"
import type { CatalogItem, QuotationType } from "@/lib/quotation-types"
import { Bot, Loader2, Sparkles, TriangleAlert } from "lucide-react"
import { toast } from "sonner"
import { saveAIEvent } from "@/lib/quotation-ai-storage"

interface QuotationAIAssistantProps {
  companyFormat: "sa" | "llc"
  quotationType: QuotationType
  currentDraft: AIDraftRequest["currentDraft"]
  catalog: CatalogItem[]
  onApplyDraft: (result: AIDraftResponse) => void
}

export function QuotationAIAssistant({
  companyFormat,
  quotationType,
  currentDraft,
  catalog,
  onApplyDraft,
}: QuotationAIAssistantProps) {
  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)
  const [lastResult, setLastResult] = useState<AIDraftResponse | null>(null)
  const [lastError, setLastError] = useState<null | { message: string; error?: string; details?: unknown }>(null)
  const [forceOllama, setForceOllama] = useState(false)

  const language = companyFormat === "llc" ? "en" : "es"
  const hasResult = Boolean(lastResult)
  const suggestionCount = lastResult?.suggestedItemsOutsideCatalog.length || 0
  const warningCount = lastResult?.warnings.length || 0
  const providerLabel = lastResult?.metadata.provider || "pending"
  const modelLabel = lastResult?.metadata.model || "-"
  const canGenerate = useMemo(() => prompt.trim().length >= 5 && !loading, [prompt, loading])

  async function handleOllamaHealth() {
    try {
      const res = await fetch("/api/ai/ollama-health", { method: "GET" })
      const data = (await res.json().catch(() => ({}))) as any
      if (!res.ok || !data?.ok) {
        toast.error(companyFormat === "llc" ? "Ollama health check failed" : "Fallo el chequeo de Ollama", {
          description: data?.message || data?.error || "No se pudo conectar a Ollama.",
        })
        return
      }
      toast.success(companyFormat === "llc" ? "Ollama reachable" : "Ollama accesible", {
        description: data?.modelPresent
          ? (companyFormat === "llc" ? "Model is available." : "El modelo esta disponible.")
          : (companyFormat === "llc" ? "Model not found in /api/tags." : "Modelo no aparece en /api/tags."),
      })
    } catch (e) {
      const msg = e instanceof Error ? e.message : "unknown_error"
      toast.error(companyFormat === "llc" ? "Ollama health check failed" : "Fallo el chequeo de Ollama", {
        description: msg,
      })
    }
  }

  async function handleGenerate() {
    if (!canGenerate) return
    setLoading(true)
    setLastError(null)
    try {
      const payload: AIDraftRequest = {
        message: prompt.trim(),
        currentDraft,
        catalog: catalog.map((c) => ({
          code: c.code || "",
          description: c.description || "",
          unitPrice: Number.isFinite(c.unitPrice) ? c.unitPrice : 0,
          category: c.category || "General",
          brand: c.brand,
          subcategory: c.subcategory,
        })),
        companyFormat,
        quotationType,
        language,
      }

      const res = await fetch("/api/ai/quote-draft", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(forceOllama ? { "x-ai-provider-mode": "ollama", "x-ai-disable-fallback": "true" } : {}),
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { message?: string; error?: string; details?: unknown }
        setLastError({ message: data.message || "No se pudo generar el borrador.", error: data.error, details: data.details })
        throw new Error(data.message || "No se pudo generar el borrador.")
      }

      const result = (await res.json()) as AIDraftResponse
      setLastResult(result)
      saveAIEvent({
        action: "generate_quote_draft",
        success: true,
        provider: result.metadata.provider,
        model: result.metadata.model,
        fallbackUsed: result.metadata.fallbackUsed,
        latencyMs: result.metadata.latencyMs,
        warningCount: result.warnings.length,
      })
      toast.success(companyFormat === "llc" ? "Draft generated. Review and apply." : "Borrador generado. Revisa y aplica.")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error generando borrador"
      saveAIEvent({
        action: "generate_quote_draft",
        success: false,
        error: message,
      })
      toast.error(companyFormat === "llc" ? "AI generation failed" : "Fallo la generacion IA", {
        description: message,
      })
    } finally {
      setLoading(false)
    }
  }

  function applyDraft() {
    if (!lastResult) return
    onApplyDraft(lastResult)
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Bot className="h-4 w-4 text-[#4a72ef]" />
            {companyFormat === "llc" ? "COPIBOT - AI Quotation Assistant" : "COPIBOT - Asistente IA de Cotizaciones"}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {companyFormat === "llc"
              ? "Describe what you need and COPIBOT creates a draft."
              : "Describe lo que necesitas y COPIBOT crea un borrador editable."}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-1">
          <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">
            {companyFormat === "llc" ? "Provider used" : "Proveedor usado"}: {providerLabel}
          </Badge>
          {lastResult && (
            <Badge variant="outline" className="text-[10px]">
              {modelLabel}
              {lastResult.metadata.fallbackUsed ? "\u00b7 fallback" : ""}
            </Badge>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={4}
          placeholder={companyFormat === "llc"
            ? "Example: Create a quote for 12 IP cameras, 1 NVR, wiring materials, and installation labor for an office in Caracas..."
            : "Ejemplo: Crea una cotizacion para 12 camaras IP, 1 NVR, materiales de cableado y mano de obra para una oficina en Caracas..."}
          className="min-h-24 resize-y"
        />
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" onClick={handleGenerate} disabled={!canGenerate} className="bg-[#4a72ef] hover:bg-[#2f54e0]">
            {loading ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Sparkles className="mr-2 h-3.5 w-3.5" />}
            {companyFormat === "llc" ? "Generate draft" : "Generar borrador"}
          </Button>
          <Button
            size="sm"
            variant={forceOllama ? "default" : "outline"}
            onClick={() => setForceOllama((v) => !v)}
            disabled={loading}
            className={forceOllama ? "bg-[#111827] hover:bg-[#0b1220]" : ""}
          >
            {companyFormat === "llc" ? "Ollama only" : "Solo Ollama (Qwen)"}
          </Button>
          <Button size="sm" variant="ghost" onClick={handleOllamaHealth} disabled={loading}>
            {companyFormat === "llc" ? "Check Ollama" : "Chequear Ollama"}
          </Button>
        </div>
      </div>

      {loading && (
        <div className="mt-4 rounded-md border border-[#153977]/30 bg-[#153977] p-3 text-white shadow-[0_10px_24px_rgba(21,57,119,0.25)]">
          <p className="text-sm font-semibold text-white">
            {companyFormat === "llc"
              ? "COPIBOT is generating your quote draft..."
              : "COPIBOT est\u00e1 generando tu borrador de cotizaci\u00f3n..."}
          </p>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/30">
            <div className="h-full w-1/3 animate-[pulse_1.1s_ease-in-out_infinite] rounded-full bg-white" />
          </div>
          <p className="mt-2 text-xs text-white/90">
            {companyFormat === "llc"
              ? "Analyzing request, classifying items, and preparing form fields."
              : "Analizando solicitud, clasificando items y preparando campos del formulario."}
          </p>
        </div>
      )}

      {hasResult && (
        <div className="mt-4 space-y-2 rounded-md border border-border bg-muted/30 p-3">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline">{companyFormat === "llc" ? "Confidence" : "Confianza"}: {Math.round((lastResult?.confidence || 0) * 100)}%</Badge>
            <Badge variant="outline">{companyFormat === "llc" ? "Warnings" : "Advertencias"}: {warningCount}</Badge>
            <Badge variant="outline">{companyFormat === "llc" ? "Suggestions" : "Sugerencias"}: {suggestionCount}</Badge>
            {lastResult?.metadata.fallbackUsed && <Badge variant="outline">Fallback</Badge>}
          </div>

          {warningCount > 0 && (
            <div className="space-y-1 text-xs">
              {lastResult?.warnings.map((w) => (
                <div key={w} className="flex items-start gap-1.5 text-amber-700">
                  <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>{w}</span>
                </div>
              ))}
            </div>
          )}

          {suggestionCount > 0 && (
            <div className="space-y-1 text-xs text-muted-foreground">
              <p className="font-medium text-foreground">
                {companyFormat === "llc" ? "Items suggested outside catalog:" : "Items sugeridos fuera de catalogo:"}
              </p>
              {lastResult?.suggestedItemsOutsideCatalog.slice(0, 5).map((s) => (
                <p key={`${s.code || "n/a"}-${s.description}`}>
                  {"\u2022"} {s.description} ({companyFormat === "llc" ? "qty" : "cant"}: {s.quantity}) - {s.reason}
                </p>
              ))}
            </div>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button onClick={applyDraft} className="bg-[#166534] hover:bg-[#14532d]">
              {companyFormat === "llc" ? "Accept draft and fill form" : "Aceptar borrador y llenar formulario"}
            </Button>
            <Button variant="outline" onClick={handleGenerate} disabled={loading}>
              {companyFormat === "llc" ? "Regenerate" : "Regenerar"}
            </Button>
            <span className="text-xs text-muted-foreground">
              {companyFormat === "llc"
                ? "You can manually edit any field after applying."
                : "Puedes corregir cualquier campo manualmente despu\u00e9s de aplicar."}
            </span>
          </div>
        </div>
      )}

      {lastError && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-900">
          <p className="font-semibold">
            {companyFormat === "llc" ? "Request failed" : "No se pudo generar el borrador"}
          </p>
          <p className="mt-1">{lastError.message}</p>
          {process.env.NODE_ENV !== "production" && lastError.details && (
            <details className="mt-2">
              <summary className="cursor-pointer select-none font-medium">
                {companyFormat === "llc" ? "Technical details" : "Detalles tecnicos"}
              </summary>
              <pre className="mt-2 max-h-56 overflow-auto rounded bg-white/60 p-2 text-[10px] leading-relaxed">
                {JSON.stringify(lastError.details, null, 2)}
              </pre>
            </details>
          )}
        </div>
      )}
    </div>
  )
}

