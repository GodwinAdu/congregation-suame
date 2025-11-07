"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
    Users, 
    UserPlus, 
    Shield, 
    Calendar, 
    FileText, 
    Car, 
    TrendingUp, 
    Activity,
    AlertCircle,
    Clock,
    CheckCircle
} from 'lucide-react'
import { getDashboardAnalytics } from '@/lib/actions/analytics.actions'
import { format } from 'date-fns'

interface AnalyticsData {
    members: {
        total: number
        active: number
        newThisMonth: number
        roleDistribution: { _id: string; count: number }[]
    }
    groups: {
        total: number
        memberCounts: { _id: string; name: string; memberCount: number }[]
    }
    attendance: {
        totalMeetings: number
        averageAttendance: number
        weeklyMeetings: number
        weekendMeetings: number
    }
    fieldService: {
        totalReports: number
        totalHours: number
        totalBibleStudies: number
        approvedReports: number
    }
    transport: {
        participating: number
        totalPaid: number
        fullyPaid: number
    }
    recentActivity: {
        newMembers: { _id: string; fullName: string; createdAt: string }[]
        newReports: { _id: string; publisher: { fullName: string }; createdAt: string }[]
    }
}

export default function DashboardAnalytics() {
    const [data, setData] = useState<AnalyticsData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const analytics = await getDashboardAnalytics()
                setData(analytics)
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
                                <p className="text-xs text-muted-foreground">
                                    {data.members.active} active
                                </p>
                            </div>
                            <Users className="h-8 w-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">New This Month</p>
                                <p className="text-2xl font-bold">{data.members.newThisMonth}</p>
                                <p className="text-xs text-green-600">
                                    +{data.members.newThisMonth} members
                                </p>
                            </div>
                            <UserPlus className="h-8 w-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Field Service</p>
                                <p className="text-2xl font-bold">{data.fieldService.totalHours}</p>
                                <p className="text-xs text-muted-foreground">
                                    hours this month
                                </p>
                            </div>
                            <FileText className="h-8 w-8 text-purple-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Attendance</p>
                                <p className="text-2xl font-bold">{data.attendance.averageAttendance}</p>
                                <p className="text-xs text-muted-foreground">
                                    average per meeting
                                </p>
                            </div>
                            <Calendar className="h-8 w-8 text-orange-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Role Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Role Distribution
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {data.members.roleDistribution.map((role) => (
                            <div key={role._id} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline">{role._id || 'Unassigned'}</Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">{role.count}</span>
                                    <Progress 
                                        value={(role.count / data.members.total) * 100} 
                                        className="w-20 h-2"
                                    />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Field Service Stats */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Field Service This Month
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-3 bg-muted/50 rounded-lg">
                                <p className="text-2xl font-bold text-blue-600">{data.fieldService.totalReports}</p>
                                <p className="text-sm text-muted-foreground">Reports</p>
                            </div>
                            <div className="text-center p-3 bg-muted/50 rounded-lg">
                                <p className="text-2xl font-bold text-green-600">{data.fieldService.totalBibleStudies}</p>
                                <p className="text-sm text-muted-foreground">Bible Studies</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Approved Reports</span>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="font-medium">{data.fieldService.approvedReports}/{data.fieldService.totalReports}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Transport Stats */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Car className="h-5 w-5" />
                            Transport Management
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-3 gap-2 text-center">
                            <div>
                                <p className="text-lg font-bold text-blue-600">{data.transport.participating}</p>
                                <p className="text-xs text-muted-foreground">Participating</p>
                            </div>
                            <div>
                                <p className="text-lg font-bold text-green-600">{data.transport.fullyPaid}</p>
                                <p className="text-xs text-muted-foreground">Fully Paid</p>
                            </div>
                            <div>
                                <p className="text-lg font-bold text-purple-600">₵{data.transport.totalPaid}</p>
                                <p className="text-xs text-muted-foreground">Collected</p>
                            </div>
                        </div>
                        {data.transport.participating > 0 && (
                            <Progress 
                                value={(data.transport.fullyPaid / data.transport.participating) * 100}
                                className="h-2"
                            />
                        )}
                    </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5" />
                            Recent Activity
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h4 className="text-sm font-medium mb-2">New Members (Last 7 days)</h4>
                            {data.recentActivity.newMembers.length > 0 ? (
                                <div className="space-y-2">
                                    {data.recentActivity.newMembers.map((member) => (
                                        <div key={member._id} className="flex items-center justify-between text-sm">
                                            <span>{member.fullName}</span>
                                            <span className="text-muted-foreground">
                                                {format(new Date(member.createdAt), 'MMM dd')}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">No new members</p>
                            )}
                        </div>
                        
                        <div>
                            <h4 className="text-sm font-medium mb-2">Recent Reports</h4>
                            {data.recentActivity.newReports.length > 0 ? (
                                <div className="space-y-2">
                                    {data.recentActivity.newReports.slice(0, 3).map((report) => (
                                        <div key={report._id} className="flex items-center justify-between text-sm">
                                            <span>{report.publisher.fullName}</span>
                                            <span className="text-muted-foreground">
                                                {format(new Date(report.createdAt), 'MMM dd')}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">No recent reports</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}