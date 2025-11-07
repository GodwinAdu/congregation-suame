import React from 'react'
import { NotificationCenter } from './_components/notification-center'
import { fetchNotifications, fetchNotificationPreferences, getNotificationStats } from '@/lib/actions/notification.actions'
import { requirePermission } from '@/lib/helpers/server-permission-check'

const page = async () => {
    await requirePermission('/dashboard/notifications')
    const [notifications, preferences, stats] = await Promise.all([
        fetchNotifications(),
        fetchNotificationPreferences(),
        getNotificationStats()
    ])

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background p-4">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold text-foreground">Notification Center</h1>
                    <p className="text-muted-foreground text-lg">
                        Manage your notifications and preferences with smart delivery options
                    </p>
                </div>
                <NotificationCenter 
                    notifications={notifications}
                    preferences={preferences}
                    stats={stats}
                />
            </div>
        </div>
    )
}

export default page