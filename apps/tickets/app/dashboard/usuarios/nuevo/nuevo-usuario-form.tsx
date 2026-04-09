"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Eye, EyeOff, AlertTriangle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { registerUserAction } from "@/lib/actions/auth"
import { ROLE_LABELS } from "@/types"
import type { UserRole } from "@/types"

const nuevoUsuarioSchema = z
  .object({
    nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100, "El nombre no puede exceder 100 caracteres"),
    apellido: z.string().min(2, "El apellido debe tener al menos 2 caracteres").max(100, "El apellido no puede exceder 100 caracteres"),
    email: z.string().email("Correo electrónico inválido").max(100, "El correo no puede exceder 100 caracteres").optional().or(z.literal("")),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres").max(72, "La contraseña no puede exceder 72 caracteres").optional().or(z.literal("")),
    confirmPassword: z.string().optional().or(z.literal("")),
    rol: z.enum(["tecnico", "coordinador", "gerente", "vicepresidente", "presidente"]),
    telefono: z.string().max(20, "El teléfono no puede exceder 20 caracteres").optional().or(z.literal("")),
    cedula: z.string().min(1, "La cédula es requerida").max(20, "La cédula no puede exceder 20 caracteres"),
    especialidad: z.string().max(100, "La especialidad no puede exceder 100 caracteres").optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    const requiresCredentials = data.rol !== "tecnico"
    const hasEmail = Boolean(data.email?.trim())
    const hasPassword = Boolean(data.password?.trim())

    if (requiresCredentials && !hasEmail) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "El correo es requerido para este rol", path: ["email"] })
    }
    if (requiresCredentials && !hasPassword) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "La contraseña es requerida para este rol", path: ["password"] })
    }
    if ((hasEmail || hasPassword) && data.password !== data.confirmPassword) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Las contraseñas no coinciden", path: ["confirmPassword"] })
    }
    if ((hasEmail && !hasPassword) || (!hasEmail && hasPassword)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Debes completar correo y contraseña para habilitar acceso", path: [hasEmail ? "password" : "email"] })
    }
  })

type FormData = z.infer<typeof nuevoUsuarioSchema>

interface NuevoUsuarioFormProps {
  isLocalMode: boolean
}

const ROLES: UserRole[] = ["tecnico", "coordinador", "gerente", "vicepresidente", "presidente"]

export function NuevoUsuarioForm({ isLocalMode }: NuevoUsuarioFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(nuevoUsuarioSchema),
    defaultValues: {
      rol: "tecnico",
    },
  })
  const selectedRole = watch("rol")
  const credentialsOptional = selectedRole === "tecnico"

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      const result = await registerUserAction({
        email: data.email,
        password: data.password,
        nombre: data.nombre,
        apellido: data.apellido,
        rol: data.rol,
        cedula: data.cedula,
        telefono: data.telefono || undefined,
      })

      if (result.success) {
        toast.success("Usuario creado", { description: result.message })
        router.push("/dashboard/usuarios")
      } else {
        toast.error("Error al crear usuario", { description: result.error })
      }
    } catch {
      toast.error("Error inesperado", { description: "Ocurrió un error al procesar la solicitud" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Banner modo local */}
      {isLocalMode && (
        <div className="flex items-start gap-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4">
          <AlertTriangle className="h-5 w-5 text-yellow-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-300">Modo de demostración activo</p>
            <p className="text-xs text-yellow-300/70 mt-0.5">
              La creación de usuarios no está disponible en modo local. Configura Firebase para habilitar esta función.
            </p>
          </div>
        </div>
      )}

      {/* Fila 1: Nombre y Apellido */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="nombre">
            Nombre <span className="text-red-400">*</span>
          </Label>
          <Input
            id="nombre"
            placeholder="Ej: Carlos"
            {...register("nombre")}
            disabled={isLoading}
          />
          {errors.nombre && (
            <p className="text-xs text-red-400">{errors.nombre.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="apellido">
            Apellido <span className="text-red-400">*</span>
          </Label>
          <Input
            id="apellido"
            placeholder="Ej: Rodríguez"
            {...register("apellido")}
            disabled={isLoading}
          />
          {errors.apellido && (
            <p className="text-xs text-red-400">{errors.apellido.message}</p>
          )}
        </div>
      </div>

      {/* Fila 2: Email y Cédula */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="email">
            Correo electrónico {!credentialsOptional && <span className="text-red-400">*</span>}
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="usuario@copselectronics.com"
            {...register("email")}
            disabled={isLoading}
          />
          {errors.email && (
            <p className="text-xs text-red-400">{errors.email.message}</p>
          )}
          {credentialsOptional && (
            <p className="text-xs text-slate-500">
              Opcional para técnicos. Si lo dejas vacío, se creará solo el perfil sin acceso.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="cedula">
            Cédula <span className="text-red-400">*</span>
          </Label>
          <Input
            id="cedula"
            placeholder="Ej: V-12345678"
            {...register("cedula")}
            disabled={isLoading}
          />
          {errors.cedula && (
            <p className="text-xs text-red-400">{errors.cedula.message}</p>
          )}
        </div>
      </div>

      {/* Fila 3: Teléfono y Rol */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="telefono">Teléfono</Label>
          <Input
            id="telefono"
            placeholder="Ej: 0412-1234567"
            {...register("telefono")}
            disabled={isLoading}
          />
          {errors.telefono && (
            <p className="text-xs text-red-400">{errors.telefono.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>
            Rol <span className="text-red-400">*</span>
          </Label>
          <Select
            defaultValue="tecnico"
            onValueChange={(value) => setValue("rol", value as UserRole)}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un rol" />
            </SelectTrigger>
            <SelectContent>
              {ROLES.map((rol) => (
                <SelectItem key={rol} value={rol}>
                  {ROLE_LABELS[rol]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.rol && (
            <p className="text-xs text-red-400">{errors.rol.message}</p>
          )}
        </div>
      </div>

      {/* Fila 4: Especialidad (ancho completo) */}
      <div className="space-y-2">
        <Label htmlFor="especialidad">Especialidad</Label>
        <Input
          id="especialidad"
          placeholder="Ej: Redes y Telecomunicaciones, CCTV, Mantenimiento preventivo..."
          {...register("especialidad")}
          disabled={isLoading}
        />
        {errors.especialidad && (
          <p className="text-xs text-red-400">{errors.especialidad.message}</p>
        )}
      </div>

      {/* Fila 5: Contraseña y Confirmación */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="password">
            Contraseña {!credentialsOptional && <span className="text-red-400">*</span>}
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Mínimo 6 caracteres"
              {...register("password")}
              disabled={isLoading}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-700"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-400">{errors.password.message}</p>
          )}
          {credentialsOptional && (
            <p className="text-xs text-slate-500">
              Déjala vacía si todavía no quieres habilitarle el acceso al sistema.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">
            Confirmar contraseña {!credentialsOptional && <span className="text-red-400">*</span>}
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirm ? "text" : "password"}
              placeholder="Repite la contraseña"
              {...register("confirmPassword")}
              disabled={isLoading}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-700"
              tabIndex={-1}
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-red-400">{errors.confirmPassword.message}</p>
          )}
        </div>
      </div>

      {/* Botones */}
      <div className="flex items-center gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard/usuarios")}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button type="submit" isLoading={isLoading} disabled={isLoading}>
          Crear Usuario
        </Button>
      </div>
    </form>
  )
}
