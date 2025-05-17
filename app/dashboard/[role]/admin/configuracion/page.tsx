"use client"

import { useState } from "react"
import { Save, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

export default function ConfiguracionPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  // Estados para configuraciones generales
  const [generalConfig, setGeneralConfig] = useState({
    systemName: "CasaMonarca",
    organizationName: "Casa Monarca",
    logoUrl: "",
    defaultLanguage: "es",
    sessionTimeout: "30",
    enableAuditLog: true,
  })

  // Estados para configuraciones de correo
  const [emailConfig, setEmailConfig] = useState({
    smtpServer: "smtp.gmail.com",
    smtpPort: "587",
    smtpUser: "",
    smtpPassword: "",
    senderEmail: "noreply@casamonarca.com",
    senderName: "Sistema CasaMonarca",
    enableEmailNotifications: true,
    emailTemplate: `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>CasaMonarca - Notificación</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4a6da7; color: white; padding: 10px 20px; text-align: center; }
        .content { padding: 20px; border: 1px solid #ddd; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #777; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>CasaMonarca - Sistema de Firma Digital</h2>
        </div>
        <div class="content">
            <p>Hola {user_name},</p>
            <p>{message}</p>
            <p>Saludos,<br>Equipo de CasaMonarca</p>
        </div>
        <div class="footer">
            <p>Este es un correo automático, por favor no responda a este mensaje.</p>
        </div>
    </div>
</body>
</html>`,
  })

  // Estados para configuraciones de seguridad
  const [securityConfig, setSecurityConfig] = useState({
    enableTwoFactor: true,
    twoFactorMethod: "email",
    passwordMinLength: "8",
    passwordRequireSpecialChars: true,
    passwordRequireNumbers: true,
    passwordRequireUppercase: true,
    maxLoginAttempts: "5",
    lockoutDuration: "30",
  })

  // Estados para configuraciones de firma digital
  const [signatureConfig, setSignatureConfig] = useState({
    signatureAlgorithm: "sha256",
    timestampServer: "",
    enableTimestamping: false,
    signaturePosition: "bottom-right",
    signatureWidth: "200",
    signatureHeight: "100",
    certificatePath: "/certificates/certificate.pfx",
    certificatePassword: "",
    signatureAppearance: "name_and_date",
    includeReason: true,
    includeLocation: true,
  })

  // Estados para configuraciones de almacenamiento
  const [storageConfig, setStorageConfig] = useState({
    storageType: "onedrive",
    oneDriveClientId: "",
    oneDriveClientSecret: "",
    oneDriveTenantId: "",
    localStoragePath: "/documents",
    retentionPeriod: "365",
    maxFileSize: "10",
    allowedFileTypes: "pdf",
  })

  // Función para guardar configuraciones
  const saveConfig = async (configType: string) => {
    setIsLoading(true)

    try {
      // Simulación de guardado - en producción, esto sería una llamada a la API
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Configuración guardada",
        description: `La configuración de ${configType} ha sido guardada correctamente.`,
      })
    } catch (error) {
      toast({
        title: "Error al guardar",
        description: "No se pudo guardar la configuración. Por favor, intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Función para restaurar valores predeterminados
  const restoreDefaults = (configType: string) => {
    switch (configType) {
      case "general":
        setGeneralConfig({
          systemName: "CasaMonarca",
          organizationName: "Casa Monarca",
          logoUrl: "",
          defaultLanguage: "es",
          sessionTimeout: "30",
          enableAuditLog: true,
        })
        break
      case "email":
        setEmailConfig({
          smtpServer: "smtp.gmail.com",
          smtpPort: "587",
          smtpUser: "",
          smtpPassword: "",
          senderEmail: "noreply@casamonarca.com",
          senderName: "Sistema CasaMonarca",
          enableEmailNotifications: true,
          emailTemplate: emailConfig.emailTemplate,
        })
        break
      case "security":
        setSecurityConfig({
          enableTwoFactor: true,
          twoFactorMethod: "email",
          passwordMinLength: "8",
          passwordRequireSpecialChars: true,
          passwordRequireNumbers: true,
          passwordRequireUppercase: true,
          maxLoginAttempts: "5",
          lockoutDuration: "30",
        })
        break
      case "signature":
        setSignatureConfig({
          signatureAlgorithm: "sha256",
          timestampServer: "",
          enableTimestamping: false,
          signaturePosition: "bottom-right",
          signatureWidth: "200",
          signatureHeight: "100",
          certificatePath: "/certificates/certificate.pfx",
          certificatePassword: "",
          signatureAppearance: "name_and_date",
          includeReason: true,
          includeLocation: true,
        })
        break
      case "storage":
        setStorageConfig({
          storageType: "onedrive",
          oneDriveClientId: "",
          oneDriveClientSecret: "",
          oneDriveTenantId: "",
          localStoragePath: "/documents",
          retentionPeriod: "365",
          maxFileSize: "10",
          allowedFileTypes: "pdf",
        })
        break
    }

    toast({
      title: "Valores restaurados",
      description: `Se han restaurado los valores predeterminados para ${configType}.`,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Configuración del Sistema</h1>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="email">Correo</TabsTrigger>
          <TabsTrigger value="security">Seguridad</TabsTrigger>
          <TabsTrigger value="signature">Firma Digital</TabsTrigger>
          <TabsTrigger value="storage">Almacenamiento</TabsTrigger>
        </TabsList>

        {/* Configuración General */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Configuración General</CardTitle>
              <CardDescription>Configuración general del sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="systemName">Nombre del Sistema</Label>
                  <Input
                    id="systemName"
                    value={generalConfig.systemName}
                    onChange={(e) => setGeneralConfig({ ...generalConfig, systemName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="organizationName">Nombre de la Organización</Label>
                  <Input
                    id="organizationName"
                    value={generalConfig.organizationName}
                    onChange={(e) => setGeneralConfig({ ...generalConfig, organizationName: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="logoUrl">URL del Logo</Label>
                <Input
                  id="logoUrl"
                  value={generalConfig.logoUrl}
                  onChange={(e) => setGeneralConfig({ ...generalConfig, logoUrl: e.target.value })}
                  placeholder="https://ejemplo.com/logo.png"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="defaultLanguage">Idioma Predeterminado</Label>
                  <Select
                    value={generalConfig.defaultLanguage}
                    onValueChange={(value) => setGeneralConfig({ ...generalConfig, defaultLanguage: value })}
                  >
                    <SelectTrigger id="defaultLanguage">
                      <SelectValue placeholder="Seleccionar idioma" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="en">Inglés</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Tiempo de Sesión (minutos)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    min="5"
                    max="120"
                    value={generalConfig.sessionTimeout}
                    onChange={(e) => setGeneralConfig({ ...generalConfig, sessionTimeout: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="enableAuditLog"
                  checked={generalConfig.enableAuditLog}
                  onCheckedChange={(checked) => setGeneralConfig({ ...generalConfig, enableAuditLog: checked })}
                />
                <Label htmlFor="enableAuditLog">Habilitar Registro de Auditoría</Label>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => restoreDefaults("general")}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Restaurar Valores
              </Button>
              <Button onClick={() => saveConfig("general")} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Cambios
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Configuración de Correo */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Correo</CardTitle>
              <CardDescription>Configuración del servidor de correo y notificaciones</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpServer">Servidor SMTP</Label>
                  <Input
                    id="smtpServer"
                    value={emailConfig.smtpServer}
                    onChange={(e) => setEmailConfig({ ...emailConfig, smtpServer: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPort">Puerto SMTP</Label>
                  <Input
                    id="smtpPort"
                    value={emailConfig.smtpPort}
                    onChange={(e) => setEmailConfig({ ...emailConfig, smtpPort: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpUser">Usuario SMTP</Label>
                  <Input
                    id="smtpUser"
                    value={emailConfig.smtpUser}
                    onChange={(e) => setEmailConfig({ ...emailConfig, smtpUser: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPassword">Contraseña SMTP</Label>
                  <Input
                    id="smtpPassword"
                    type="password"
                    value={emailConfig.smtpPassword}
                    onChange={(e) => setEmailConfig({ ...emailConfig, smtpPassword: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="senderEmail">Correo del Remitente</Label>
                  <Input
                    id="senderEmail"
                    type="email"
                    value={emailConfig.senderEmail}
                    onChange={(e) => setEmailConfig({ ...emailConfig, senderEmail: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="senderName">Nombre del Remitente</Label>
                  <Input
                    id="senderName"
                    value={emailConfig.senderName}
                    onChange={(e) => setEmailConfig({ ...emailConfig, senderName: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="enableEmailNotifications"
                  checked={emailConfig.enableEmailNotifications}
                  onCheckedChange={(checked) => setEmailConfig({ ...emailConfig, enableEmailNotifications: checked })}
                />
                <Label htmlFor="enableEmailNotifications">Habilitar Notificaciones por Correo</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="emailTemplate">Plantilla de Correo</Label>
                <Textarea
                  id="emailTemplate"
                  rows={10}
                  value={emailConfig.emailTemplate}
                  onChange={(e) => setEmailConfig({ ...emailConfig, emailTemplate: e.target.value })}
                  className="font-mono text-xs"
                />
                <p className="text-xs text-muted-foreground">
                  Variables disponibles: {"{user_name}"}, {"{message}"}
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => restoreDefaults("email")}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Restaurar Valores
              </Button>
              <Button onClick={() => saveConfig("email")} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Cambios
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Configuración de Seguridad */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Seguridad</CardTitle>
              <CardDescription>Configuración de seguridad y autenticación</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableTwoFactor"
                  checked={securityConfig.enableTwoFactor}
                  onCheckedChange={(checked) => setSecurityConfig({ ...securityConfig, enableTwoFactor: checked })}
                />
                <Label htmlFor="enableTwoFactor">Habilitar Autenticación de Dos Factores</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="twoFactorMethod">Método de Autenticación de Dos Factores</Label>
                <Select
                  value={securityConfig.twoFactorMethod}
                  onValueChange={(value) => setSecurityConfig({ ...securityConfig, twoFactorMethod: value })}
                  disabled={!securityConfig.enableTwoFactor}
                >
                  <SelectTrigger id="twoFactorMethod">
                    <SelectValue placeholder="Seleccionar método" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Correo Electrónico</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="app">Aplicación Autenticadora</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="passwordMinLength">Longitud Mínima de Contraseña</Label>
                <Input
                  id="passwordMinLength"
                  type="number"
                  min="6"
                  max="20"
                  value={securityConfig.passwordMinLength}
                  onChange={(e) => setSecurityConfig({ ...securityConfig, passwordMinLength: e.target.value })}
                />
              </div>

              <div className="space-y-4">
                <Label>Requisitos de Contraseña</Label>
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="passwordRequireSpecialChars"
                      checked={securityConfig.passwordRequireSpecialChars}
                      onCheckedChange={(checked) =>
                        setSecurityConfig({ ...securityConfig, passwordRequireSpecialChars: checked })
                      }
                    />
                    <Label htmlFor="passwordRequireSpecialChars">Requerir Caracteres Especiales</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="passwordRequireNumbers"
                      checked={securityConfig.passwordRequireNumbers}
                      onCheckedChange={(checked) =>
                        setSecurityConfig({ ...securityConfig, passwordRequireNumbers: checked })
                      }
                    />
                    <Label htmlFor="passwordRequireNumbers">Requerir Números</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="passwordRequireUppercase"
                      checked={securityConfig.passwordRequireUppercase}
                      onCheckedChange={(checked) =>
                        setSecurityConfig({ ...securityConfig, passwordRequireUppercase: checked })
                      }
                    />
                    <Label htmlFor="passwordRequireUppercase">Requerir Mayúsculas</Label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxLoginAttempts">Intentos Máximos de Inicio de Sesión</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    min="1"
                    max="10"
                    value={securityConfig.maxLoginAttempts}
                    onChange={(e) => setSecurityConfig({ ...securityConfig, maxLoginAttempts: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lockoutDuration">Duración del Bloqueo (minutos)</Label>
                  <Input
                    id="lockoutDuration"
                    type="number"
                    min="5"
                    max="60"
                    value={securityConfig.lockoutDuration}
                    onChange={(e) => setSecurityConfig({ ...securityConfig, lockoutDuration: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => restoreDefaults("security")}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Restaurar Valores
              </Button>
              <Button onClick={() => saveConfig("security")} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Cambios
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Configuración de Firma Digital */}
        <TabsContent value="signature">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Firma Digital</CardTitle>
              <CardDescription>Configuración para la firma digital de documentos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signatureAlgorithm">Algoritmo de Firma</Label>
                <Select
                  value={signatureConfig.signatureAlgorithm}
                  onValueChange={(value) => setSignatureConfig({ ...signatureConfig, signatureAlgorithm: value })}
                >
                  <SelectTrigger id="signatureAlgorithm">
                    <SelectValue placeholder="Seleccionar algoritmo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sha256">SHA-256</SelectItem>
                    <SelectItem value="sha384">SHA-384</SelectItem>
                    <SelectItem value="sha512">SHA-512</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="enableTimestamping"
                  checked={signatureConfig.enableTimestamping}
                  onCheckedChange={(checked) => setSignatureConfig({ ...signatureConfig, enableTimestamping: checked })}
                />
                <Label htmlFor="enableTimestamping">Habilitar Sellado de Tiempo</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timestampServer">Servidor de Sellado de Tiempo</Label>
                <Input
                  id="timestampServer"
                  value={signatureConfig.timestampServer}
                  onChange={(e) => setSignatureConfig({ ...signatureConfig, timestampServer: e.target.value })}
                  placeholder="https://freetsa.org/tsr"
                  disabled={!signatureConfig.enableTimestamping}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signaturePosition">Posición de la Firma</Label>
                <Select
                  value={signatureConfig.signaturePosition}
                  onValueChange={(value) => setSignatureConfig({ ...signatureConfig, signaturePosition: value })}
                >
                  <SelectTrigger id="signaturePosition">
                    <SelectValue placeholder="Seleccionar posición" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="top-left">Superior Izquierda</SelectItem>
                    <SelectItem value="top-right">Superior Derecha</SelectItem>
                    <SelectItem value="bottom-left">Inferior Izquierda</SelectItem>
                    <SelectItem value="bottom-right">Inferior Derecha</SelectItem>
                    <SelectItem value="custom">Personalizada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="signatureWidth">Ancho de la Firma (px)</Label>
                  <Input
                    id="signatureWidth"
                    type="number"
                    min="100"
                    max="500"
                    value={signatureConfig.signatureWidth}
                    onChange={(e) => setSignatureConfig({ ...signatureConfig, signatureWidth: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signatureHeight">Alto de la Firma (px)</Label>
                  <Input
                    id="signatureHeight"
                    type="number"
                    min="50"
                    max="200"
                    value={signatureConfig.signatureHeight}
                    onChange={(e) => setSignatureConfig({ ...signatureConfig, signatureHeight: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="certificatePath">Ruta del Certificado</Label>
                <Input
                  id="certificatePath"
                  value={signatureConfig.certificatePath}
                  onChange={(e) => setSignatureConfig({ ...signatureConfig, certificatePath: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="certificatePassword">Contraseña del Certificado</Label>
                <Input
                  id="certificatePassword"
                  type="password"
                  value={signatureConfig.certificatePassword}
                  onChange={(e) => setSignatureConfig({ ...signatureConfig, certificatePassword: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signatureAppearance">Apariencia de la Firma</Label>
                <Select
                  value={signatureConfig.signatureAppearance}
                  onValueChange={(value) => setSignatureConfig({ ...signatureConfig, signatureAppearance: value })}
                >
                  <SelectTrigger id="signatureAppearance">
                    <SelectValue placeholder="Seleccionar apariencia" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name_only">Solo Nombre</SelectItem>
                    <SelectItem value="name_and_date">Nombre y Fecha</SelectItem>
                    <SelectItem value="name_date_reason">Nombre, Fecha y Razón</SelectItem>
                    <SelectItem value="full">Completa (Nombre, Fecha, Razón, Ubicación)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="includeReason"
                  checked={signatureConfig.includeReason}
                  onCheckedChange={(checked) => setSignatureConfig({ ...signatureConfig, includeReason: checked })}
                />
                <Label htmlFor="includeReason">Incluir Razón de Firma</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="includeLocation"
                  checked={signatureConfig.includeLocation}
                  onCheckedChange={(checked) => setSignatureConfig({ ...signatureConfig, includeLocation: checked })}
                />
                <Label htmlFor="includeLocation">Incluir Ubicación</Label>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => restoreDefaults("signature")}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Restaurar Valores
              </Button>
              <Button onClick={() => saveConfig("signature")} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Cambios
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Configuración de Almacenamiento */}
        <TabsContent value="storage">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Almacenamiento</CardTitle>
              <CardDescription>Configuración para el almacenamiento de documentos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="storageType">Tipo de Almacenamiento</Label>
                <Select
                  value={storageConfig.storageType}
                  onValueChange={(value) => setStorageConfig({ ...storageConfig, storageType: value })}
                >
                  <SelectTrigger id="storageType">
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="local">Almacenamiento Local</SelectItem>
                    <SelectItem value="onedrive">OneDrive</SelectItem>
                    <SelectItem value="azure">Azure Blob Storage</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {storageConfig.storageType === "onedrive" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="oneDriveClientId">Client ID de OneDrive</Label>
                    <Input
                      id="oneDriveClientId"
                      value={storageConfig.oneDriveClientId}
                      onChange={(e) => setStorageConfig({ ...storageConfig, oneDriveClientId: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="oneDriveClientSecret">Client Secret de OneDrive</Label>
                    <Input
                      id="oneDriveClientSecret"
                      type="password"
                      value={storageConfig.oneDriveClientSecret}
                      onChange={(e) => setStorageConfig({ ...storageConfig, oneDriveClientSecret: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="oneDriveTenantId">Tenant ID de OneDrive</Label>
                    <Input
                      id="oneDriveTenantId"
                      value={storageConfig.oneDriveTenantId}
                      onChange={(e) => setStorageConfig({ ...storageConfig, oneDriveTenantId: e.target.value })}
                    />
                  </div>
                </>
              )}

              {storageConfig.storageType === "local" && (
                <div className="space-y-2">
                  <Label htmlFor="localStoragePath">Ruta de Almacenamiento Local</Label>
                  <Input
                    id="localStoragePath"
                    value={storageConfig.localStoragePath}
                    onChange={(e) => setStorageConfig({ ...storageConfig, localStoragePath: e.target.value })}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="retentionPeriod">Período de Retención (días)</Label>
                <Input
                  id="retentionPeriod"
                  type="number"
                  min="30"
                  value={storageConfig.retentionPeriod}
                  onChange={(e) => setStorageConfig({ ...storageConfig, retentionPeriod: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxFileSize">Tamaño Máximo de Archivo (MB)</Label>
                  <Input
                    id="maxFileSize"
                    type="number"
                    min="1"
                    max="100"
                    value={storageConfig.maxFileSize}
                    onChange={(e) => setStorageConfig({ ...storageConfig, maxFileSize: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="allowedFileTypes">Tipos de Archivo Permitidos</Label>
                  <Input
                    id="allowedFileTypes"
                    value={storageConfig.allowedFileTypes}
                    onChange={(e) => setStorageConfig({ ...storageConfig, allowedFileTypes: e.target.value })}
                    placeholder="pdf,docx,xlsx"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => restoreDefaults("storage")}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Restaurar Valores
              </Button>
              <Button onClick={() => saveConfig("storage")} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Cambios
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
