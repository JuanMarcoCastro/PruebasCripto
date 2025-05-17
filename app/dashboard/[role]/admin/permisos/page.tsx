"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Permission {
  id: string
  name: string
  description: string
  code: string
}

interface RolePermissions {
  [key: string]: Permission[]
}

const roleLabels = {
  admin: "Administrador",
  sub_admin: "Sub-Administrador",
  management: "Coordinador",
  employer: "Operativo",
  public: "Externo",
}

// Datos de ejemplo para usar mientras se implementa el backend
const mockPermissions: Permission[] = [
  {
    id: "1",
    name: "Ver documentos",
    description: "Permite acceder a los documentos del sistema",
    code: "view_documents",
  },
  {
    id: "2",
    name: "Subir documentos",
    description: "Permite añadir nuevos documentos",
    code: "upload_documents",
  },
  {
    id: "3",
    name: "Firmar documentos",
    description: "Permite firmar digitalmente los documentos",
    code: "sign_documents",
  },
  {
    id: "4",
    name: "Gestionar usuarios",
    description: "Permite administrar las cuentas de usuario",
    code: "manage_users",
  },
  {
    id: "5",
    name: "Configurar sistema",
    description: "Permite modificar la configuración general",
    code: "configure_system",
  },
  {
    id: "6",
    name: "Ver reportes",
    description: "Permite acceder a los informes y estadísticas",
    code: "view_reports",
  },
  {
    id: "7",
    name: "Gestionar permisos",
    description: "Permite modificar los permisos de los roles",
    code: "manage_permissions",
  },
  {
    id: "8",
    name: "Ver auditoría",
    description: "Permite acceder al registro de actividades",
    code: "view_audit",
  },
]

const mockRolePermissions: RolePermissions = {
  admin: mockPermissions,
  sub_admin: mockPermissions.filter((p) => p.id !== "7"),
  management: mockPermissions.filter((p) => ["1", "2", "3", "6"].includes(p.id)),
  employer: mockPermissions.filter((p) => ["1", "2", "3"].includes(p.id)),
  public: mockPermissions.filter((p) => ["1"].includes(p.id)),
}

