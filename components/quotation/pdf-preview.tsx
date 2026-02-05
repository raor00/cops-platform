"use client"

import { useEffect, useRef } from "react"
import type { QuotationData } from "@/lib/quotation-types"
import { generatePDFContent } from "@/lib/generate-pdf"
import { FileText } from "lucide-react"

interface PDFPreviewProps {
  data: QuotationData
}

export function PDFPreview({ data }: PDFPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument
      if (doc) {
        doc.open()
        doc.write(generatePDFContent(data))
        doc.close()
      }
    }
  }, [data])

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-2.5">
        <FileText className="h-3.5 w-3.5 text-muted-foreground" />
        <p className="text-xs font-medium text-muted-foreground">Vista Previa del Documento</p>
      </div>
      <iframe
        ref={iframeRef}
        title="Vista previa de cotizacion"
        className="h-[700px] w-full bg-white"
        sandbox="allow-same-origin"
      />
    </div>
  )
}
