import { requirePermission } from '@/lib/helpers/server-permission-check'
import { TerritoryList } from '../_components/territory-list'
import { getTerritories, getTerritoryAssignments } from '@/lib/actions/territory.actions'

export default async function TerritoryListPage() {
  await requirePermission('territoryManage')
  
  const [territories, assignments] = await Promise.all([
    getTerritories(),
    getTerritoryAssignments()
  ])
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Territory List</h1>
        <p className="text-muted-foreground">
          Manage all congregation territories and their details
        </p>
      </div>
      <TerritoryList territories={territories} assignments={assignments} />
    </div>
  )
}