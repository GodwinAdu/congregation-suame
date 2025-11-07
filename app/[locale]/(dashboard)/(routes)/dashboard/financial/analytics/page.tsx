import React from 'react'
import { FinancialAnalytics } from './_components/financial-analytics'
import { requirePermission } from '@/lib/helpers/server-permission-check'

const page = async () => {
    await requirePermission('/dashboard/financial/analytics')
    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background p-4">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold text-foreground">Financial Analytics</h1>
                    <p className="text-muted-foreground text-lg">
                        Monthly financial reports and analytics for congregation presentation
                    </p>
                </div>
                <FinancialAnalytics />
            </div>
        </div>
    )
}

export default page