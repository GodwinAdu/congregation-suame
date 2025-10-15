import React from 'react'
import { AIAssignmentSuggestions } from './_components/ai-assignment-suggestions'

const page = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background p-4">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold text-foreground">AI Assignment Suggestions</h1>
                    <p className="text-muted-foreground text-lg">
                        Get intelligent assignment recommendations based on member availability, skills, and workload
                    </p>
                </div>
                <AIAssignmentSuggestions />
            </div>
        </div>
    )
}

export default page