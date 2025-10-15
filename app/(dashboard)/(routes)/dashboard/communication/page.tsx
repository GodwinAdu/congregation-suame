import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MessageSquare, Megaphone, Radio, Users, TrendingUp, Clock } from 'lucide-react'
import Link from 'next/link'
import { fetchMessages, fetchAnnouncements, fetchBroadcasts } from '@/lib/actions/communication.actions'

const page = async () => {
    const [messages, announcements, broadcasts] = await Promise.all([
        fetchMessages(),
        fetchAnnouncements(),
        fetchBroadcasts()
    ])

    const stats = [
        {
            title: "Messages",
            value: messages.length,
            icon: MessageSquare,
            href: "/dashboard/communication/messages",
            description: "Send and receive direct messages"
        },
        {
            title: "Announcements", 
            value: announcements.length,
            icon: Megaphone,
            href: "/dashboard/communication/announcements",
            description: "Create and manage announcements"
        },
        {
            title: "Broadcasts",
            value: broadcasts.length,
            icon: Radio,
            href: "/dashboard/communication/broadcasts", 
            description: "Send mass communications"
        }
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background p-4">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold text-foreground">Communication Hub</h1>
                    <p className="text-muted-foreground text-lg">
                        Manage all congregation communications in one place
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {stats.map((stat) => {
                        const Icon = stat.icon
                        return (
                            <Card key={stat.title} className="hover:shadow-lg transition-shadow">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        {stat.title}
                                    </CardTitle>
                                    <Icon className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stat.value}</div>
                                    <p className="text-xs text-muted-foreground mb-4">
                                        {stat.description}
                                    </p>
                                    <Link href={stat.href}>
                                        <Button className="w-full">
                                            Manage {stat.title}
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                Recent Messages
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {messages.slice(0, 5).length > 0 ? (
                                <div className="space-y-3">
                                    {messages.slice(0, 5).map((message: any) => (
                                        <div key={message._id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                            <div>
                                                <p className="font-medium text-sm">{message.subject}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    From: {message.from.fullName}
                                                </p>
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {new Date(message.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground text-center py-4">No recent messages</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5" />
                                Recent Announcements
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {announcements.slice(0, 5).length > 0 ? (
                                <div className="space-y-3">
                                    {announcements.slice(0, 5).map((announcement: any) => (
                                        <div key={announcement._id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                            <div>
                                                <p className="font-medium text-sm">{announcement.title}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    By: {announcement.author.fullName}
                                                </p>
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {new Date(announcement.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground text-center py-4">No recent announcements</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default page