"use client"

import { useState } from "react"
import { FileText, User, Clock, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePickerWithRange } from "@/components/date-picker-with-range"
import { useToast } from "@/hooks/use-toast"
import type { UserRole } from "@/lib/types"

export default function ReportesPage({ params }: { params: { role: string } }) {
  const userRole = params.role as UserRole
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedArea, setSelectedArea] = useState<string>("todas")
  const [selectedFormat, setSelectedFormat] = useState<string>("pdf")
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  })

  // Datos de ejemplo para los gráficos
  const documentStats = {
    total: 238,
    signed: 145,
    pending: 12,
    rejected: 5,
    byArea: {
      Humanitaria: 45,
      Psicosocial: 38,
      Legal: 72,
      Comunicación: 53,
      Almacén: 30,
    },
  }

  const userStats = {
    total: 24,
    active: 20,
    inactive: 4,
    byRole: {
      admin: 2,
      sub_admin: 3,
      management: 5,
      employer: 10,
      public: 4,
    },
  }

  const activityStats = {
    totalActions: 1245,
    documentUploads: 238,
    documentSigns: 145,
    userLogins: 862,
    byDay: {
      "2023-05-01": 42,
      "2023-05-02": 38,
      "2023-05-03": 45,
      "2023-05-04": 51,
      "2023-05-05": 48,
      "2023-05-06": 32,
      "2023-05-07": 28,
    },
  }

  const handleGenerateReport = async (reportType: string) => {
    setIsGenerating(true)

    try {
      // Simulación de generación de reporte - en producción, esto sería una llamada a la API
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: "Reporte generado",
        description: `El reporte de ${reportType} ha sido generado correctamente.`,
      })
    } catch (error) {
      toast({
        title: "Error al generar el reporte",
        description: "No se pudo generar el reporte. Por favor, intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Reportes y Estadísticas</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Documentos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documentStats.total}</div>
            <p className="text-xs text-muted-foreground">
              {documentStats.signed} firmados, {documentStats.pending} pendientes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.active}</div>
            <p className="text-xs text-muted-foreground">De un total de {userStats.total} usuarios</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Actividad Reciente</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activityStats.totalActions}</div>
            <p className="text-xs text-muted-foreground">Acciones en los últimos 30 días</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Documentos por Área</CardTitle>
            <CardDescription>Distribución de documentos por área</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <div className="flex h-full flex-col items-center justify-center">
              <div className="w-full max-w-md">
                {Object.entries(documentStats.byArea).map(([area, count]) => (
                  <div key={area} className="mb-2">
                    <div className="flex items-center justify-between">
                      <span>{area}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                    <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${(count / documentStats.total) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usuarios por Rol</CardTitle>
            <CardDescription>Distribución de usuarios por rol</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <div className="flex h-full flex-col items-center justify-center">
              <div className="w-full max-w-md">
                {Object.entries(userStats.byRole).map(([role, count]) => (
                  <div key={role} className="mb-2">
                    <div className="flex items-center justify-between">
                      <span>
                        {role === "admin"
                          ? "Administrador"
                          : role === "sub_admin"
                            ? "Sub-Administrador"
                            : role === "management"
                              ? "Coordinador"
                              : role === "employer"
                                ? "Operativo"
                                : "Externo"}
                      </span>
                      <span className="font-medium">{count}</span>
                    </div>
                    <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${(count / userStats.total) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="documents">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="documents">Reportes de Documentos</TabsTrigger>
          <TabsTrigger value="users">Reportes de Usuarios</TabsTrigger>
          <TabsTrigger value="activity">Reportes de Actividad</TabsTrigger>
        </TabsList>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Generar Reporte de Documentos</CardTitle>
              <CardDescription>Generar reportes detallados sobre los documentos del sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Área</label>
                  <Select value={selectedArea} onValueChange={setSelectedArea}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar área" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas">Todas las áreas</SelectItem>
                      <SelectItem value="humanitaria">Humanitaria</SelectItem>
                      <SelectItem value="psicosocial">Psicosocial</SelectItem>
                      <SelectItem value="legal">Legal</SelectItem>
                      <SelectItem value="comunicacion">Comunicación</SelectItem>
                      <SelectItem value="almacen">Almacén</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Rango de Fechas</label>
                  <DatePickerWithRange date={dateRange} setDate={setDateRange} />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Formato</label>
                  <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar formato" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Button onClick={() => handleGenerateReport("documentos")} disabled={isGenerating} className="w-full">
                  {isGenerating ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Generando...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Generar Reporte
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => handleGenerateReport("documentos firmados")}
                  disabled={isGenerating}
                  className="w-full"
                >
                  Documentos Firmados
                </Button>

                <Button
                  variant="outline"
                  onClick={() => handleGenerateReport("documentos pendientes")}
                  disabled={isGenerating}
                  className="w-full"
                >
                  Documentos Pendientes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Generar Reporte de Usuarios</CardTitle>
              <CardDescription>Generar reportes detallados sobre los usuarios del sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Rol</label>
                  <Select defaultValue="todos">
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos los roles</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="sub_admin">Sub-Administrador</SelectItem>
                      <SelectItem value="management">Coordinador</SelectItem>
                      <SelectItem value="employer">Operativo</SelectItem>
                      <SelectItem value="public">Externo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Estado</label>
                  <Select defaultValue="todos">
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos los estados</SelectItem>
                      <SelectItem value="active">Activo</SelectItem>
                      <SelectItem value="pending">Pendiente</SelectItem>
                      <SelectItem value="inactive">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Formato</label>
                  <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar formato" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Button onClick={() => handleGenerateReport("usuarios")} disabled={isGenerating} className="w-full">
                  {isGenerating ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Generando...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Generar Reporte
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => handleGenerateReport("actividad de usuarios")}
                  disabled={isGenerating}
                  className="w-full"
                >
                  Actividad de Usuarios
                </Button>

                <Button
                  variant="outline"
                  onClick={() => handleGenerateReport("usuarios por área")}
                  disabled={isGenerating}
                  className="w-full"
                >
                  Usuarios por Área
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Generar Reporte de Actividad</CardTitle>
              <CardDescription>Generar reportes detallados sobre la actividad del sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tipo de Actividad</label>
                  <Select defaultValue="todas">
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas">Todas las actividades</SelectItem>
                      <SelectItem value="login">Inicios de sesión</SelectItem>
                      <SelectItem value="document_upload">Subida de documentos</SelectItem>
                      <SelectItem value="document_sign">Firma de documentos</SelectItem>
                      <SelectItem value="user_management">Gestión de usuarios</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Rango de Fechas</label>
                  <DatePickerWithRange date={dateRange} setDate={setDateRange} />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Formato</label>
                  <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar formato" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Button onClick={() => handleGenerateReport("actividad")} disabled={isGenerating} className="w-full">
                  {isGenerating ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Generando...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Generar Reporte
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => handleGenerateReport("actividad diaria")}
                  disabled={isGenerating}
                  className="w-full"
                >
                  Actividad Diaria
                </Button>

                <Button
                  variant="outline"
                  onClick={() => handleGenerateReport("auditoría")}
                  disabled={isGenerating}
                  className="w-full"
                >
                  Registro de Auditoría
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
