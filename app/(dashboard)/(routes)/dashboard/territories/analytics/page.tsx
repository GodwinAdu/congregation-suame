import { requirePermission } from '@/lib/helpers/server-permission-check'
import { TerritoryAnalytics } from '../_components/territory-analytics'
import { getTerritories, getTerritoryAssignments } from '@/lib/actions/territory.actions'

export default async function TerritoryAnalyticsPage() {
  await requirePermission('territoryAnalytics')
  
  const [territories, assignments] = await Promise.all([
    getTerritories(),
    getTerritoryAssignments()
  ])
  
  return <TerritoryAnalytics territories={territories} assignments={assignments} />
}