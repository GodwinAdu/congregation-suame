import React from 'react'
import { EventManager } from './_components/event-manager'
import { fetchEvents } from '@/lib/actions/event.actions'

const page = async () => {
    const events = await fetchEvents()

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background p-4">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold text-foreground">Event Management</h1>
                    <p className="text-muted-foreground text-lg">
                        Plan and manage congregation events and activities
                    </p>
                </div>
                <EventManager events={events} />
            </div>
        </div>
    )
}

export default page