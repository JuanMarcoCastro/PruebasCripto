"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPageAlternative() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()

    // Redirección directa basada en el correo electrónico
    if (email.includes("admin")) {
      window.location.href = "/dashboard/admin"
    } else if (email.includes("sub_admin")) {
      window.location.href = "/dashboard/sub_admin"
    } else if (email.includes("coord")) {
      window.location.href = "/dashboard/management"
    } else if (email.includes("ops")) {
      window.location.href = "/dashboard/employer"
    } else if (email.includes("externo")) {
      window.location.href = "/dashboard/public"
    } else {
      alert("Credenciales inválidas. Por favor, intente nuevamente.")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div id="logo" className="mx-auto mb-4 h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-2xl font-bold text-blue-600">CM</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">CasaMonarca</h1>
          <p className="text-gray-600">Sistema de Firma Digital</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Iniciar Sesión</CardTitle>
            <CardDescription>Ingrese sus credenciales para acceder al sistema</CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@casamonarca.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span className="sr-only">{showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}</span>
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full">
                <LogIn className="mr-2 h-4 w-4" />
                Iniciar Sesión
              </Button>
            </CardFooter>
          </form>
        </Card>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">Para pruebas, use cualquiera de estas cuentas:</p>
          <div className="mt-2 text-xs text-gray-500">
            <p>admin@casamonarca.com</p>
            <p>sub_admin@casamonarca.com</p>
            <p>coord_humanitaria@casamonarca.com</p>
            <p>ops_legal@casamonarca.com</p>
            <p>externo@casamonarca.com</p>
          </div>
          <p className="mt-2 text-xs text-gray-500">Contraseña para todas: admin123</p>
        </div>
      </div>
    </div>
  )
}
