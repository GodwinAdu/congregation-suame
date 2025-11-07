import { Suspense } from 'react'
import { HelpNeededView } from './_components/help-needed-view'
import { requirePermission } from '@/lib/helpers/server-permission-check'

export default async function HelpNeededPage() {
  await requirePermission('/dashboard/monthly-report/help-needed')
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Members Needing Help</h1>
        <p className="text-muted-foreground">
          Members who didn't report or don't have bible studies
        </p>
      </div>
      
      <Suspense fallback={<div>Loading...</div>}>
        <HelpNeededView />
      </Suspense>
    </div>
  )
}