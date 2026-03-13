"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BackButtonProps {
  href?: string
  label?: string
}

export function BackButton({ href, label = "Regresar" }: BackButtonProps) {
  const router = useRouter()
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => (href ? router.push(href) : router.back())}
      className="-ml-1 text-slate-500 hover:text-slate-900"
    >
      <ArrowLeft className="h-4 w-4 mr-1" />
      {label}
    </Button>
  )
}
