import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
    MessageSquare, 
    Megaphone, 
    Radio, 
    Users, 
    TrendingUp, 
    Clock, 
    Send, 
    Eye, 
    CheckCircle, 
    AlertCircle,
    BarChart3,
    Calendar,
    Filter,
    Search,
    Plus,
    Bell,
    Star,
    Archive,
    Trash2,
    Settings
} from 'lucide-react'
import Link from 'next/link'
import { fetchMessages, fetchAnnouncements, fetchBroadcasts } from '@/lib/actions/communication.actions'
import { format, isToday, isYesterday, subDays } from 'date-fns'

const page = async () => {
    const [messages, announcements, broadcasts] = await Promise.all([
        fetchMessages(),
        fetchAnnouncements(),
        fetchBroadcasts()
    ])

    // Calculate analytics
    const totalCommunications = messages.length + announcements.length + broadcasts.length
    const todayMessages = messages.filter((msg: any) => isToday(new Date(msg.createdAt))).length
    const unreadMessages = messages.filter((msg: any) => !msg.read).length
    const activeAnnouncements = announcements.filter((ann: any) => 
        new Date(ann.expiresAt || new Date()) > new Date()
    ).length
    const scheduledBroadcasts = broadcasts.filter((bc: any) => 
        new Date(bc.scheduledAt || new Date()) > new Date()
    ).length
    
    // Engagement metrics
    const totalViews = announcements.reduce((sum: number, ann: any) => sum + (ann.views || 0), 0)
    const avgEngagement = totalViews > 0 ? Math.round((totalViews / announcements.length) * 100) / 100 : 0

    const stats = [
        {
            title: "Messages",
            value: messages.length,
            change: `+${todayMessages} today`,
            icon: MessageSquare,
            href: "/dashboard/communication/messages",
            description: "Direct messaging system",
            color: "bg-blue-500",
            unread: unreadMessages
        },
        {
            title: "Announcements", 
            value: announcements.length,
            change: `${activeAnnouncements} active`,
            icon: Megaphone,
            href: "/dashboard/communication/announcements",
            description: "Congregation announcements",
            color: "bg-green-500",
            unread: activeAnnouncements
        },
        {
            title: "Broadcasts",
            value: broadcasts.length,
            change: `${scheduledBroadcasts} scheduled`,
            icon: Radio,
            href: "/dashboard/communication/broadcasts", 
            description: "Mass communication system",
            color: "bg-purple-500",
            unread: scheduledBroadcasts
        }
    ]

    const formatMessageDate = (date: string) => {
        const messageDate = new Date(date)
        if (isToday(messageDate)) return 'Today'
        if (isYesterday(messageDate)) return 'Yesterday'
        return format(messageDate, 'MMM dd')
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'bg-red-500'
            case 'medium': return 'bg-yellow-500'
            case 'low': return 'bg-green-500'
            default: return 'bg-gray-500'
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-3 sm:p-6">
            <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl sm:rounded-2xl p-4 sm:p-8 text-white">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-4xl font-bold mb-2">Communication Hub</h1>
                            <p className="text-blue-100 text-sm sm:text-lg">
                                Streamlined congregation communication management
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-center">
                                <div className="text-2xl sm:text-3xl font-bold">{totalCommunications}</div>
                                <div className="text-blue-100 text-xs sm:text-sm">Total Communications</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
                    {stats.map((stat) => {
                        const Icon = stat.icon
                        return (
                            <Card key={stat.title} className="hover:shadow-lg transition-all duration-200 border-l-4" style={{borderLeftColor: stat.color.replace('bg-', '#')}}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <div className="flex items-center gap-2">
                                        <div className={`p-2 rounded-lg ${stat.color} bg-opacity-10`}>
                                            <Icon className={`h-4 w-4 ${stat.color.replace('bg-', 'text-')}`} />
                                        </div>
                                        <CardTitle className="text-sm font-medium">
                                            {stat.title}
                                        </CardTitle>
                                    </div>
                                    {stat.unread > 0 && (
                                        <Badge className="bg-red-500 text-white text-xs">
                                            {stat.unread}
                                        </Badge>
                                    )}
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="text-2xl font-bold">{stat.value}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {stat.change}
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground mb-4">
                                        {stat.description}
                                    </p>
                                    <Link href={stat.href}>
                                        <Button className="w-full" size="sm">
                                            <Icon className="h-4 w-4 mr-2" />
                                            Open {stat.title}
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>

                {/* Analytics Overview */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
                    <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-700 text-xs sm:text-sm font-medium">Engagement Rate</p>
                                    <p className="text-2xl font-bold text-green-800">{avgEngagement}%</p>
                                </div>
                                <TrendingUp className="h-8 w-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-700 text-xs sm:text-sm font-medium">Today's Activity</p>
                                    <p className="text-2xl font-bold text-blue-800">{todayMessages}</p>
                                </div>
                                <Calendar className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-to-br from-purple-50 to-violet-100 border-purple-200">
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-purple-700 text-xs sm:text-sm font-medium">Total Views</p>
                                    <p className="text-2xl font-bold text-purple-800">{totalViews}</p>
                                </div>
                                <Eye className="h-8 w-8 text-purple-600" />
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-to-br from-orange-50 to-amber-100 border-orange-200">
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-orange-700 text-xs sm:text-sm font-medium">Unread Items</p>
                                    <p className="text-2xl font-bold text-orange-800">{unreadMessages}</p>
                                </div>
                                <Bell className="h-8 w-8 text-orange-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Activity Tabs */}
                <Tabs defaultValue="messages" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-3 h-auto p-1">
                        <TabsTrigger value="messages" className="flex items-center gap-2 p-2 sm:p-3 text-xs sm:text-sm">
                            <MessageSquare className="h-4 w-4" />
                            <span className="hidden sm:inline">Messages</span>
                            <span className="sm:hidden">Messages</span>
                            {unreadMessages > 0 && (
                                <Badge className="bg-red-500 text-white text-xs ml-1">
                                    {unreadMessages}
                                </Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="announcements" className="flex items-center gap-2 p-2 sm:p-3 text-xs sm:text-sm">
                            <Megaphone className="h-4 w-4" />
                            <span className="hidden sm:inline">Announcements</span>
                            <span className="sm:hidden">Announce</span>
                        </TabsTrigger>
                        <TabsTrigger value="broadcasts" className="flex items-center gap-2 p-2 sm:p-3 text-xs sm:text-sm">
                            <Radio className="h-4 w-4" />
                            <span className="hidden sm:inline">Broadcasts</span>
                            <span className="sm:hidden">Broadcast</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="messages" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                    <CardTitle className="flex items-center gap-2">
                                        <MessageSquare className="h-5 w-5 text-blue-600" />
                                        Recent Messages
                                    </CardTitle>
                                    <Link href="/dashboard/communication/messages">
                                        <Button size="sm" className="w-full sm:w-auto">
                                            <Plus className="h-4 w-4 mr-2" />
                                            New Message
                                        </Button>
                                    </Link>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {messages.slice(0, 5).length > 0 ? (
                                    <div className="space-y-3">
                                        {messages.slice(0, 5).map((message: any) => (
                                            <div key={message._id} className="flex items-start gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg hover:shadow-md transition-shadow">
                                                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <MessageSquare className="h-4 w-4 text-white" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-medium text-sm truncate">{message.subject}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                From: {message.from?.fullName || 'Unknown'}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-2 flex-shrink-0">
                                                            {!message.read && (
                                                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                            )}
                                                            <div className="text-xs text-muted-foreground">
                                                                {formatMessageDate(message.createdAt)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {message.priority && (
                                                        <Badge className={`${getPriorityColor(message.priority)} text-white text-xs mt-1`}>
                                                            {message.priority} priority
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <p className="text-muted-foreground">No recent messages</p>
                                        <Link href="/dashboard/communication/messages">
                                            <Button className="mt-4">
                                                <Plus className="h-4 w-4 mr-2" />
                                                Send First Message
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="announcements" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                    <CardTitle className="flex items-center gap-2">
                                        <Megaphone className="h-5 w-5 text-green-600" />
                                        Recent Announcements
                                    </CardTitle>
                                    <Link href="/dashboard/communication/announcements">
                                        <Button size="sm" className="w-full sm:w-auto">
                                            <Plus className="h-4 w-4 mr-2" />
                                            New Announcement
                                        </Button>
                                    </Link>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {announcements.slice(0, 5).length > 0 ? (
                                    <div className="space-y-3">
                                        {announcements.slice(0, 5).map((announcement: any) => (
                                            <div key={announcement._id} className="flex items-start gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg hover:shadow-md transition-shadow">
                                                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <Megaphone className="h-4 w-4 text-white" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-medium text-sm truncate">{announcement.title}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                By: {announcement.author?.fullName || 'Unknown'}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-2 flex-shrink-0">
                                                            {announcement.views > 0 && (
                                                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                                    <Eye className="h-3 w-3" />
                                                                    {announcement.views}
                                                                </div>
                                                            )}
                                                            <div className="text-xs text-muted-foreground">
                                                                {formatMessageDate(announcement.createdAt)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        {announcement.priority && (
                                                            <Badge className={`${getPriorityColor(announcement.priority)} text-white text-xs`}>
                                                                {announcement.priority}
                                                            </Badge>
                                                        )}
                                                        {announcement.targetAudience && (
                                                            <Badge variant="outline" className="text-xs">
                                                                {announcement.targetAudience}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <Megaphone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <p className="text-muted-foreground">No recent announcements</p>
                                        <Link href="/dashboard/communication/announcements">
                                            <Button className="mt-4">
                                                <Plus className="h-4 w-4 mr-2" />
                                                Create First Announcement
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="broadcasts" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                    <CardTitle className="flex items-center gap-2">
                                        <Radio className="h-5 w-5 text-purple-600" />
                                        Recent Broadcasts
                                    </CardTitle>
                                    <Link href="/dashboard/communication/broadcasts">
                                        <Button size="sm" className="w-full sm:w-auto">
                                            <Plus className="h-4 w-4 mr-2" />
                                            New Broadcast
                                        </Button>
                                    </Link>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {broadcasts.slice(0, 5).length > 0 ? (
                                    <div className="space-y-3">
                                        {broadcasts.slice(0, 5).map((broadcast: any) => (
                                            <div key={broadcast._id} className="flex items-start gap-3 p-3 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg hover:shadow-md transition-shadow">
                                                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <Radio className="h-4 w-4 text-white" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-medium text-sm truncate">{broadcast.title}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                To: {broadcast.audience || 'All Members'}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-2 flex-shrink-0">
                                                            {broadcast.status === 'scheduled' && (
                                                                <Badge className="bg-yellow-500 text-white text-xs">
                                                                    Scheduled
                                                                </Badge>
                                                            )}
                                                            <div className="text-xs text-muted-foreground">
                                                                {formatMessageDate(broadcast.createdAt)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        {broadcast.channels?.map((channel: string) => (
                                                            <Badge key={channel} variant="outline" className="text-xs">
                                                                {channel}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <Radio className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <p className="text-muted-foreground">No recent broadcasts</p>
                                        <Link href="/dashboard/communication/broadcasts">
                                            <Button className="mt-4">
                                                <Plus className="h-4 w-4 mr-2" />
                                                Create First Broadcast
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Quick Actions */}
                <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-lg sm:text-xl font-bold mb-2">Quick Actions</h3>
                                <p className="text-blue-100 text-sm">
                                    Streamline your communication workflow
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                                <Link href="/dashboard/communication/messages">
                                    <Button className="bg-white/20 hover:bg-white/30 text-white border-white/30 w-full sm:w-auto">
                                        <Send className="h-4 w-4 mr-2" />
                                        Send Message
                                    </Button>
                                </Link>
                                <Link href="/dashboard/communication/announcements">
                                    <Button className="bg-white/20 hover:bg-white/30 text-white border-white/30 w-full sm:w-auto">
                                        <Megaphone className="h-4 w-4 mr-2" />
                                        Make Announcement
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default page