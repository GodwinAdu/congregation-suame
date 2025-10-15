import React from 'react'
import { BudgetManager } from './_components/budget-manager'

const page = async () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background p-4">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold text-foreground">Budget Management</h1>
                    <p className="text-muted-foreground text-lg">
                        Plan and monitor congregation budgets with detailed tracking
                    </p>
                </div>
                <BudgetManager />
            </div>
        </div>
    )
}

export default page