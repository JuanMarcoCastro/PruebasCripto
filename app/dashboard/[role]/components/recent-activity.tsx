import type { UserRole } from "@/lib/types"

interface Activity {
  id: string
  user: string
  action: string
  target: string
  timestamp: string
}

interface RecentActivityProps {
  userRole: UserRole
}

export function RecentActivity({ userRole }: RecentActivityProps) {
  // Datos de ejemplo para actividades recientes
  const activities: Activity[] = [
    {
      id: "act-1",
      user: "Juan Marco",
      action: "firmó",
      target: "Informe Mensual Abril.pdf",
      timestamp: "Hace 5 minutos",
    },
    {
      id: "act-2",
      user: "Fedra",
      action: "subió",
      target: "Acta de Reunión 15-04-2023.pdf",
      timestamp: "Hace 2 horas",
    },
    {
      id: "act-3",
      user: "Admin",
      action: "aprobó",
      target: "nuevo usuario: Alfredoo",
      timestamp: "Hace 3 horas",
    },
    {
      id: "act-4",
      user: "Miris",
      action: "actualizó",
      target: "Inventario Almacén.pdf",
      timestamp: "Ayer",
    },
    {
      id: "act-5",
      user: "Eliani",
      action: "rechazó",
      target: "Presupuesto Q1 2023.pdf",
      timestamp: "Hace 2 días",
    },
  ]

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start gap-4">
          <div className="relative mt-1 h-2 w-2 rounded-full bg-primary">
            <span className="absolute -left-[3px] -top-[3px] h-3 w-3 animate-ping rounded-full bg-primary opacity-75" />
          </div>
          <div>
            <p className="text-sm">
              <span className="font-medium">{activity.user}</span> {activity.action}{" "}
              <span className="font-medium">{activity.target}</span>
            </p>
            <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
