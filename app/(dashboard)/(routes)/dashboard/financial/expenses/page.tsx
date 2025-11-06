import React from 'react'
import { ExpenseManager } from './_components/expense-manager'
import { requirePermission } from '@/lib/helpers/server-permission-check'

const page = async () => {
    await requirePermission('/dashboard/financial/expenses')
    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background p-4">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold text-foreground">Expense Management</h1>
                    <p className="text-muted-foreground text-lg">
                        Track and manage congregation expenses with approval workflow
                    </p>
                </div>
                <ExpenseManager />
            </div>
        </div>
    )
}

export default page