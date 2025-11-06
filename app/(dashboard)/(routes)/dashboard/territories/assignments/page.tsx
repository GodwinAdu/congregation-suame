import { requirePermission } from '@/lib/helpers/server-permission-check'
import { TerritoryAssignment } from '../_components/territory-assignment'
import { getTerritories, getTerritoryAssignments } from '@/lib/actions/territory.actions'
import { fetchAllMembers } from '@/lib/actions/user.actions'

export default async function TerritoryAssignmentsPage() {
  await requirePermission('territoryAssign')
  
  const [territories, assignments, members] = await Promise.all([
    getTerritories(),
    getTerritoryAssignments(),
    fetchAllMembers()
  ])
  
  const publishers = members.filter(member => 
    ['publisher', 'pioneer', 'ministerial servant', 'elder'].includes(member.role.toLowerCase())
  )
  
  return <TerritoryAssignment territories={territories} publishers={publishers} assignments={assignments} />
}