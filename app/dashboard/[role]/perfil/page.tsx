"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import type { UserRole } from "@/lib/types"

interface ProfilePageProps {
  params: { role: string }
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const userRole = params.role as UserRole

  // Datos de ejemplo para el perfil
  const [profile, setProfile] = useState({
    name: "Usuario de Prueba",
    email: `${userRole}@casamonarca.com`,
    role: userRole,
    area: "Legal",
    bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl.",
    avatarUrl: "",
  })

  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({ ...profile })

  const { toast } = useToast()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulación de guardado - en producción, esto sería una llamada a la API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setProfile(formData)
      setIsEditing(false)

      toast({
        title: "Perfil actualizado",
        description: "Tu perfil ha sido actualizado correctamente.",
      })
    } catch (error) {
      toast({
        title: "Error al actualizar el perfil",
        description: "No se pudo actualizar el perfil. Por favor, intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const roleLabels = {
    admin: "Administrador",
    sub_admin: "Sub-Administrador",
    management: "Coordinador",
    employer: "Operativo",
    public: "Externo",
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Mi Perfil</h1>

      <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
        <Card>
          <CardHeader>
            <CardTitle>Foto de Perfil</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <Avatar className="h-32 w-32">
              <AvatarImage src={profile.avatarUrl || "/placeholder.svg"} alt={profile.name} />
              <AvatarFallback className="text-4xl">{profile.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="mt-4 text-center">
              <h3 className="font-medium">{profile.name}</h3>
              <p className="text-sm text-muted-foreground">{roleLabels[profile.role]}</p>
              <p className="text-sm text-muted-foreground">Área: {profile.area}</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" disabled>
              Cambiar Foto
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
            <CardDescription>Actualiza tu información personal</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre Completo</Label>
                <Input
                  id="name"
                  name="name"
                  value={isEditing ? formData.name : profile.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input id="email" name="email" type="email" value={profile.email} disabled />
                <p className="text-xs text-muted-foreground">El correo electrónico no se puede cambiar</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="role">Rol</Label>
                  <Input id="role" value={roleLabels[profile.role]} disabled />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="area">Área</Label>
                  <Input
                    id="area"
                    name="area"
                    value={isEditing ? formData.area : profile.area}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Biografía</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  rows={4}
                  value={isEditing ? formData.bio : profile.bio}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              {isEditing ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false)
                      setFormData({ ...profile })
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Guardando..." : "Guardar Cambios"}
                  </Button>
                </>
              ) : (
                <Button type="button" onClick={() => setIsEditing(true)} className="ml-auto">
                  Editar Perfil
                </Button>
              )}
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
