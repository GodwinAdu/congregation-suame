import { getAllMemberLocations } from '@/lib/actions/location.actions'
import { requirePermission } from '@/lib/helpers/server-permission-check'
import { MemberLocationsClient } from './_components/MemberLocationsClient'

export default async function MemberLocationsPage() {
    await requirePermission('members')

    const members = await getAllMemberLocations()

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Member Locations</h1>
                <p className="text-muted-foreground">
                    View and download all members&apos; home locations with GPS coordinates
                </p>
            </div>

            <MemberLocationsClient members={members} />
        </div>
    )
}
