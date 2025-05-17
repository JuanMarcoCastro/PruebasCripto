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
  DialogTrigger,
} from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Settings2, Loader2, Plus, Trash2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Esquema de validación para el formulario
const signatureFlowSchema = z.object({
  stages: z
    .array(
      z.object({
        role: z.string().min(1, "El rol es requerido"),
        count: z.coerce.number().min(1, "Se requiere al menos 1 firma"),
        order: z.number(),
      }),
    )
    .min(1, "Se requiere al menos una etapa de firma"),
})

type SignatureFlowFormValues = z.infer<typeof signatureFlowSchema>

interface ConfigureSignatureFlowProps {
  documentId: string
  documentName: string
  onSuccess?: () => void
}

export function ConfigureSignatureFlow({ documentId, documentName, onSuccess }: ConfigureSignatureFlowProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Inicializar el formulario
  const form = useForm<SignatureFlowFormValues>({
    resolver: zodResolver(signatureFlowSchema),
    defaultValues: {
      stages: [{ role: "employer", count: 1, order: 1 }],
    },
  })

  // Función para añadir una nueva etapa
  const addStage = () => {
    const stages = form.getValues("stages")
    form.setValue("stages", [...stages, { role: "employer", count: 1, order: stages.length + 1 }])
  }

  // Función para eliminar una etapa
  const removeStage = (index: number) => {
    const stages = form.getValues("stages")
    if (stages.length > 1) {
      const newStages = stages
        .filter((_, i) => i !== index)
        .map((stage, i) => ({
          ...stage,
          order: i + 1,
        }))
      form.setValue("stages", newStages)
    }
  }

  // Función para enviar el formulario
  const onSubmit = async (values: SignatureFlowFormValues) => {
    setLoading(true)

    try {
      const token = localStorage.getItem("token")

      if (!token) {
        toast({
          title: "Error",
          description: "No se encontró el token de autenticación",
          variant: "destructive",
        })
        return
      }

      // Transformar los datos para la API
      const required_signatures = values.stages.map((stage) => ({
        role: stage.role,
        count: stage.count,
        order: stage.order,
      }))

      const response = await fetch(`/api/documents/${documentId}/flow`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ required_signatures }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Error al configurar el flujo de firmas")
      }

      toast({
        title: "Flujo configurado",
        description: "El flujo de firmas se ha configurado correctamente",
      })

      setOpen(false)

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error("Error al configurar el flujo de firmas:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <Settings2 className="h-4 w-4 mr-1" />
          Configurar Flujo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Configurar Flujo de Firmas</DialogTitle>
          <DialogDescription>Define quién debe firmar el documento "{documentName}" y en qué orden.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-4">
              {form.watch("stages").map((stage, index) => (
                <Card key={index}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium">Etapa {index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeStage(index)}
                        disabled={form.watch("stages").length <= 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`stages.${index}.role`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Rol</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar rol" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="employer">Operativo</SelectItem>
                                <SelectItem value="management">Coordinador</SelectItem>
                                <SelectItem value="sub_admin">Sub-Administrador</SelectItem>
                                <SelectItem value="admin">Administrador</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`stages.${index}.count`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Número de firmas</FormLabel>
                            <FormControl>
                              <Input type="number" min="1" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Button type="button" variant="outline" onClick={addStage} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Añadir Etapa
            </Button>

            <FormDescription>
              Las etapas se ejecutarán en el orden especificado. Cada etapa debe completarse antes de pasar a la
              siguiente.
            </FormDescription>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Guardando..." : "Guardar Configuración"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
