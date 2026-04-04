import { requirePermission } from '@/lib/helpers/server-permission-check'
import { HoursTrendClient } from './_components/HoursTrendClient'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function HoursTrendPage() {
  await requirePermission('manageAllReport')
  return (
    <div className="p-3 sm:p-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/field-service/generate-report">
          <Button variant="outline" size="sm"><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Hours Trend</h1>
          <p className="text-sm text-muted-foreground">Month-by-month congregation hours comparison</p>
        </div>
      </div>
      <HoursTrendClient />
    </div>
  )
}
