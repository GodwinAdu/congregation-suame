import React from 'react'
import { AnnouncementCenter } from './_components/announcement-center'
import { fetchAnnouncements } from '@/lib/actions/communication.actions'
import { fetchAllMembers } from '@/lib/actions/user.actions'

const page = async () => {
    const [announcements, members] = await Promise.all([
        fetchAnnouncements(),
        fetchAllMembers()
    ])

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background p-4">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold text-foreground">Announcements</h1>
                    <p className="text-muted-foreground text-lg">
                        Create and manage congregation announcements
                    </p>
                </div>
                <AnnouncementCenter announcements={announcements} members={members} />
            </div>
        </div>
    )
}

export default page