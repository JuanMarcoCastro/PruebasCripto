"use client"

import { useState } from "react"
import { Search, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { NotificationDropdown } from "@/components/notification-dropdown"
import { UserDropdown } from "@/components/user-dropdown"
import type { UserRole } from "@/lib/types"

interface DashboardHeaderProps {
  userRole: UserRole
}

export function DashboardHeader({ userRole }: DashboardHeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-2 lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="lg:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <DashboardSidebar userRole={userRole} />
          </SheetContent>
        </Sheet>
        <span className="text-lg font-semibold lg:hidden">CasaMonarca</span>
      </div>

      <div
        className={`${isSearchOpen ? "flex w-full" : "hidden"} items-center gap-2 md:flex md:w-auto md:max-w-md lg:max-w-lg`}
      >
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Buscar documentos..." className="w-full pl-8" />
        </div>
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsSearchOpen(false)}>
          <span className="sr-only">Cerrar búsqueda</span>
          <span aria-hidden="true">×</span>
        </Button>
      </div>

      <div className="flex items-center gap-2">
        {!isSearchOpen && (
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsSearchOpen(true)}>
            <Search className="h-5 w-5" />
            <span className="sr-only">Buscar</span>
          </Button>
        )}

        <NotificationDropdown />
        <UserDropdown userRole={userRole} />
      </div>
    </header>
  )
}
