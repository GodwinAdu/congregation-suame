import React from 'react'
import { FormManager } from './_components/form-manager'
import { requirePermission } from '@/lib/helpers/server-permission-check'

const page = async () => {
    await requirePermission('/dashboard/documents/forms')
    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background p-4">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold text-foreground">Form Management</h1>
                    <p className="text-muted-foreground text-lg">
                        Manage congregation forms and submissions
                    </p>
                </div>
                <FormManager />
            </div>
        </div>
    )
}

export default page