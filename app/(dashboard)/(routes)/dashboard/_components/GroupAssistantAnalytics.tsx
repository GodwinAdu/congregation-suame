"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Calendar, Users, Clock, CheckCircle, AlertCircle, Shield } from 'lucide-react'
import { getDashboardAnalytics } from '@/lib/actions/analytics.actions'

interface GroupAssistantData {
    attendance: {
        totalMeetings: number
        averageAttendance: number
        weeklyMeetings: number
        weekendMeetings: number
    }
    members: {
        total: number
        active: number
        roleDistribution: { _id: string; count: number }[]
    }
    groups: {
        total: number
        memberCounts: { _id: string; name: string; memberCount: number }[]
    }
}

export default function GroupAssistantAnalytics() {
    const [data, setData] = useState<GroupAssistantData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const analytics = await getDashboardAnalytics()
                setData({
                    attendance: analytics.attendance,
                    members: analytics.members,
                    groups: analytics.groups
                })
            } catch (err) {
                setError('Failed to load dashboard data')
                console.error('Analytics error:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i}>
                            <CardContent className="p-6">
                                <Skeleton className="h-8 w-16 mb-2" />
                                <Skeleton className="h-4 w-24" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        )
    }

    if (error || !data) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error || 'No data available'}</AlertDescription>
            </Alert>
        )
    }

    return (
        <div className="space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Members</p>
                                <p className="text-2xl font-bold">{data.members.total}</p>
                                <p className="text-xs text-muted-foreground">{data.members.active} active</p>
                            </div>
                            <Users className="h-8 w-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Groups</p>
                                <p className="text-2xl font-bold">{data.groups.total}</p>
                                <p className="text-xs text-muted-foreground">active groups</p>
                            </div>
                            <Shield className="h-8 w-8 text-purple-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Meetings</p>
                                <p className="text-2xl font-bold">{data.attendance.totalMeetings}</p>
                                <p className="text-xs text-muted-foreground">this month</p>
                            </div>
                            <Calendar className="h-8 w-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Avg Attendance</p>
                                <p className="text-2xl font-bold">{data.attendance.averageAttendance}</p>
                                <p className="text-xs text-muted-foreground">per meeting</p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-orange-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Group Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Group Distribution
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {data.groups.memberCounts.slice(0, 5).map((group) => (
                            <div key={group._id} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline">{group.name}</Badge>
                                </div>
                                <span className="text-sm font-medium">{group.memberCount} members</span>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Meeting Statistics */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Meeting Statistics
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-3 bg-blue-50 rounded-lg">
                                <p className="text-2xl font-bold text-blue-600">{data.attendance.weeklyMeetings}</p>
                                <p className="text-sm text-muted-foreground">Weekly</p>
                            </div>
                            <div className="text-center p-3 bg-green-50 rounded-lg">
                                <p className="text-2xl font-bold text-green-600">{data.attendance.weekendMeetings}</p>
                                <p className="text-sm text-muted-foreground">Weekend</p>
                            </div>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">
                                Average {data.attendance.averageAttendance} attendees per meeting
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}