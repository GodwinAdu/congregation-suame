import { requirePermission } from '@/lib/helpers/server-permission-check'
import { ReportGenerator } from './_components/ReportGenerator'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { getReportFilterOptions } from '@/lib/actions/field-service-report.actions'

export default async function GenerateReportPage() {
  await requirePermission('manageAllReport');
  
  const { roles, groups, privileges, members } = await getReportFilterOptions();

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/manage-report">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Reports
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Generate Field Service Report</h1>
      </div>
      
      <ReportGenerator 
        roles={roles}
        groups={groups}
        privileges={privileges}
        members={members}
      />
    </div>
  );
}