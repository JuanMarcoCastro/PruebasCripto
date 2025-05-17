"use client"

import Link from "next/link"
import { User, Settings, LogOut } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { UserRole } from "@/lib/types"

interface UserDropdownProps {
  userRole: UserRole
}

export function UserDropdown({ userRole }: UserDropdownProps) {
  // Datos de ejemplo para el usuario
  const userInfo = {
    name: "Usuario de Prueba",
    email: `${userRole}@casamonarca.com`,
    role: userRole,
    avatarUrl: "",
  }

  const roleLabels = {
    admin: "Administrador",
    sub_admin: "Sub-Administrador",
    management: "Coordinador",
    employer: "Operativo",
    public: "Externo",
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={userInfo.avatarUrl || "/placeholder.svg"} alt={userInfo.name} />
            <AvatarFallback>{userInfo.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="flex flex-col gap-1">
          <span>{userInfo.name}</span>
          <span className="text-xs font-normal text-muted-foreground">{userInfo.email}</span>
          <span className="text-xs font-normal text-muted-foreground">{roleLabels[userInfo.role]}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={`/dashboard/${userRole}/perfil`} className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>Mi Perfil</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/dashboard/${userRole}/configuracion`} className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Configuración</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/login" className="cursor-pointer">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Cerrar Sesión</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
