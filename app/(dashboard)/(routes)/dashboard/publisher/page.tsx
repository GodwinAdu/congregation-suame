import React from 'react'
import { PublisherDashboard } from './_components/publisher-dashboard'
import { getCurrentUser } from '@/lib/actions/user.actions'
import { fetchPublisherData } from '@/lib/actions/publisher.actions'

const page = async () => {
    const [currentUser, publisherData] = await Promise.all([
        getCurrentUser(),
        fetchPublisherData()
    ])

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <PublisherDashboard user={currentUser} data={publisherData} />
        </div>
    )
}

export default page