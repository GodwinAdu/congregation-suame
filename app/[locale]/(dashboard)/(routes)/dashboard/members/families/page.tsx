import { fetchFamilies } from '@/lib/actions/family.actions'
import { requirePermission } from '@/lib/helpers/server-permission-check'
import FamilyGrid from './_components/FamilyGrid'
import Heading from '@/components/commons/Header'

export default async function FamiliesPage() {
    await requirePermission('members')

    return (
        <div className="space-y-6">
            <Heading
                title="Family Management"
                description="View and manage congregation family groups"
            />
            <FamilyGrid />
        </div>
    )
}
