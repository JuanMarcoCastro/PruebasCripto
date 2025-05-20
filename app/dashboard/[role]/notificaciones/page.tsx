"use client"

import { useState } from "react"
import { Bell, Check, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { UserRole } from "@/lib/types"

interface Notification {
  id: string
  title: string
  message: string
  time: string
  read: boolean
  type: "document" | "user" | "system"
}

interface NotificationsPageProps {
  params: { role: string }
}

export default function NotificationsPage({ params }: NotificationsPageProps) {
  const userRole = params.role as UserRole

  // Datos de ejemplo para notificaciones
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "notif-1",
      title: "Documento pendiente de firma",
      message: "Tienes un documento pendiente de firma en el área Legal",
      time: "Hace 5 minutos",
      read: false,
      type: "document",
    },
    {
      id: "notif-2",
      title: "Documento firmado",
      message: "Juan Marco ha firmado el documento 'Acta de reunión'",
      time: "Hace 2 horas",
      read: false,
      type: "document",
    },
    {
      id: "notif-3",
      title: "Nuevo usuario",
      message: "Se ha registrado un nuevo usuario: Alfredoo",
      time: "Hace 3 horas",
      read: true,
      type: "user",
    },
    {
      id: "notif-4",
      title: "Mantenimiento programado",
      message: "El sistema estará en mantenimiento el día 15/05/2023 de 22:00 a 23:00 horas",
      time: "Ayer",
      read: true,
      type: "system",
    },
    {
      id: "notif-5",
      title: "Nuevo documento",
      message: "Se ha subido un nuevo documento en el área Humanitaria",
      time: "Hace 2 días",
      read: true,
      type: "document",
    },
  ])

  const markAsRead = (id: string) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id))
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-3xl font-bold tracking-tight">Notificaciones</h1>
        {unreadCount > 0 && (
          <Button onClick={markAllAsRead}>
            <Check className="mr-2 h-4 w-4" />
            Marcar todas como leídas
          </Button>
        )}
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">
            Todas
            {notifications.length > 0 && (
              <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs font-medium">{notifications.length}</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="unread">
            No leídas
            {unreadCount > 0 && (
              <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600">
                {unreadCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
          <TabsTrigger value="system">Sistema</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <NotificationList notifications={notifications} onMarkAsRead={markAsRead} onDelete={deleteNotification} />
        </TabsContent>

        <TabsContent value="unread">
          <NotificationList
            notifications={notifications.filter((n) => !n.read)}
            onMarkAsRead={markAsRead}
            onDelete={deleteNotification}
          />
        </TabsContent>

        <TabsContent value="documents">
          <NotificationList
            notifications={notifications.filter((n) => n.type === "document")}
            onMarkAsRead={markAsRead}
            onDelete={deleteNotification}
          />
        </TabsContent>

        <TabsContent value="system">
          <NotificationList
            notifications={notifications.filter((n) => n.type === "system")}
            onMarkAsRead={markAsRead}
            onDelete={deleteNotification}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface NotificationListProps {
  notifications: Notification[]
  onMarkAsRead: (id: string) => void
  onDelete: (id: string) => void
}

function NotificationList({ notifications, onMarkAsRead, onDelete }: NotificationListProps) {
  if (notifications.length === 0) {
    return (
      <Card>
        <CardContent className="flex h-40 items-center justify-center">
          <div className="text-center">
            <Bell className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">No hay notificaciones</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notificaciones</CardTitle>
        <CardDescription>Gestiona tus notificaciones</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`flex items-start justify-between gap-4 rounded-lg border p-4 ${
                notification.read ? "" : "bg-muted/50"
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`rounded-full p-2 ${
                    notification.type === "document"
                      ? "bg-blue-100 text-blue-600"
                      : notification.type === "user"
                        ? "bg-green-100 text-green-600"
                        : "bg-yellow-100 text-yellow-600"
                  }`}
                >
                  <Bell className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-medium">{notification.title}</h3>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{notification.time}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {!notification.read && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onMarkAsRead(notification.id)}
                    title="Marcar como leída"
                  >
                    <Check className="h-4 w-4" />
                    <span className="sr-only">Marcar como leída</span>
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => onDelete(notification.id)} title="Eliminar">
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Eliminar</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
