"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { AlertCircle, Save } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface SignatureConfig {
  keyPath: string
  certPath: string
  caChainPaths: string
  keyPassphrase: string
  signatureReason: string
  signatureLocation: string
  signatureFieldName: string
}

export function ConfigSignatureSettings() {
  const [config, setConfig] = useState<SignatureConfig>({
    keyPath: "/certificates/key.pem",
    certPath: "/certificates/cert.pem",
    caChainPaths: "",
    keyPassphrase: "",
    signatureReason: "Firma digital de documento",
    signatureLocation: "CasaMonarca",
    signatureFieldName: "Signature",
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    // Cargar configuraciones al montar el componente
    const fetchConfig = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await fetch("/api/config/signature", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setConfig(data)
        } else {
          toast({
            title: "Error",
            description: "No se pudieron cargar las configuraciones de firma",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error al cargar configuraciones:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchConfig()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/config/signature", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(config),
      })

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Configuraciones de firma guardadas correctamente",
        })
      } else {
        toast({
          title: "Error",
          description: "No se pudieron guardar las configuraciones",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error al guardar configuraciones:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al guardar las configuraciones",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (key: keyof SignatureConfig, value: any) => {
    setConfig((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Configuración de Firma Digital</CardTitle>
          <CardDescription>Cargando configuraciones...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración de Firma Digital</CardTitle>
        <CardDescription>Configure los parámetros de la firma digital criptográfica</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Importante</AlertTitle>
          <AlertDescription>
            La firma digital es un proceso criptográfico que garantiza la autenticidad e integridad del documento sin
            modificar visualmente el PDF. Se requieren archivos de certificado digital válidos.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="keyPath">Ruta de la Clave Privada (key.pem)</Label>
            <Input
              id="keyPath"
              value={config.keyPath}
              onChange={(e) => handleChange("keyPath", e.target.value)}
              placeholder="/certificates/key.pem"
            />
            <p className="text-sm text-muted-foreground">Ruta absoluta al archivo de clave privada en formato PEM</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="certPath">Ruta del Certificado (cert.pem)</Label>
            <Input
              id="certPath"
              value={config.certPath}
              onChange={(e) => handleChange("certPath", e.target.value)}
              placeholder="/certificates/cert.pem"
            />
            <p className="text-sm text-muted-foreground">Ruta absoluta al archivo de certificado en formato PEM</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="caChainPaths">Rutas de Certificados Intermedios (opcional)</Label>
            <Textarea
              id="caChainPaths"
              value={config.caChainPaths}
              onChange={(e) => handleChange("caChainPaths", e.target.value)}
              placeholder="/certificates/ca1.pem,/certificates/ca2.pem"
              rows={2}
            />
            <p className="text-sm text-muted-foreground">
              Rutas a certificados intermedios separadas por comas (opcional)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="keyPassphrase">Contraseña de la Clave Privada</Label>
            <Input
              id="keyPassphrase"
              type="password"
              value={config.keyPassphrase}
              onChange={(e) => handleChange("keyPassphrase", e.target.value)}
              placeholder="Contraseña (si la clave está protegida)"
            />
            <p className="text-sm text-muted-foreground">
              Contraseña para la clave privada (dejar en blanco si no está protegida)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="signatureReason">Razón de la Firma</Label>
            <Input
              id="signatureReason"
              value={config.signatureReason}
              onChange={(e) => handleChange("signatureReason", e.target.value)}
              placeholder="Firma digital de documento"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="signatureLocation">Ubicación de la Firma</Label>
            <Input
              id="signatureLocation"
              value={config.signatureLocation}
              onChange={(e) => handleChange("signatureLocation", e.target.value)}
              placeholder="CasaMonarca"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="signatureFieldName">Nombre del Campo de Firma</Label>
            <Input
              id="signatureFieldName"
              value={config.signatureFieldName}
              onChange={(e) => handleChange("signatureFieldName", e.target.value)}
              placeholder="Signature"
            />
            <p className="text-sm text-muted-foreground">
              Prefijo para el nombre del campo de firma en el PDF (se añadirá el ID del usuario)
            </p>
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? "Guardando..." : "Guardar Configuración"}
          {!saving && <Save className="ml-2 h-4 w-4" />}
        </Button>
      </CardContent>
    </Card>
  )
}
