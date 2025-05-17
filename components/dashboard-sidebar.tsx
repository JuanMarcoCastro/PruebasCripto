"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  FileText,
  Users,
  Bell,
  Settings,
  LogOut,
  Home,
  Heart,
  Scale,
  MessageSquare,
  Package,
  User,
  Shield,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarSeparator,
} from "@/components/ui/sidebar"

import { NotificationBadge } from "@/components/notification-badge"
import type { UserRole } from "@/lib/types"

interface DashboardSidebarProps {
  userRole: UserRole
}

export function DashboardSidebar({ userRole }: DashboardSidebarProps) {
  const pathname = usePathname()

  // Determinar qué elementos del menú mostrar según el rol
  const showAdminMenu = userRole === "admin"
  const showSubAdminMenu = userRole === "admin" || userRole === "sub_admin"
  const showManagementMenu = userRole === "admin" || userRole === "sub_admin" || userRole === "management"
  const showEmployerMenu = userRole !== "public"

  return (
    <Sidebar>
      <SidebarHeader className="flex items-center justify-center p-4">
        <div id="logo" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-sm font-bold text-blue-600">CM</span>
          </div>
          <span className="text-lg font-bold">CasaMonarca</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>General</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === `/dashboard/${userRole}`}>
                  <Link href={`/dashboard/${userRole}`}>
                    <Home className="h-4 w-4" />
                    <span>Inicio</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === `/dashboard/${userRole}/documentos`}>
                  <Link href={`/dashboard/${userRole}/documentos`}>
                    <FileText className="h-4 w-4" />
                    <span>Documentos</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.includes("/notificaciones")}>
                  <Link href={`/dashboard/${userRole}/notificaciones`}>
                    <Bell className="h-4 w-4" />
                    <span>Notificaciones</span>
                    <NotificationBadge count={3} />
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Áreas</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.includes("/humanitaria")}>
                  <Link href={`/dashboard/${userRole}/areas/humanitaria`}>
                    <Heart className="h-4 w-4" />
                    <span>Humanitaria</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.includes("/psicosocial")}>
                  <Link href={`/dashboard/${userRole}/areas/psicosocial`}>
                    <MessageSquare className="h-4 w-4" />
                    <span>Psicosocial</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.includes("/legal")}>
                  <Link href={`/dashboard/${userRole}/areas/legal`}>
                    <Scale className="h-4 w-4" />
                    <span>Legal</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.includes("/comunicacion")}>
                  <Link href={`/dashboard/${userRole}/areas/comunicacion`}>
                    <MessageSquare className="h-4 w-4" />
                    <span>Comunicación</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.includes("/almacen")}>
                  <Link href={`/dashboard/${userRole}/areas/almacen`}>
                    <Package className="h-4 w-4" />
                    <span>Almacén</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {showAdminMenu && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>Administración</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname.includes("/usuarios")}>
                      <Link href={`/dashboard/${userRole}/admin/usuarios`}>
                        <Users className="h-4 w-4" />
                        <span>Gestión de Usuarios</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname.includes("/permisos")}>
                      <Link href={`/dashboard/${userRole}/admin/permisos`}>
                        <Shield className="h-4 w-4" />
                        <span>Gestión de Permisos</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname.includes("/configuracion")}>
                      <Link href={`/dashboard/${userRole}/admin/configuracion`}>
                        <Settings className="h-4 w-4" />
                        <span>Configuración</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.includes("/perfil")}>
              <Link href={`/dashboard/${userRole}/perfil`}>
                <User className="h-4 w-4" />
                <span>Mi Perfil</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/login">
                <LogOut className="h-4 w-4" />
                <span>Cerrar Sesión</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
