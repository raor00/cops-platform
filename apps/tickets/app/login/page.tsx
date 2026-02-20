"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Zap, Eye, EyeOff, ArrowRight } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { loginSchema, type LoginInput } from "@/lib/validations"
import { loginAction } from "@/lib/actions/auth"

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true)
    try {
      const result = await loginAction(data)
      
      if (result.success) {
        toast.success("¡Bienvenido!", {
          description: "Iniciando sesión...",
        })
        router.push("/dashboard")
        router.refresh()
      } else {
        toast.error("Error al iniciar sesión", {
          description: result.error || "Credenciales inválidas",
        })
      }
    } catch {
      toast.error("Error", {
        description: "Ocurrió un error inesperado",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a1628]">
      {/* Background gradient */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-sky-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-slate-500/10 rounded-full blur-[80px]" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8 gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500/25 to-slate-500/20 border border-sky-400/20 shadow-lg shadow-sky-500/10">
            <Zap className="h-7 w-7 text-sky-400" />
          </div>
          <div className="text-center">
            <h1 className="font-heading text-xl font-bold text-white">COPS Electronics</h1>
            <p className="text-sm text-white/40 mt-0.5">Sistema de Gestión de Servicios</p>
          </div>
        </div>

        {/* Login Card */}
        <Card variant="glass" className="border-white/10">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl">Iniciar Sesión</CardTitle>
            <CardDescription>
              Ingresa tus credenciales para continuar
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Email */}
              <div className="form-group">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="correo@copselectronics.com"
                  autoComplete="email"
                  error={errors.email?.message}
                  {...register("email")}
                />
              </div>

              {/* Password */}
              <div className="form-group">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="pr-10"
                    error={errors.password?.message}
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full bg-sky-600 hover:bg-sky-500 border-0 shadow-lg shadow-sky-500/20"
                size="lg"
                isLoading={isLoading}
              >
                {!isLoading && (
                  <>
                    Iniciar Sesión
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-xs text-white/40">
                ¿Problemas para acceder? Contacta al administrador
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Copyright */}
        <p className="mt-8 text-center text-xs text-white/30">
          © 2025 COP&apos;S Electronics, S.A. Todos los derechos reservados.
        </p>
      </div>
    </div>
  )
}
