"use client"

import { useEffect, useRef, useState } from "react"
import type { QuotationData } from "@/lib/quotation-types"
import { generatePDFContent } from "@/lib/generate-pdf"
import { FileText } from "lucide-react"

interface PDFPreviewProps {
  data: QuotationData
  companyFormat?: "sa" | "llc"
}

export function PDFPreview({ data, companyFormat = "sa" }: PDFPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (iframeRef.current) {
      try {
        const doc = iframeRef.current.contentDocument
        if (doc) {
          doc.open()
          doc.write(generatePDFContent(data))
          doc.close()
        }
        setError(null)
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error"
        setError(message)
      }
    }
  }, [data])

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-2.5">
        <FileText className="h-3.5 w-3.5 text-muted-foreground" />
        <p className="text-xs font-medium text-muted-foreground">
          {companyFormat === "llc" ? "Document Preview" : "Vista Previa del Documento"}
        </p>
      </div>
      <iframe
        ref={iframeRef}
        title="Vista previa de cotizacion"
        className="h-[700px] w-full bg-white"
        sandbox="allow-same-origin"
      />
      {error && (
        <div className="border-t border-border bg-destructive/10 px-4 py-3 text-xs text-destructive">
          {companyFormat === "llc"
            ? `Preview error: ${error}`
            : `Error en vista previa: ${error}`}
        </div>
      )}
    </div>
  )
}
