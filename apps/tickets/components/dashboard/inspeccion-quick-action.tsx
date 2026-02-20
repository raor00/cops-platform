"use client"

import { useRouter } from "next/navigation"
import { ClipboardCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { UserRole } from "@/types"

interface InspeccionQuickActionProps {
  userRole: UserRole
}

export function InspeccionQuickAction({ userRole: _ }: InspeccionQuickActionProps) {
  const router = useRouter()

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => router.push("/dashboard/tickets/nuevo?tipo=inspeccion")}
      className="border border-white/10 bg-white/5 text-white/70 hover:text-white hover:bg-white/10 gap-1.5"
    >
      <ClipboardCheck className="h-3.5 w-3.5" />
      Nueva Inspección
    </Button>
  )
}
