"use client"

import { useState } from "react"
import { Search, Download, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePickerWithRange } from "@/components/date-picker-with-range"
import type { DateRange } from "react-day-picker"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { UserRole } from "@/lib/types"

interface AuditLog {
  id: string
  action: string
  user: string
  userRole: string
  timestamp: string
  details: string
  ip: string
  status: "success" | "warning" | "error"
}

export default function AuditoriaPage({ params }: { params: { role: string } }) {
  const userRole = params.role as UserRole
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAction, setSelectedAction] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  })
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)

  // Datos de ejemplo para el registro de auditoría
  const auditLogs: AuditLog[] = [
    {
      id: "log-1",
      action: "login",
      user: "admin@casamonarca.com",
      userRole: "admin",
      timestamp: "2023-05-10 08:45:23",
      details: "Inicio de sesión exitoso",
      ip: "192.168.1.100",
      status: "success",
    },
    {
      id: "log-2",
      action: "document_upload",
      user: "coord_legal@casamonarca.com",
      userRole: "management",
      timestamp: "2023-05-10 09:12:45",
      details: "Documento 'Informe Mensual Abril.pdf' subido correctamente",
      ip: "192.168.1.120",
      status: "success",
    },
    {
      id: "log-3",
      action: "document_sign",
      user: "admin@casamonarca.com",
      userRole: "admin",
      timestamp: "2023-05-10 10:30:12",
      details: "Documento 'Informe Mensual Abril.pdf' firmado correctamente",
      ip: "192.168.1.100",
      status: "success",
    },
    {
      id: "log-4",
      action: "login_failed",
      user: "ops_humanitaria@casamonarca.com",
      userRole: "employer",
      timestamp: "2023-05-10 11:05:38",
      details: "Intento de inicio de sesión fallido: contraseña incorrecta",
      ip: "192.168.1.150",
      status: "warning",
    },
    {
      id: "log-5",
      action: "user_create",
      user: "admin@casamonarca.com",
      userRole: "admin",
      timestamp: "2023-05-10 14:22:56",
      details: "Usuario 'nuevo_usuario@casamonarca.com' creado correctamente",
      ip: "192.168.1.100",
      status: "success",
    },
    {
      id: "log-6",
      action: "document_access_denied",
      user: "externo@casamonarca.com",
      userRole: "public",
      timestamp: "2023-05-10 15:48:10",
      details: "Intento de acceso no autorizado al documento 'Presupuesto Q2 2023.pdf'",
      ip: "192.168.1.200",
      status: "error",
    },
    {
      id: "log-7",
      action: "config_change",
      user: "admin@casamonarca.com",
      userRole: "admin",
      timestamp: "2023-05-10 16:30:45",
      details: "Configuración del sistema modificada: habilitada autenticación de dos factores",
      ip: "192.168.1.100",
      status: "success",
    },
    {
      id: "log-8",
      action: "document_delete",
      user: "coord_legal@casamonarca.com",
      userRole: "management",
      timestamp: "2023-05-10 17:15:22",
      details: "Documento 'Borrador Contrato.pdf' eliminado",
      ip: "192.168.1.120",
      status: "warning",
    },
  ]

  // Filtrar logs según los criterios seleccionados
  const filteredLogs = auditLogs.filter((log) => {
    // Filtrar por término de búsqueda
    const searchMatch =
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ip.toLowerCase().includes(searchTerm.toLowerCase())

    // Filtrar por acción
    const actionMatch = selectedAction === "all" || log.action === selectedAction

    // Filtrar por estado
    const statusMatch = selectedStatus === "all" || log.status === selectedStatus

    // Filtrar por rango de fechas
    const logDate = new Date(log.timestamp.split(" ")[0].replace(/-/g, "/"))
    const dateMatch =
      !dateRange || !dateRange.from || (logDate >= dateRange.from && (!dateRange.to || logDate <= dateRange.to))

    return searchMatch && actionMatch && statusMatch && dateMatch
  })

  const handleExportLogs = () => {
    // Lógica para exportar logs (en producción, esto sería una llamada a la API)
    alert("Exportando logs...")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800"
      case "warning":
        return "bg-yellow-100 text-yellow-800"
      case "error":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getActionLabel = (action: string) => {
    switch (action) {
      case "login":
        return "Inicio de sesión"
      case "login_failed":
        return "Inicio de sesión fallido"
      case "document_upload":
        return "Subida de documento"
      case "document_sign":
        return "Firma de documento"
      case "document_access_denied":
        return "Acceso denegado a documento"
      case "document_delete":
        return "Eliminación de documento"
      case "user_create":
        return "Creación de usuario"
      case "config_change":
        return "Cambio de configuración"
      default:
        return action
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Registro de Auditoría</h1>
        <Button onClick={handleExportLogs}>
          <Download className="mr-2 h-4 w-4" />
          Exportar Logs
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Filtra el registro de auditoría según tus necesidades</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por usuario, detalles, IP..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Acción</label>
              <Select value={selectedAction} onValueChange={setSelectedAction}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar acción" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las acciones</SelectItem>
                  <SelectItem value="login">Inicio de sesión</SelectItem>
                  <SelectItem value="login_failed">Inicio de sesión fallido</SelectItem>
                  <SelectItem value="document_upload">Subida de documento</SelectItem>
                  <SelectItem value="document_sign">Firma de documento</SelectItem>
                  <SelectItem value="document_access_denied">Acceso denegado a documento</SelectItem>
                  <SelectItem value="user_create">Creación de usuario</SelectItem>
                  <SelectItem value="config_change">Cambio de configuración</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Estado</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="success">Exitoso</SelectItem>
                  <SelectItem value="warning">Advertencia</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Rango de Fechas</label>
              <DatePickerWithRange date={dateRange} setDate={setDateRange} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Registros de Auditoría</CardTitle>
          <CardDescription>
            Mostrando {filteredLogs.length} de {auditLogs.length} registros
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50 font-medium">
                  <th className="py-3 pl-4 pr-3 text-left">Fecha y Hora</th>
                  <th className="px-3 py-3 text-left">Usuario</th>
                  <th className="px-3 py-3 text-left">Acción</th>
                  <th className="px-3 py-3 text-left">Estado</th>
                  <th className="px-3 py-3 text-left">IP</th>
                  <th className="px-3 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="border-b">
                    <td className="py-3 pl-4 pr-3">{log.timestamp}</td>
                    <td className="px-3 py-3">{log.user}</td>
                    <td className="px-3 py-3">{getActionLabel(log.action)}</td>
                    <td className="px-3 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(log.status)}`}
                      >
                        {log.status === "success" ? "Exitoso" : log.status === "warning" ? "Advertencia" : "Error"}
                      </span>
                    </td>
                    <td className="px-3 py-3">{log.ip}</td>
                    <td className="px-3 py-3 text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => setSelectedLog(log)} className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Ver detalles</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Detalles del Registro</DialogTitle>
                            <DialogDescription>Información detallada del registro de auditoría</DialogDescription>
                          </DialogHeader>
                          {selectedLog && (
                            <div className="space-y-4 py-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">ID</p>
                                  <p>{selectedLog.id}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Fecha y Hora</p>
                                  <p>{selectedLog.timestamp}</p>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Usuario</p>
                                  <p>{selectedLog.user}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Rol</p>
                                  <p>
                                    {selectedLog.userRole === "admin"
                                      ? "Administrador"
                                      : selectedLog.userRole === "sub_admin"
                                        ? "Sub-Administrador"
                                        : selectedLog.userRole === "management"
                                          ? "Coordinador"
                                          : selectedLog.userRole === "employer"
                                            ? "Operativo"
                                            : "Externo"}
                                  </p>
                                </div>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Acción</p>
                                <p>{getActionLabel(selectedLog.action)}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Detalles</p>
                                <p>{selectedLog.details}</p>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">IP</p>
                                  <p>{selectedLog.ip}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Estado</p>
                                  <span
                                    className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                                      selectedLog.status,
                                    )}`}
                                  >
                                    {selectedLog.status === "success"
                                      ? "Exitoso"
                                      : selectedLog.status === "warning"
                                        ? "Advertencia"
                                        : "Error"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </td>
                  </tr>
                ))}
                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-muted-foreground">
                      No se encontraron registros
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