export default function PermissionsPage() {
  const { role } = useParams()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [allPermissions, setAllPermissions] = useState<Permission[]>([])
  const [rolePermissions, setRolePermissions] = useState<RolePermissions>({})
  const [selectedPermissions, setSelectedPermissions] = useState<{ [key: string]: string[] }>({})

  useEffect(() => {
    // Cargar datos de ejemplo mientras se implementa el backend
    const loadMockData = async () => {
      try {
        // Simulamos un pequeño retraso para imitar una llamada a la API
        await new Promise((resolve) => setTimeout(resolve, 500))

        setAllPermissions(mockPermissions)
        setRolePermissions(mockRolePermissions)

        // Inicializar los permisos seleccionados
        const selected: { [key: string]: string[] } = {}
        Object.keys(mockRolePermissions).forEach((r) => {
          selected[r] = mockRolePermissions[r].map((p: Permission) => p.id)
        })
        setSelectedPermissions(selected)

        setLoading(false)
      } catch (error) {
        console.error("Error loading mock data:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los permisos",
          variant: "destructive",
        })
        setLoading(false)
      }
    }

    // Intentar cargar desde la API, con fallback a datos de ejemplo
    const fetchPermissions = async () => {
      try {
        // Intentamos cargar desde la API
        const permissionsResponse = await fetch("/api/permissions")
        if (!permissionsResponse.ok) {
          throw new Error(`API responded with status: ${permissionsResponse.status}`)
        }
        const permissionsData = await permissionsResponse.json()

        const rolePermissionsResponse = await fetch("/api/permissions/roles")
        if (!rolePermissionsResponse.ok) {
          throw new Error(`API responded with status: ${rolePermissionsResponse.status}`)
        }
        const rolePermissionsData = await rolePermissionsResponse.json()

        setAllPermissions(permissionsData.permissions)
        setRolePermissions(rolePermissionsData.role_permissions)

        // Inicializar los permisos seleccionados
        const selected: { [key: string]: string[] } = {}
        Object.keys(rolePermissionsData.role_permissions).forEach((r) => {
          selected[r] = rolePermissionsData.role_permissions[r].map((p: Permission) => p.id)
        })
        setSelectedPermissions(selected)

        setLoading(false)
      } catch (error) {
        console.error("Error fetching permissions from API, falling back to mock data:", error)
        // Si falla la API, cargamos datos de ejemplo
        loadMockData()
      }
    }

    // Comentamos la llamada a la API y usamos directamente los datos de ejemplo
    // fetchPermissions();
    loadMockData()
  }, [toast])

  const handlePermissionChange = (roleKey: string, permissionId: string, checked: boolean) => {
    setSelectedPermissions((prev) => {
      const updatedPermissions = { ...prev }

      if (checked) {
        // Añadir permiso si no existe
        if (!updatedPermissions[roleKey].includes(permissionId)) {
          updatedPermissions[roleKey] = [...updatedPermissions[roleKey], permissionId]
        }
      } else {
        // Eliminar permiso si existe
        updatedPermissions[roleKey] = updatedPermissions[roleKey].filter((id) => id !== permissionId)
      }

      return updatedPermissions
    })
  }

  const savePermissions = async (roleKey: string) => {
    setSaving(true)

    try {
      // En un entorno de producción, aquí se haría la llamada a la API
      // Por ahora, simulamos una respuesta exitosa
      await new Promise((resolve) => setTimeout(resolve, 800))

      // Actualizar el estado local para reflejar los cambios
      setRolePermissions((prev) => {
        const updated = { ...prev }
        updated[roleKey] = allPermissions.filter((p) => selectedPermissions[roleKey].includes(p.id))
        return updated
      })

      toast({
        title: "Permisos actualizados",
        description: `Los permisos para ${roleLabels[roleKey as keyof typeof roleLabels]} han sido actualizados correctamente.`,
      })
    } catch (error) {
      console.error("Error saving permissions:", error)
      toast({
        title: "Error",
        description: "No se pudieron guardar los permisos",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Permisos</h1>
        <div className="flex items-center justify-center p-12">
          <div className="text-center">
            <p>Cargando permisos...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Gestión de Permisos</h1>

      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>Información importante</AlertTitle>
        <AlertDescription>
          En esta sección puede configurar los permisos para cada rol del sistema. Los cambios afectarán a todos los
          usuarios con el rol seleccionado.
          <br />
          <strong>Nota:</strong> Los permisos del rol Administrador no pueden ser modificados.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="sub_admin">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sub_admin">Sub-Administrador</TabsTrigger>
          <TabsTrigger value="management">Coordinador</TabsTrigger>
          <TabsTrigger value="employer">Operativo</TabsTrigger>
          <TabsTrigger value="public">Externo</TabsTrigger>
        </TabsList>

        {Object.keys(roleLabels)
          .filter((r) => r !== "admin")
          .map((roleKey) => (
            <TabsContent key={roleKey} value={roleKey} className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Permisos para {roleLabels[roleKey as keyof typeof roleLabels]}</CardTitle>
                  <CardDescription>Seleccione los permisos que desea asignar a este rol</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6">
                    {allPermissions.map((permission) => (
                      <div key={permission.id} className="flex items-start space-x-3">
                        <Checkbox
                          id={`${roleKey}-${permission.id}`}
                          checked={selectedPermissions[roleKey]?.includes(permission.id)}
                          onCheckedChange={(checked) =>
                            handlePermissionChange(roleKey, permission.id, checked as boolean)
                          }
                        />
                        <div className="grid gap-1.5">
                          <label
                            htmlFor={`${roleKey}-${permission.id}`}
                            className="font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {permission.name}
                          </label>
                          <p className="text-sm text-muted-foreground">{permission.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex justify-end">
                    <Button onClick={() => savePermissions(roleKey)} disabled={saving}>
                      {saving ? "Guardando..." : "Guardar cambios"}
                      <Save className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
      </Tabs>
    </div>
  )
}
