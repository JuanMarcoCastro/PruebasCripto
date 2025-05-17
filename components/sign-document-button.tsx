"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { FileSignature, Loader2 } from "lucide-react"

interface SignDocumentButtonProps {
  documentId: string
  documentName: string
  onSuccess?: () => void
}

export function SignDocumentButton({ documentId, documentName, onSuccess }: SignDocumentButtonProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [signatures, setSignatures] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleSignDocument = async () => {
    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem("token")

      if (!token) {
        setError("No se encontró el token de autenticación")
        return
      }

      const response = await fetch(`/api/documents/${documentId}/sign`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Error al firmar el documento")
      }

      setSignatures(data.signatures || [])

      toast({
        title: "Documento firmado",
        description: `El documento "${documentName}" ha sido firmado exitosamente.`,
      })

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error("Error al firmar el documento:", error)
      setError(error instanceof Error ? error.message : "Error desconocido al firmar el documento")

      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error desconocido al firmar el documento",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="default" size="sm" className="flex items-center gap-1">
        <FileSignature className="h-4 w-4 mr-1" />
        Firmar
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Firmar Documento</DialogTitle>
            <DialogDescription>
              ¿Está seguro que desea firmar digitalmente el documento "{documentName}"?
            </DialogDescription>
          </DialogHeader>

          {error && <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">{error}</div>}

          {signatures.length > 0 && (
            <div className="bg-green-100 p-3 rounded-md">
              <h4 className="font-medium text-green-800 mb-1">Firmas en el documento:</h4>
              <ul className="text-sm text-green-700 space-y-1">
                {signatures.map((sig, index) => (
                  <li key={index}>
                    Campo: {sig.field_name}
                    {sig.signer_name && ` - Firmante: ${sig.signer_name}`}
                    {sig.signing_time && ` - Fecha: ${new Date(sig.signing_time).toLocaleString()}`}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button onClick={handleSignDocument} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Firmando..." : "Firmar Documento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
