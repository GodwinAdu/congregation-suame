import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trash2 } from 'lucide-react'

export default function TrashItemsCount() {
  const trashCount = 15 // This would be fetched from your backend in a real application

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Trash Items Today</CardTitle>
        <Trash2 className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{trashCount}</div>
        <p className="text-xs text-muted-foreground">Items returned or discarded</p>
      </CardContent>
    </Card>
  )
}

