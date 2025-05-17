import type React from "react"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { SidebarInset } from "@/components/ui/sidebar"
import type { UserRole } from "@/lib/types"

const validRoles = ["admin", "sub_admin", "management", "employer", "public"]

export default function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { role: string }
}) {
  // Validar que el rol sea válido
  if (!validRoles.includes(params.role)) {
    redirect("/login")
  }

  const userRole = params.role as UserRole

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:block">
        <DashboardSidebar userRole={userRole} />
      </div>
      <SidebarInset>
        <DashboardHeader userRole={userRole} />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </div>
  )
}
