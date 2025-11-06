import React from 'react'
import { MemberInsights } from './_components/member-insights'
import { requirePermission } from '@/lib/helpers/server-permission-check'

const page = async () => {
    await requirePermission('/dashboard/ai/insights')
    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background p-4">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold text-foreground">Member Insights</h1>
                    <p className="text-muted-foreground text-lg">
                        AI-powered insights into member engagement and activity
                    </p>
                </div>
                <MemberInsights />
            </div>
        </div>
    )
}

export default page