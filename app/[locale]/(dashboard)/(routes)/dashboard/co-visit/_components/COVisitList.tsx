"use client"

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, ClipboardCheck, User } from 'lucide-react'
import { CHECKLIST_ITEMS } from '@/lib/constants/co-visit-checklist'

interface COVisitListProps {
  visits: any[]
}

const STATUS_COLORS: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-800',
  ongoing: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

function readiness(visit: any) {
  const entries: any[] = visit.packet?.checklist || []
  const applicable = CHECKLIST_ITEMS.filter(
    (i) => entries.find((e) => e.key === i.key)?.status !== 'na'
  )
  const ready = applicable.filter(
    (i) => entries.find((e) => e.key === i.key)?.status === 'ready'
  ).length
  return { ready, total: applicable.length }
}

export function COVisitList({ visits }: COVisitListProps) {
  if (!visits.length) {
    return <p className="text-muted-foreground">No circuit overseer visits yet.</p>
  }

  return (
    <div className="space-y-4">
      {visits.map((visit) => {
        const start = new Date(visit.visitDates.startDate)
        const end = new Date(visit.visitDates.endDate)
        const days = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000) + 1)
        const { ready, total } = readiness(visit)

        return (
          <Card key={visit._id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start gap-2">
                <CardTitle className="text-lg">
                  Visit #{visit.visitNumber} - {visit.circuitOverseer?.name}
                </CardTitle>
                <Badge className={STATUS_COLORS[visit.status] || 'bg-gray-100 text-gray-800'}>
                  {visit.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{start.toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{days} day{days === 1 ? '' : 's'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{visit.circuitOverseer?.phone || 'No phone'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
                  <span>{ready}/{total} items ready</span>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/dashboard/co-visit/${visit._id}`}>Open CO Packet</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
