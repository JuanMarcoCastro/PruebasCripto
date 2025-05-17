import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileUploadButton } from "@/components/file-upload-button"
import { DocumentList } from "@/app/dashboard/[role]/components/document-list"
import type { UserRole } from "@/lib/types"

export default function AreaPage({
  params,
}: {
  params: { role: string; area: string }
}) {
  const userRole = params.role as UserRole
  const area = params.area

  // Formatear el nombre del área para mostrar
  const areaName = area.charAt(0).toUpperCase() + area.slice(1)

  // Determinar si el usuario puede subir documentos
  const canUploadDocuments = userRole !== "public"

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-3xl font-bold tracking-tight">Área de {areaName}</h1>
        {canUploadDocuments && <FileUploadButton area={areaName} />}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Documentos Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Documentos Firmados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Documentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">32</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Documentos del Área de {areaName}</CardTitle>
          <CardDescription>Todos los documentos relacionados con el área de {areaName}</CardDescription>
        </CardHeader>
        <CardContent>
          <DocumentList type="recent" userRole={userRole} area={area} />
        </CardContent>
      </Card>
    </div>
  )
}
