// A simple wrapper for charts. In a real app this might use Recharts or similar.
import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./card"

export function Chart({ title, description, data }: { title: string, description?: string, data: any[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="flex h-[200px] items-center justify-center border-dashed border-2 rounded-md bg-muted/20">
          <span className="text-muted-foreground text-sm">Chart placeholder for: {title} ({data.length} data points)</span>
        </div>
      </CardContent>
    </Card>
  )
}
