import React from 'react'
import { BroadcastCenter } from './_components/broadcast-center'
import { fetchAllMembers } from '@/lib/actions/user.actions'
import { fetchAllGroups } from '@/lib/actions/field-service.actions'
import { fetchBroadcasts } from '@/lib/actions/communication.actions'

const page = async () => {
    const [members, groups, broadcasts] = await Promise.all([
        fetchAllMembers(),
        fetchAllGroups(),
        fetchBroadcasts()
    ])

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background p-4">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold text-foreground">Broadcast Center</h1>
                    <p className="text-muted-foreground text-lg">
                        Send mass communications to congregation members
                    </p>
                </div>
                <BroadcastCenter members={members} groups={groups} broadcasts={broadcasts} />
            </div>
        </div>
    )
}

export default page