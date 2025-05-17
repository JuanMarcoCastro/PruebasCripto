"use client"

import type React from "react"

import { useState } from "react"
import { Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

interface FileUploadButtonProps {
  area?: string
  onUploadComplete?: (file: File) => void
}

export function FileUploadButton({ area, onUploadComplete }: FileUploadButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]

      // Validar que sea un PDF
      if (selectedFile.type !== "application/pdf") {
        toast({
          title: "Formato no válido",
          description: "Solo se permiten archivos PDF",
          variant: "destructive",
        })
        return
      }

      setFile(selectedFile)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setIsUploading(true)

    try {
      // Simulación de carga - en producción, esto sería una llamada a la API
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Archivo subido correctamente",
        description: `El archivo ${file.name} ha sido subido y está pendiente de firma.`,
      })

      if (onUploadComplete) {
        onUploadComplete(file)
      }

      setIsOpen(false)
      setFile(null)
    } catch (error) {
      toast({
        title: "Error al subir el archivo",
        description: "No se pudo subir el archivo. Por favor, intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Subir Documento
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Subir Documento PDF</DialogTitle>
          <DialogDescription>
            {area ? `Sube un documento PDF para el área de ${area}` : "Sube un documento PDF para firmar"}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="file">Archivo PDF</Label>
            <Input id="file" type="file" accept=".pdf" onChange={handleFileChange} />
            {file && <p className="text-sm text-muted-foreground">Archivo seleccionado: {file.name}</p>}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleUpload} disabled={!file || isUploading}>
            {isUploading ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Subiendo...
              </>
            ) : (
              "Subir"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
