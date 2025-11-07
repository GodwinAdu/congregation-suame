import { requirePermission } from '@/lib/helpers/server-permission-check'
import { COVisitForm } from '../_components/COVisitForm'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function ScheduleCOVisitPage() {
  await requirePermission('coVisitSchedule');

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/co-visit">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Schedule CO Visit</h1>
      </div>
      
      <COVisitForm />
    </div>
  );
}