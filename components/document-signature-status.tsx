"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock, UserCheck, AlertCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface SignatureFlowStage {
  role: string
  required_count: number
  current_count: number
  flow_order: number
  completed: boolean
  signatures?: {
    user_id: string
    user_name: string
    signed_at: string
  }[]
}

interface DocumentSignatureStatusProps {
  documentId: string
}

export function DocumentSignatureStatus({ documentId }: DocumentSignatureStatusProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [flow, setFlow] = useState<SignatureFlowStage[]>([])

  // Función para obtener el flujo de firmas
  const fetchSignatureFlow = async () => {
    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem("token")

      if (!token) {
        setError("No se encontró el token de autenticación")
        setLoading(false)
        return
      }

      const response = await fetch(`/api/documents/${documentId}/flow`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Error al obtener el flujo de firmas")
      }

      setFlow(data.flow || [])
    } catch (error) {
      console.error("Error al obtener el flujo de firmas:", error)
      setError(error instanceof Error ? error.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  // Cargar el flujo de firmas al montar el componente
  useEffect(() => {
    fetchSignatureFlow()
  }, [documentId])

  // Función para formatear el nombre del rol
  const formatRoleName = (role: string) => {
    const roleMap: Record<string, string> = {
      admin: "Administrador",
      sub_admin: "Sub-Administrador",
      management: "Coordinador",
      employer: "Operativo",
      public: "Público",
    }
    return roleMap[role] || role
  }

  // Función para formatear la fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-48" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-64" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-destructive">
            <AlertCircle className="mr-2 h-5 w-5" />
            Error
          </CardTitle>
          <CardDescription>No se pudo cargar el estado de las firmas</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (flow.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Estado de Firmas</CardTitle>
          <CardDescription>Este documento no tiene un flujo de firmas configurado</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No se ha definido un flujo de aprobación para este documento. Contacte al administrador si cree que esto es
            un error.
          </p>
        </CardContent>
      </Card>
    )
  }

  // Calcular el progreso general
  const totalRequired = flow.reduce((sum, stage) => sum + stage.required_count, 0)
  const totalCurrent = flow.reduce((sum, stage) => sum + stage.current_count, 0)
  const overallProgress = Math.round((totalCurrent / totalRequired) * 100)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Estado de Firmas</span>
          <Badge variant={overallProgress === 100 ? "success" : "outline"} className="ml-2">
            {overallProgress}% Completado
          </Badge>
        </CardTitle>
        <CardDescription>Seguimiento del flujo de aprobación del documento</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {flow.map((stage, index) => {
            const isCurrentStage = !stage.completed && (index === 0 || flow[index - 1].completed)

            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {stage.completed ? (
                      <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
                    ) : isCurrentStage ? (
                      <Clock className="mr-2 h-5 w-5 text-amber-500" />
                    ) : (
                      <Clock className="mr-2 h-5 w-5 text-gray-300" />
                    )}
                    <span
                      className={`font-medium ${
                        stage.completed ? "text-green-600" : isCurrentStage ? "text-amber-600" : "text-gray-400"
                      }`}
                    >
                      {formatRoleName(stage.role)}
                    </span>
                  </div>
                  <Badge variant={stage.completed ? "success" : isCurrentStage ? "outline" : "secondary"}>
                    {stage.current_count}/{stage.required_count} firmas
                  </Badge>
                </div>

                {stage.signatures && stage.signatures.length > 0 && (
                  <div className="ml-7 space-y-1 text-sm">
                    {stage.signatures.map((sig, sigIndex) => (
                      <div key={sigIndex} className="flex items-center text-muted-foreground">
                        <UserCheck className="mr-1 h-4 w-4" />
                        <span>{sig.user_name}</span>
                        <span className="ml-auto">{formatDate(sig.signed_at)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
