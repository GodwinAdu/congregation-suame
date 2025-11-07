import { requirePermission } from '@/lib/helpers/server-permission-check'
import { COReportForm } from '../../_components/COReportForm'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function CreateCOReportPage() {
  await requirePermission('coVisitManage');

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/co-visit/reports">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Reports
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Create CO Visit Report</h1>
      </div>
      
      <COReportForm />
    </div>
  );
}