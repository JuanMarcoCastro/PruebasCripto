import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function PermissionsLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-[250px]" />

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-[200px]" />
          <Skeleton className="h-4 w-[300px]" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-start space-x-3">
                <Skeleton className="h-4 w-4 rounded" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-3 w-[300px]" />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <Skeleton className="h-10 w-[150px]" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
