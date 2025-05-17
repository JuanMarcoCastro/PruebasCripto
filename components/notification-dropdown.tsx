"use client"

import { useState } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { NotificationBadge } from "@/components/notification-badge"

// Datos de ejemplo para notificaciones
const mockNotifications = [
  {
    id: 1,
    title: "Documento pendiente de firma",
    message: "Tienes un documento pendiente de firma en el área Legal",
    time: "Hace 5 minutos",
    read: false,
  },
  {
    id: 2,
    title: "Documento firmado",
    message: "Juan Pérez ha firmado el documento 'Acta de reunión'",
    time: "Hace 2 horas",
    read: false,
  },
  {
    id: 3,
    title: "Nuevo documento",
    message: "Se ha subido un nuevo documento en el área Humanitaria",
    time: "Ayer",
    read: true,
  },
]

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState(mockNotifications)

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = (id: number) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })))
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1">
              <NotificationBadge count={unreadCount} />
            </span>
          )}
          <span className="sr-only">Notificaciones</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notificaciones</span>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-auto text-xs font-normal" onClick={markAllAsRead}>
              Marcar todas como leídas
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="py-4 text-center text-sm text-muted-foreground">No tienes notificaciones</div>
        ) : (
          notifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className={`flex cursor-pointer flex-col items-start gap-1 p-3 ${notification.read ? "" : "bg-muted/50"}`}
              onClick={() => markAsRead(notification.id)}
            >
              <div className="font-medium">{notification.title}</div>
              <div className="text-sm text-muted-foreground">{notification.message}</div>
              <div className="text-xs text-muted-foreground">{notification.time}</div>
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="cursor-pointer justify-center">
          <a href="/dashboard/admin/notificaciones">Ver todas las notificaciones</a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
