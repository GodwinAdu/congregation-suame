import { requirePermission } from '@/lib/helpers/server-permission-check'
import { TerritoryList } from '../_components/territory-list'
import { getTerritories, getTerritoryAssignments } from '@/lib/actions/territory.actions'

export default async function TerritoryListPage() {
  await requirePermission('territoryManage')
  
  const [territories, assignments] = await Promise.all([
    getTerritories(),
    getTerritoryAssignments()
  ])
  
  return <TerritoryList territories={territories} assignments={assignments} />
}