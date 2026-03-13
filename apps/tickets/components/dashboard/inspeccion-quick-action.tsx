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
      className="gap-1.5 border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900"
    >
      <ClipboardCheck className="h-3.5 w-3.5" />
      Nueva Inspeccion
    </Button>
  )
}
