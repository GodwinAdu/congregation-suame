import React from 'react'
import { AIAnalytics } from './_components/ai-analytics'

const page = async () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background p-4">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold text-foreground">AI Analytics</h1>
                    <p className="text-muted-foreground text-lg">
                        Advanced analytics and predictive insights for congregation management
                    </p>
                </div>
                <AIAnalytics />
            </div>
        </div>
    )
}

export default page