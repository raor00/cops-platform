"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bot, Send, Loader2, Sparkles } from "lucide-react"
import { toast } from "sonner"

export function CopibotView() {
  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  async function handleSubmit() {
    if (!prompt.trim()) {
      toast.error("Escribe una solicitud para Copibot")
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const res = await fetch("/api/ai/quote-draft", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          prompt,
          companyFormat: "sa",
          language: "es",
        }),
      })

      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${res.statusText}`)
      }

      const data = await res.json()
      
      if (data.success && data.result) {
        setResult(JSON.stringify(data.result, null, 2))
        toast.success("Copibot respondió exitosamente")
      } else {
        throw new Error(data.error || "Respuesta inválida")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al consultar Copibot")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Bot className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Copibot</h1>
          <p className="text-sm text-muted-foreground">Asistente AI para cotizaciones</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-primary" />
            Nueva consulta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe lo que necesitas cotizar. Ej: 'Necesito una cotización para instalar 4 cámaras Hikvision en una bodega de 500m2'"
            className="min-h-[120px] resize-none"
          />
          <Button 
            onClick={handleSubmit} 
            disabled={loading || !prompt.trim()}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Pensando...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Consultar a Copibot
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Respuesta</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="max-h-[500px] overflow-auto rounded-lg bg-muted p-4 text-xs">
              {result}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
