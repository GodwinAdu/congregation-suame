import { requirePermission } from '@/lib/helpers/server-permission-check'
import { PioneerSummaryGenerator } from './_components/PioneerSummaryGenerator'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function PioneerSummaryPage() {
  await requirePermission('manageAllReport');

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/field-service/generate-report">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Reports
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Pioneer Summary Report</h1>
      </div>
      
      <PioneerSummaryGenerator />
    </div>
  );
}