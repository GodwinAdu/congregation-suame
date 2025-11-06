import React from 'react'
import { MembersMap } from './_components/members-map'
import { getMembersWithLocations } from '@/lib/actions/location.actions'
import { requirePermission } from '@/lib/helpers/server-permission-check'

const page = async () => {
    await requirePermission('/dashboard/members')
    
    const members = await getMembersWithLocations()
    
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Members Location Map</h1>
                <p className="text-muted-foreground">
                    View member locations and plan pastoral visits
                </p>
            </div>
            
            <MembersMap members={members} />
        </div>
    )
}

export default page