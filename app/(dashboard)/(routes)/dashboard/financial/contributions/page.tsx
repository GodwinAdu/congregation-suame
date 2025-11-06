import React from 'react'
import { ContributionManager } from './_components/contribution-manager'
import { fetchContributions, fetchFinancialSummary } from '@/lib/actions/financial.actions'
import { fetchAllMembers } from '@/lib/actions/user.actions'

const page = async () => {
    
    const [contributions, summary, members] = await Promise.all([
        fetchContributions(),
        fetchFinancialSummary(),
        fetchAllMembers()
    ])
   

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background p-4">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold text-foreground">Contribution Management</h1>
                    <p className="text-muted-foreground text-lg">
                        Track and manage congregation contributions with detailed reporting
                    </p>
                </div>
                <ContributionManager 
                    contributions={contributions} 
                    summary={summary}
                    members={members}
                />
            </div>
        </div>
    )
}

export default page