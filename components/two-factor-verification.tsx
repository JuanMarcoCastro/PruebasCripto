"use client"

import { useState, useEffect } from "react"
import { Shield, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

interface TwoFactorVerificationProps {
  email: string
  onSuccess: () => void
  onCancel: () => void
}

export function TwoFactorVerification({ email, onSuccess, onCancel }: TwoFactorVerificationProps) {
  const [code, setCode] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutos en segundos
  const { toast } = useToast()

  // Simulación de código de verificación (en producción, esto vendría del backend)
  const validCode = "123456"

  useEffect(() => {
    // Temporizador para la expiración del código
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer)
          toast({
            title: "Código expirado",
            description: "El código de verificación ha expirado. Por favor, solicite uno nuevo.",
            variant: "destructive",
          })
          onCancel()
          return 0
        }
        return prevTime - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [onCancel, toast])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  const handleVerify = async () => {
    setIsVerifying(true)

    try {
      // Simulación de verificación - en producción, esto sería una llamada a la API
      await new Promise((resolve) => setTimeout(resolve, 1500))

      if (code === validCode) {
        onSuccess()
      } else {
        toast({
          title: "Código inválido",
          description: "El código ingresado no es válido. Por favor, intente nuevamente.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error de verificación",
        description: "No se pudo verificar el código. Por favor, intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResendCode = async () => {
    try {
      // Simulación de reenvío - en producción, esto sería una llamada a la API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Reiniciar el temporizador
      setTimeLeft(300)

      toast({
        title: "Código reenviado",
        description: `Se ha enviado un nuevo código de verificación a ${email}`,
      })
    } catch (error) {
      toast({
        title: "Error al reenviar",
        description: "No se pudo reenviar el código. Por favor, intente nuevamente.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={onCancel}>
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Volver</span>
              </Button>
              <div className="mx-auto flex items-center justify-center rounded-full bg-blue-100 p-2">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <CardTitle className="text-center">Verificación de Dos Factores</CardTitle>
            <CardDescription className="text-center">
              Ingrese el código de verificación enviado a {email}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Código de verificación"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={6}
                className="text-center text-lg tracking-widest"
              />
              <p className="text-center text-sm text-muted-foreground">El código expirará en {formatTime(timeLeft)}</p>
            </div>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                ¿No recibió el código?{" "}
                <button
                  type="button"
                  onClick={handleResendCode}
                  className="text-blue-600 hover:underline focus:outline-none"
                >
                  Reenviar
                </button>
              </p>
            </div>

            {/* Para pruebas: mostrar el código válido */}
            <div className="rounded-md bg-muted p-2">
              <p className="text-center text-xs text-muted-foreground">
                Para pruebas, use el código: <span className="font-mono font-bold">{validCode}</span>
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={handleVerify} disabled={isVerifying || code.length !== 6}>
              {isVerifying ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Verificando...
                </span>
              ) : (
                "Verificar"
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
