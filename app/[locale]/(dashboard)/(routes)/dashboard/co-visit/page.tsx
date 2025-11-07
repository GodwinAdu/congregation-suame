import { requirePermission } from '@/lib/helpers/server-permission-check'
import { getCOVisits } from '@/lib/actions/co-visit.actions'
import { COVisitList } from './_components/COVisitList'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export default async function COVisitPage() {
  await requirePermission('coVisitView');
  
  const visits = await getCOVisits();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">CO Visit Schedule</h1>
        <Link href="/dashboard/co-visit/schedule">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Schedule Visit
          </Button>
        </Link>
      </div>
      
      <COVisitList visits={visits} />
    </div>
  );
}