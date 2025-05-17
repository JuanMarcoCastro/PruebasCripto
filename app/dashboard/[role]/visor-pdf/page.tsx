"use client"

import type React from "react"

import { useState } from "react"
import { FileText, Download, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize, Minimize } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/hooks/use-toast"
import type { UserRole } from "@/lib/types"

export default function VisorPDFPage({ params }: { params: { role: string } }) {
  const userRole = params.role as UserRole
  const { toast } = useToast()
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(10) // Simulación
  const [zoom, setZoom] = useState(100)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileUrl, setFileUrl] = useState<string | null>(null)

  // Función para manejar la selección de archivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      // Verificar que sea un PDF
      if (file.type !== "application/pdf") {
        toast({
          title: "Formato no válido",
          description: "Solo se permiten archivos PDF",
          variant: "destructive",
        })
        return
      }

      setSelectedFile(file)

      // Crear URL para el archivo
      const url = URL.createObjectURL(file)
      setFileUrl(url)

      // Simular carga de páginas
      const randomPages = Math.floor(Math.random() * 20) + 1
      setTotalPages(randomPages)
      setCurrentPage(1)

      toast({
        title: "Archivo cargado",
        description: `El archivo ${file.name} ha sido cargado correctamente.`,
      })
    }
  }

  // Función para cambiar de página
  const changePage = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
    }
  }

  // Función para cambiar el zoom
  const changeZoom = (newZoom: number) => {
    setZoom(newZoom)
  }

  // Función para alternar pantalla completa
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true)
      })
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => {
          setIsFullscreen(false)
        })
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Visor de PDF</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Seleccionar Documento</CardTitle>
          <CardDescription>Seleccione un documento PDF para visualizar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input type="file" accept=".pdf" onChange={handleFileChange} className="cursor-pointer" />

            {selectedFile && (
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <span className="font-medium">{selectedFile.name}</span>
                <span className="text-sm text-muted-foreground">({Math.round(selectedFile.size / 1024)} KB)</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className={isFullscreen ? "fixed inset-0 z-50 rounded-none" : ""}>
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl">Visor de Documento</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => changeZoom(Math.max(50, zoom - 10))}
              disabled={!fileUrl}
            >
              <ZoomOut className="h-4 w-4" />
              <span className="sr-only">Reducir zoom</span>
            </Button>
            <div className="w-32">
              <Slider
                value={[zoom]}
                min={50}
                max={200}
                step={10}
                onValueChange={(value) => changeZoom(value[0])}
                disabled={!fileUrl}
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => changeZoom(Math.min(200, zoom + 10))}
              disabled={!fileUrl}
            >
              <ZoomIn className="h-4 w-4" />
              <span className="sr-only">Aumentar zoom</span>
            </Button>
            <Button variant="outline" size="icon" onClick={toggleFullscreen} disabled={!fileUrl}>
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              <span className="sr-only">{isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {fileUrl ? (
            <div className="flex flex-col items-center space-y-4">
              <div
                className="relative h-[600px] w-full overflow-auto border bg-white"
                style={{ height: isFullscreen ? "calc(100vh - 200px)" : "600px" }}
              >
                <iframe
                  src={`${fileUrl}#page=${currentPage}`}
                  className="h-full w-full"
                  style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top left" }}
                  title="PDF Viewer"
                />
              </div>

              <div className="flex w-full items-center justify-between">
                <Button variant="outline" onClick={() => changePage(currentPage - 1)} disabled={currentPage <= 1}>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Anterior
                </Button>

                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={1}
                    max={totalPages}
                    value={currentPage}
                    onChange={(e) => changePage(Number.parseInt(e.target.value) || 1)}
                    className="w-16 text-center"
                  />
                  <span className="text-sm text-muted-foreground">de {totalPages}</span>
                </div>

                <Button
                  variant="outline"
                  onClick={() => changePage(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                >
                  Siguiente
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>

              <Button variant="outline" className="w-full sm:w-auto">
                <Download className="mr-2 h-4 w-4" />
                Descargar PDF
              </Button>
            </div>
          ) : (
            <div className="flex h-[600px] items-center justify-center border bg-muted/20">
              <div className="text-center">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No hay documento seleccionado</h3>
                <p className="mt-2 text-sm text-muted-foreground">Seleccione un documento PDF para visualizarlo</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
