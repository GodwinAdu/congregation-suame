import React from 'react'
import { TerritoryManager } from './_components/territory-manager'
import { fetchTerritories } from '@/lib/actions/territory.actions'
import { fetchAllMembers } from '@/lib/actions/user.actions'

const page = async () => {
    const [territories, members] = await Promise.all([
        fetchTerritories(),
        fetchAllMembers()
    ])

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background p-4">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold text-foreground">Territory Management</h1>
                    <p className="text-muted-foreground text-lg">
                        Manage territories, assignments, and return visits with GPS integration
                    </p>
                </div>
                <TerritoryManager territories={territories} members={members} />
            </div>
        </div>
    )
}

export default page