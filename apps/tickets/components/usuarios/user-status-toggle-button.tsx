"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Power } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { setUserStatusAction } from "@/lib/actions/usuarios"

interface UserStatusToggleButtonProps {
  userId: string
  currentStatus: "activo" | "inactivo"
}

export function UserStatusToggleButton({ userId, currentStatus }: UserStatusToggleButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const nextStatus = currentStatus === "activo" ? "inactivo" : "activo"

  const handleToggle = async () => {
    setLoading(true)
    try {
      const result = await setUserStatusAction(userId, nextStatus)
      if (!result.success) {
        toast.error(result.error || "No se pudo actualizar el estado")
        return
      }
      toast.success(result.message || `Usuario ${nextStatus === "activo" ? "activado" : "desactivado"}`)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error inesperado")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      type="button"
      variant={currentStatus === "activo" ? "outline" : "default"}
      onClick={handleToggle}
      disabled={loading}
      className={currentStatus === "activo" ? "text-red-500 hover:text-red-600" : ""}
    >
      {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Power className="h-4 w-4 mr-2" />}
      {currentStatus === "activo" ? "Desactivar usuario" : "Activar usuario"}
    </Button>
  )
}
