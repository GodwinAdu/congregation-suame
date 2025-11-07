import React from 'react'
import { CalendarView } from './_components/calendar-view'
import { getCalendarEvents } from '@/lib/actions/event.actions'
import { requirePermission } from '@/lib/helpers/server-permission-check'

const page = async () => {
    await requirePermission('/dashboard/calendar')
    const currentDate = new Date()
    const events = await getCalendarEvents(currentDate.getMonth() + 1, currentDate.getFullYear())

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background p-4">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold text-foreground">Calendar</h1>
                    <p className="text-muted-foreground text-lg">
                        View congregation schedule and upcoming events
                    </p>
                </div>
                <CalendarView initialEvents={events} />
            </div>
        </div>
    )
}

export default page