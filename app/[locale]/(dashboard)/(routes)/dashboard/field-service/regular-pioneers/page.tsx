import { requirePermission } from '@/lib/helpers/server-permission-check'
import { RegularPioneersClient } from './_components/RegularPioneersClient'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function RegularPioneersPage() {
  await requirePermission('manageAllReport')
  return (
    <div className="p-3 sm:p-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/field-service/generate-report">
          <Button variant="outline" size="sm"><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Regular Pioneer Tracker</h1>
          <p className="text-sm text-muted-foreground">Monthly hours tracking — 50hr requirement</p>
        </div>
      </div>
      <RegularPioneersClient />
    </div>
  )
}
