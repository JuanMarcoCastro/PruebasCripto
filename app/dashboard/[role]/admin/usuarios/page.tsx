"use client"

import { useState } from "react"
import { Check, Plus, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import type { UserRole } from "@/lib/types"

interface User {
  id: string
  name: string
  email: string
  role: UserRole
  area: string
  status: "active" | "pending" | "inactive"
}

export default function UsersPage() {
  // Datos de ejemplo para usuarios
  const [users, setUsers] = useState<User[]>([
    {
      id: "user-1",
      name: "Admin",
      email: "admin@casamonarca.com",
      role: "admin",
      area: "Administración",
      status: "active",
    },
    {
      id: "user-2",
      name: "Juan Pérez",
      email: "juan@casamonarca.com",
      role: "sub_admin",
      area: "Legal",
      status: "active",
    },
    {
      id: "user-3",
      name: "María Rodríguez",
      email: "maria@casamonarca.com",
      role: "management",
      area: "Humanitaria",
      status: "active",
    },
    {
      id: "user-4",
      name: "Carlos Gómez",
      email: "carlos@casamonarca.com",
      role: "employer",
      area: "Psicosocial",
      status: "pending",
    },
    {
      id: "user-5",
      name: "Ana López",
      email: "ana@casamonarca.com",
      role: "public",
      area: "Comunicación",
      status: "active",
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "employer" as UserRole,
    area: "Legal",
  })

  const { toast } = useToast()

  const handleAddUser = () => {
    const id = `user-${users.length + 1}`

    setUsers([
      ...users,
      {
        id,
        ...newUser,
        status: "pending",
      },
    ])

    setNewUser({
      name: "",
      email: "",
      role: "employer",
      area: "Legal",
    })

    setIsAddUserOpen(false)

    toast({
      title: "Usuario creado",
      description: `Se ha creado el usuario ${newUser.name} con éxito.`,
    })
  }

  const handleApproveUser = (id: string) => {
    setUsers(users.map((user) => (user.id === id ? { ...user, status: "active" } : user)))

    toast({
      title: "Usuario aprobado",
      description: "El usuario ha sido aprobado con éxito.",
    })
  }

  const handleRejectUser = (id: string) => {
    setUsers(users.map((user) => (user.id === id ? { ...user, status: "inactive" } : user)))

    toast({
      title: "Usuario rechazado",
      description: "El usuario ha sido rechazado.",
    })
  }

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.area.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const roleLabels = {
    admin: "Administrador",
    sub_admin: "Sub-Administrador",
    management: "Coordinador",
    employer: "Operativo",
    public: "Externo",
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Usuarios</h1>
        <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Usuario
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nuevo Usuario</DialogTitle>
              <DialogDescription>Ingrese los datos del nuevo usuario</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nombre Completo</Label>
                <Input
                  id="name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="role">Rol</Label>
                  <Select
                    value={newUser.role}
                    onValueChange={(value) => setNewUser({ ...newUser, role: value as UserRole })}
                  >
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Seleccionar rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="sub_admin">Sub-Administrador</SelectItem>
                      <SelectItem value="management">Coordinador</SelectItem>
                      <SelectItem value="employer">Operativo</SelectItem>
                      <SelectItem value="public">Externo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="area">Área</Label>
                  <Select value={newUser.area} onValueChange={(value) => setNewUser({ ...newUser, area: value })}>
                    <SelectTrigger id="area">
                      <SelectValue placeholder="Seleccionar área" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Humanitaria">Humanitaria</SelectItem>
                      <SelectItem value="Psicosocial">Psicosocial</SelectItem>
                      <SelectItem value="Legal">Legal</SelectItem>
                      <SelectItem value="Comunicación">Comunicación</SelectItem>
                      <SelectItem value="Almacén">Almacén</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddUser}>Crear Usuario</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar usuarios..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usuarios</CardTitle>
          <CardDescription>Gestiona los usuarios del sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50 font-medium">
                  <th className="py-3 pl-4 pr-3 text-left">Nombre</th>
                  <th className="px-3 py-3 text-left">Correo</th>
                  <th className="px-3 py-3 text-left">Rol</th>
                  <th className="px-3 py-3 text-left">Área</th>
                  <th className="px-3 py-3 text-left">Estado</th>
                  <th className="px-3 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b">
                    <td className="py-3 pl-4 pr-3">{user.name}</td>
                    <td className="px-3 py-3">{user.email}</td>
                    <td className="px-3 py-3">{roleLabels[user.role]}</td>
                    <td className="px-3 py-3">{user.area}</td>
                    <td className="px-3 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          user.status === "active"
                            ? "bg-green-100 text-green-700"
                            : user.status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {user.status === "active" ? "Activo" : user.status === "pending" ? "Pendiente" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right">
                      {user.status === "pending" && (
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleApproveUser(user.id)}
                          >
                            <Check className="h-4 w-4 text-green-600" />
                            <span className="sr-only">Aprobar</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleRejectUser(user.id)}
                          >
                            <X className="h-4 w-4 text-red-600" />
                            <span className="sr-only">Rechazar</span>
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-muted-foreground">
                      No se encontraron usuarios
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
