import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileUploadButton } from "@/components/file-upload-button"
import { DocumentList } from "@/app/dashboard/[role]/components/document-list"
import { DashboardStats } from "@/app/dashboard/[role]/components/dashboard-stats"
import { RecentActivity } from "@/app/dashboard/[role]/components/recent-activity"
import type { UserRole } from "@/lib/types"

export default function DashboardPage({ params }: { params: { role: string } }) {
  const userRole = params.role as UserRole

  // Determinar qué elementos mostrar según el rol
  const canUploadDocuments = userRole !== "public"

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-3xl font-bold tracking-tight">Panel de Control</h1>
        {canUploadDocuments && <FileUploadButton />}
      </div>

      <DashboardStats userRole={userRole} />

      <Tabs defaultValue="pendientes">
        <TabsList>
          <TabsTrigger value="pendientes">Pendientes de Firma</TabsTrigger>
          <TabsTrigger value="recientes">Documentos Recientes</TabsTrigger>
          <TabsTrigger value="firmados">Firmados por Mí</TabsTrigger>
        </TabsList>
        <TabsContent value="pendientes">
          <Card>
            <CardHeader>
              <CardTitle>Documentos Pendientes de Firma</CardTitle>
              <CardDescription>Documentos que requieren tu firma digital</CardDescription>
            </CardHeader>
            <CardContent>
              <DocumentList type="pending" userRole={userRole} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="recientes">
          <Card>
            <CardHeader>
              <CardTitle>Documentos Recientes</CardTitle>
              <CardDescription>Documentos subidos o actualizados recientemente</CardDescription>
            </CardHeader>
            <CardContent>
              <DocumentList type="recent" userRole={userRole} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="firmados">
          <Card>
            <CardHeader>
              <CardTitle>Documentos Firmados por Mí</CardTitle>
              <CardDescription>Documentos que has firmado digitalmente</CardDescription>
            </CardHeader>
            <CardContent>
              <DocumentList type="signed" userRole={userRole} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>Últimas acciones realizadas en el sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentActivity userRole={userRole} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Documentos por Área</CardTitle>
            <CardDescription>Distribución de documentos por área</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <div className="flex h-full items-center justify-center">
              <div className="text-center text-muted-foreground">Gráfico de distribución de documentos</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
