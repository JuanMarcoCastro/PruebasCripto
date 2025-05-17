"use client"

import { useState } from "react"
import { FileText, Download, Eye, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SignDocumentButton } from "@/components/sign-document-button"
import { ConfigureSignatureFlow } from "@/components/configure-signature-flow"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { UserRole } from "@/lib/types"

interface Document {
  id: string
  name: string
  area: string
  uploadedBy: string
  uploadDate: string
  status: "pending" | "signed" | "rejected"
  canSign: boolean
  signatureProgress?: {
    completed: number
    total: number
    currentStage?: {
      role: string
      required: number
      current: number
    }
  }
}

interface DocumentListProps {
  type: "pending" | "recent" | "signed"
  userRole: UserRole
  area?: string
}

export function DocumentList({ type, userRole, area }: DocumentListProps) {
  // Datos de ejemplo para documentos
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: "doc-1",
      name: "Informe Mensual Abril.pdf",
      area: "Humanitaria",
      uploadedBy: "Juan Pérez",
      uploadDate: "2023-05-01",
      status: "pending",
      canSign: true,
      signatureProgress: {
        completed: 2,
        total: 5,
        currentStage: {
          role: "management",
          required: 1,
          current: 0,
        },
      },
    },
    {
      id: "doc-2",
      name: "Acta de Reunión 15-04-2023.pdf",
      area: "Legal",
      uploadedBy: "María Rodríguez",
      uploadDate: "2023-04-15",
      status: "signed",
      canSign: false,
      signatureProgress: {
        completed: 5,
        total: 5,
      },
    },
    {
      id: "doc-3",
      name: "Presupuesto Q2 2023.pdf",
      area: "Comunicación",
      uploadedBy: "Carlos Gómez",
      uploadDate: "2023-04-10",
      status: "pending",
      canSign: true,
      signatureProgress: {
        completed: 1,
        total: 3,
        currentStage: {
          role: "employer",
          required: 2,
          current: 1,
        },
      },
    },
    {
      id: "doc-4",
      name: "Inventario Almacén.pdf",
      area: "Almacén",
      uploadedBy: "Ana López",
      uploadDate: "2023-04-05",
      status: "pending",
      canSign: true,
    },
    {
      id: "doc-5",
      name: "Reporte Psicosocial.pdf",
      area: "Psicosocial",
      uploadedBy: "Roberto Sánchez",
      uploadDate: "2023-04-01",
      status: "signed",
      canSign: false,
    },
  ])

  // Filtrar documentos según el tipo
  let filteredDocuments = [...documents]

  if (type === "pending") {
    filteredDocuments = documents.filter((doc) => doc.status === "pending")
  } else if (type === "signed") {
    filteredDocuments = documents.filter((doc) => doc.status === "signed")
  }

  // Filtrar por área si se especifica
  if (area) {
    filteredDocuments = filteredDocuments.filter((doc) => doc.area.toLowerCase() === area.toLowerCase())
  }

  // Determinar si el usuario puede firmar documentos
  const canSignDocuments = userRole !== "public"

  // Determinar si el usuario puede configurar flujos de firma
  const canConfigureFlow = userRole === "admin"

  const handleSignComplete = (documentId: string) => {
    setDocuments(
      documents.map((doc) => {
        if (doc.id === documentId) {
          // Actualizar el progreso de firma
          const updatedDoc = { ...doc }

          if (updatedDoc.signatureProgress?.currentStage) {
            updatedDoc.signatureProgress.currentStage.current += 1

            // Si se completó la etapa actual
            if (
              updatedDoc.signatureProgress.currentStage.current >= updatedDoc.signatureProgress.currentStage.required
            ) {
              updatedDoc.signatureProgress.completed += 1

              // Si se completaron todas las etapas
              if (updatedDoc.signatureProgress.completed >= updatedDoc.signatureProgress.total) {
                updatedDoc.status = "signed"
                updatedDoc.canSign = false
              }
            }
          } else {
            // Si no hay información de progreso, simplemente marcar como firmado
            updatedDoc.status = "signed"
            updatedDoc.canSign = false
          }

          return updatedDoc
        }
        return doc
      }),
    )
  }

  const handleFlowConfigured = () => {
    // Recargar los documentos después de configurar el flujo
    // En una implementación real, esto haría una llamada a la API
  }

  // Función para determinar si el usuario actual puede firmar según la etapa actual
  const canUserSignDocument = (document: Document) => {
    if (!document.signatureProgress?.currentStage) return document.canSign

    const currentStageRole = document.signatureProgress.currentStage.role
    return document.canSign && currentStageRole === userRole
  }

  // Función para formatear el nombre del rol
  const formatRoleName = (role: string) => {
    const roleMap: Record<string, string> = {
      admin: "Administrador",
      sub_admin: "Sub-Administrador",
      management: "Coordinador",
      employer: "Operativo",
      public: "Público",
    }
    return roleMap[role] || role
  }

  if (filteredDocuments.length === 0) {
    return <div className="py-8 text-center text-muted-foreground">No hay documentos para mostrar</div>
  }

  return (
    <div className="space-y-4">
      {filteredDocuments.map((document) => (
        <div
          key={document.id}
          className="flex flex-col justify-between gap-4 rounded-lg border p-4 sm:flex-row sm:items-center"
        >
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-muted p-2">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-medium">{document.name}</h3>
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span>Área: {document.area}</span>
                <span>Subido por: {document.uploadedBy}</span>
                <span>Fecha: {document.uploadDate}</span>
                <span
                  className={`font-medium ${
                    document.status === "pending"
                      ? "text-yellow-600"
                      : document.status === "signed"
                        ? "text-green-600"
                        : "text-red-600"
                  }`}
                >
                  Estado:{" "}
                  {document.status === "pending" ? "Pendiente" : document.status === "signed" ? "Firmado" : "Rechazado"}
                </span>
              </div>

              {/* Mostrar progreso de firmas si existe */}
              {document.signatureProgress && (
                <div className="mt-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-32 rounded-full bg-gray-200">
                            <div
                              className="h-2 rounded-full bg-green-500"
                              style={{
                                width: `${(document.signatureProgress.completed / document.signatureProgress.total) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {document.signatureProgress.completed}/{document.signatureProgress.total} firmas
                          </span>

                          {document.signatureProgress.currentStage && (
                            <Badge variant="outline" className="ml-1">
                              <Clock className="mr-1 h-3 w-3" />
                              Esperando: {formatRoleName(document.signatureProgress.currentStage.role)}
                            </Badge>
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          Progreso de firmas: {document.signatureProgress.completed} de{" "}
                          {document.signatureProgress.total}
                        </p>
                        {document.signatureProgress.currentStage && (
                          <p>
                            Etapa actual: {formatRoleName(document.signatureProgress.currentStage.role)} (
                            {document.signatureProgress.currentStage.current}/
                            {document.signatureProgress.currentStage.required})
                          </p>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">
              <Eye className="mr-2 h-4 w-4" />
              Ver
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Descargar
            </Button>

            {/* Botón de configuración de flujo (solo para admin) */}
            {canConfigureFlow && document.status === "pending" && (
              <ConfigureSignatureFlow
                documentId={document.id}
                documentName={document.name}
                onSuccess={handleFlowConfigured}
              />
            )}

            {/* Botón de firma (solo si el usuario puede firmar y es su turno) */}
            {canSignDocuments && document.status === "pending" && canUserSignDocument(document) && (
              <SignDocumentButton
                documentId={document.id}
                documentName={document.name}
                onSuccess={() => handleSignComplete(document.id)}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
