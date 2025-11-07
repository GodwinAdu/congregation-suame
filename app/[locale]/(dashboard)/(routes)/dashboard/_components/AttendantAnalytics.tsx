"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Calendar, Users, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { getDashboardAnalytics } from '@/lib/actions/analytics.actions'

interface AttendantData {
    attendance: {
        totalMeetings: number
        averageAttendance: number
        weeklyMeetings: number
        weekendMeetings: number
        totalAttendance:number
    }
    members: {
        total: number
        active: number
    }
}

export default function AttendantAnalytics() {
    const [data, setData] = useState<AttendantData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const analytics = await getDashboardAnalytics()
                setData({
                    attendance: analytics.attendance,
                    members: { total: analytics.members.total, active: analytics.members.active }
                })
            } catch (err) {
                setError('Failed to load attendance data')
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => (
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
            {/* Attendance Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Meetings</p>
                                <p className="text-2xl font-bold">{data.attendance.totalMeetings}</p>
                                <p className="text-xs text-muted-foreground">this month</p>
                            </div>
                            <Calendar className="h-8 w-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>

               

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Attendance Count</p>
                                <p className="text-2xl font-bold">{data.attendance.totalAttendance}</p>
                                <p className="text-xs text-muted-foreground">in congregation</p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-purple-600" />
                        </div>
                    </CardContent>
                </Card>

                 <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Average Attendance</p>
                                <p className="text-2xl font-bold">{data.attendance.averageAttendance}</p>
                                <p className="text-xs text-muted-foreground">per meeting</p>
                            </div>
                            <Users className="h-8 w-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Meeting Breakdown */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Meeting Breakdown
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <p className="text-2xl font-bold text-blue-600">{data.attendance.weeklyMeetings}</p>
                            <p className="text-sm text-muted-foreground">Weekly Meetings</p>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            <p className="text-2xl font-bold text-green-600">{data.attendance.weekendMeetings}</p>
                            <p className="text-sm text-muted-foreground">Weekend Meetings</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}