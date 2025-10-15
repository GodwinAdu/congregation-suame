import React from 'react'
import { MessageCenter } from './_components/message-center'
import { fetchMessages } from '@/lib/actions/communication.actions'
import { fetchAllMembers, getCurrentUser } from '@/lib/actions/user.actions'

const page = async () => {
    const [messages, members, currentUser] = await Promise.all([
        fetchMessages(),
        fetchAllMembers(),
        getCurrentUser()
    ])

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background p-4">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold text-foreground">Message Center</h1>
                    <p className="text-muted-foreground text-lg">
                        Send and receive messages within the congregation
                    </p>
                </div>
                <MessageCenter messages={messages} members={members} currentUser={currentUser} />
            </div>
        </div>
    )
}

export default page