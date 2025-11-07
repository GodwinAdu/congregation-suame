import { requirePermission } from '@/lib/helpers/server-permission-check'
import { getCOVisits } from '@/lib/actions/co-visit.actions'
import { COVisitList } from '../_components/COVisitList'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Filter } from 'lucide-react'

export default async function ManageCOVisitPage() {
  await requirePermission('coVisitManage');
  
  const visits = await getCOVisits();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Manage CO Visits</h1>
      
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search visits..." className="pl-10" />
        </div>
        <Select>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <COVisitList visits={visits} />
    </div>
  );
}