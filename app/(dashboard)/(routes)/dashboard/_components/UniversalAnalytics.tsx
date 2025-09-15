"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
    CheckCircle,
    Target,
    Award,
    BarChart3,
    PieChart,
    LineChart,
    Zap,
    Heart,
    Star,
    Trophy,
    Flame,
    RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getDashboardAnalytics } from '@/lib/actions/analytics.actions'
import { format, subMonths } from 'date-fns'

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
    trends: {
        monthly: { _id: { year: number; month: number }; count: number }[]
        topPublishers: { publisherName: string; totalHours: number; totalStudies: number; reportCount: number }[]
    }
    systemHealth: {
        totalUsers: number
        activeUsers: number
        inactiveUsers: number
        completionRate: number
        transportParticipation: number
        memberGrowth: number
        reportGrowth: number
        attendanceGrowth: number
    }
    demographics: {
        privileges: { _id: string; count: number }[]
        ageGroups: { _id: number | string; count: number }[]
    }
}

export default function UniversalAnalytics() {
    const [data, setData] = useState<AnalyticsData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
    const [refreshing, setRefreshing] = useState(false)

    const fetchData = async (isRefresh = false) => {
        if (isRefresh) {
            setRefreshing(true)
        } else {
            setLoading(true)
        }
        setError(null)

        try {
            const analytics = await getDashboardAnalytics()
            setData(analytics)
            setLastUpdated(new Date())
        } catch (err) {
            setError('Failed to load dashboard data')
            console.error('Analytics error:', err)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    useEffect(() => {
        fetchData()

        // Auto-refresh every 5 minutes
        const interval = setInterval(() => {
            fetchData(true)
        }, 5 * 60 * 1000)

        return () => clearInterval(interval)
    }, [])

    const handleRefresh = () => {
        fetchData(true)
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(8)].map((_, i) => (
                        <Card key={i} className="animate-pulse">
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

    const healthScore = Math.round((
        (data.systemHealth.activeUsers / data.systemHealth.totalUsers) * 25 +
        (data.systemHealth.completionRate) * 0.25 +
        (data.systemHealth.transportParticipation) * 0.25 +
        Math.min((data.attendance.averageAttendance / Math.max(data.members.active, 1)) * 25, 25)
    ))

    const getGrowthColor = (growth: number) => {
        if (growth > 0) return 'text-green-600'
        if (growth < 0) return 'text-red-600'
        return 'text-gray-600'
    }

    const getGrowthIcon = (growth: number) => {
        if (growth > 0) return '↗️'
        if (growth < 0) return '↘️'
        return '➡️'
    }

    return (
        <div className="space-y-6">
            {/* Header with Refresh */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-sm text-muted-foreground">Live Data</span>
                    </div>
                    {lastUpdated && (
                        <span className="text-xs text-muted-foreground">
                            Last updated: {format(lastUpdated, 'HH:mm:ss')}
                        </span>
                    )}
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="flex items-center gap-2"
                >
                    <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                    {refreshing ? 'Refreshing...' : 'Refresh'}
                </Button>
            </div>

            {/* System Health Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-blue-800">
                            <Zap className="h-5 w-5" />
                            System Health Score
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4">
                            <div className="relative w-24 h-24">
                                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="40" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="40"
                                        stroke="#3b82f6"
                                        strokeWidth="8"
                                        fill="none"
                                        strokeDasharray={`${healthScore * 2.51} 251`}
                                        className="transition-all duration-1000"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-2xl font-bold text-blue-600">{healthScore}%</span>
                                </div>
                            </div>
                            <div className="flex-1 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Active Members</span>
                                    <span className="font-medium">{data.systemHealth.activeUsers}/{data.systemHealth.totalUsers}</span>
                                </div>
                                <Progress value={(data.systemHealth.activeUsers / data.systemHealth.totalUsers) * 100} className="h-2" />

                                <div className="flex justify-between text-sm">
                                    <span>Report Completion</span>
                                    <span className="font-medium">{data.systemHealth.completionRate}%</span>
                                </div>
                                <Progress value={data.systemHealth.completionRate} className="h-2" />

                                <div className="flex justify-between text-sm">
                                    <span>Transport Participation</span>
                                    <span className="font-medium">{data.systemHealth.transportParticipation}%</span>
                                </div>
                                <Progress value={data.systemHealth.transportParticipation} className="h-2" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-800">
                            <Heart className="h-5 w-5" />
                            Quick Stats
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-green-700">New Members</span>
                            <Badge className="bg-green-600">{data.members.newThisMonth}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-green-700">Total Hours</span>
                            <Badge className="bg-green-600">{data.fieldService.totalHours}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-green-700">Bible Studies</span>
                            <Badge className="bg-green-600">{data.fieldService.totalBibleStudies}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-green-700">Meetings</span>
                            <Badge className="bg-green-600">{data.attendance.totalMeetings}</Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Analytics Tabs */}
            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full grid-cols-6">
                    <TabsTrigger value="overview" className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Overview
                    </TabsTrigger>
                    <TabsTrigger value="members" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Members
                    </TabsTrigger>
                    <TabsTrigger value="service" className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Service
                    </TabsTrigger>
                    <TabsTrigger value="meetings" className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Meetings
                    </TabsTrigger>
                    <TabsTrigger value="trends" className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Trends
                    </TabsTrigger>
                    <TabsTrigger value="activity" className="flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        Activity
                    </TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-blue-100">Total Members</p>
                                        <p className="text-3xl font-bold">{data.members.total}</p>
                                        <p className="text-xs text-blue-200">{data.members.active} active</p>
                                    </div>
                                    <Users className="h-10 w-10 text-blue-200" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-green-100">Service Hours</p>
                                        <div className="flex items-center gap-2">
                                            <p className="text-3xl font-bold">{data.fieldService.totalHours}</p>
                                            <span className={`text-sm ${getGrowthColor(data.systemHealth.reportGrowth)}`}>
                                                {getGrowthIcon(data.systemHealth.reportGrowth)} {Math.abs(data.systemHealth.reportGrowth)}%
                                            </span>
                                        </div>
                                        <p className="text-xs text-green-200">this month</p>
                                    </div>
                                    <Clock className="h-10 w-10 text-green-200" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-purple-100">Bible Studies</p>
                                        <p className="text-3xl font-bold">{data.fieldService.totalBibleStudies}</p>
                                        <p className="text-xs text-purple-200">conducted</p>
                                    </div>
                                    <FileText className="h-10 w-10 text-purple-200" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-orange-100">Avg Attendance</p>
                                        <div className="flex items-center gap-2">
                                            <p className="text-3xl font-bold">{data.attendance.averageAttendance}</p>
                                            <span className={`text-sm ${getGrowthColor(data.systemHealth.attendanceGrowth)}`}>
                                                {getGrowthIcon(data.systemHealth.attendanceGrowth)} {Math.abs(data.systemHealth.attendanceGrowth)}%
                                            </span>
                                        </div>
                                        <p className="text-xs text-orange-200">per meeting</p>
                                    </div>
                                    <Calendar className="h-10 w-10 text-orange-200" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Transport & Groups Overview */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Car className="h-5 w-5 text-blue-600" />
                                    Transport Management
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        <div className="p-3 bg-blue-50 rounded-lg">
                                            <p className="text-2xl font-bold text-blue-600">{data.transport.participating}</p>
                                            <p className="text-xs text-muted-foreground">Participating</p>
                                        </div>
                                        <div className="p-3 bg-green-50 rounded-lg">
                                            <p className="text-2xl font-bold text-green-600">{data.transport.fullyPaid}</p>
                                            <p className="text-xs text-muted-foreground">Fully Paid</p>
                                        </div>
                                        <div className="p-3 bg-purple-50 rounded-lg">
                                            <p className="text-2xl font-bold text-purple-600">₵{data.transport.totalPaid}</p>
                                            <p className="text-xs text-muted-foreground">Collected</p>
                                        </div>
                                    </div>
                                    {data.transport.participating > 0 && (
                                        <div>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span>Payment Progress</span>
                                                <span>{Math.round((data.transport.fullyPaid / data.transport.participating) * 100)}%</span>
                                            </div>
                                            <Progress value={(data.transport.fullyPaid / data.transport.participating) * 100} className="h-3" />
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-purple-600" />
                                    Group Distribution
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {data.groups.memberCounts.slice(0, 4).map((group, index) => (
                                        <div key={group._id} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-blue-500' :
                                                        index === 1 ? 'bg-green-500' :
                                                            index === 2 ? 'bg-purple-500' : 'bg-orange-500'
                                                    }`} />
                                                <span className="text-sm font-medium">{group.name}</span>
                                            </div>
                                            <Badge variant="outline">{group.memberCount} members</Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Members Tab */}
                <TabsContent value="members" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    Member Statistics
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                                        <p className="text-2xl font-bold text-blue-600">{data.members.total}</p>
                                        <p className="text-sm text-muted-foreground">Total Members</p>
                                    </div>
                                    <div className="text-center p-4 bg-green-50 rounded-lg">
                                        <p className="text-2xl font-bold text-green-600">{data.members.active}</p>
                                        <p className="text-sm text-muted-foreground">Active Members</p>
                                    </div>
                                </div>
                                <div className="text-center p-4 bg-purple-50 rounded-lg">
                                    <p className="text-2xl font-bold text-purple-600">{data.members.newThisMonth}</p>
                                    <p className="text-sm text-muted-foreground">New This Month</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5" />
                                    Role Distribution
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {data.members.roleDistribution.map((role, index) => (
                                    <div key={role._id} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className={
                                                index === 0 ? 'border-blue-500 text-blue-700' :
                                                    index === 1 ? 'border-green-500 text-green-700' :
                                                        index === 2 ? 'border-purple-500 text-purple-700' :
                                                            'border-orange-500 text-orange-700'
                                            }>
                                                {role._id || 'Unassigned'}
                                            </Badge>
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
                    </div>
                </TabsContent>

                {/* Service Tab */}
                <TabsContent value="service" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Trophy className="h-5 w-5 text-yellow-600" />
                                    Top Publishers
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {data.trends.topPublishers.map((publisher, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${index === 0 ? 'bg-yellow-500' :
                                                        index === 1 ? 'bg-gray-400' :
                                                            index === 2 ? 'bg-orange-600' : 'bg-blue-500'
                                                    }`}>
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <p className="font-medium">{publisher.publisherName}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {publisher.reportCount} reports
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-lg">{publisher.totalHours}h</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {publisher.totalStudies} studies
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Target className="h-5 w-5" />
                                    Service Overview
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                                        <p className="text-2xl font-bold text-blue-600">{data.fieldService.totalReports}</p>
                                        <p className="text-sm text-muted-foreground">Total Reports</p>
                                    </div>
                                    <div className="text-center p-4 bg-green-50 rounded-lg">
                                        <p className="text-2xl font-bold text-green-600">{data.fieldService.approvedReports}</p>
                                        <p className="text-sm text-muted-foreground">Approved</p>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span>Approval Rate</span>
                                        <span>{data.systemHealth.completionRate}%</span>
                                    </div>
                                    <Progress value={data.systemHealth.completionRate} className="h-3" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Meetings Tab */}
                <TabsContent value="meetings" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Meeting Statistics
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
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
                                <div className="text-center p-4 bg-purple-50 rounded-lg">
                                    <p className="text-2xl font-bold text-purple-600">{data.attendance.averageAttendance}</p>
                                    <p className="text-sm text-muted-foreground">Average Attendance</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Flame className="h-5 w-5 text-red-500" />
                                    Attendance Insights
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Flame className="h-4 w-4 text-red-500" />
                                        <span className="font-medium">Engagement Rate</span>
                                    </div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span>Active Participation</span>
                                        <span>{Math.round((data.attendance.averageAttendance / data.members.active) * 100)}%</span>
                                    </div>
                                    <Progress
                                        value={(data.attendance.averageAttendance / data.members.active) * 100}
                                        className="h-2"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Trends Tab */}
                <TabsContent value="trends" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-blue-600" />
                                    Growth Metrics
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                                        <div>
                                            <p className="font-medium">Member Growth</p>
                                            <p className="text-sm text-muted-foreground">vs last month</p>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-2xl font-bold ${getGrowthColor(data.systemHealth.memberGrowth)}`}>
                                                {getGrowthIcon(data.systemHealth.memberGrowth)} {Math.abs(data.systemHealth.memberGrowth)}%
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                                        <div>
                                            <p className="font-medium">Report Growth</p>
                                            <p className="text-sm text-muted-foreground">vs last month</p>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-2xl font-bold ${getGrowthColor(data.systemHealth.reportGrowth)}`}>
                                                {getGrowthIcon(data.systemHealth.reportGrowth)} {Math.abs(data.systemHealth.reportGrowth)}%
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                                        <div>
                                            <p className="font-medium">Attendance Growth</p>
                                            <p className="text-sm text-muted-foreground">vs last month</p>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-2xl font-bold ${getGrowthColor(data.systemHealth.attendanceGrowth)}`}>
                                                {getGrowthIcon(data.systemHealth.attendanceGrowth)} {Math.abs(data.systemHealth.attendanceGrowth)}%
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <PieChart className="h-5 w-5 text-purple-600" />
                                    Demographics
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="font-medium mb-3">Privilege Distribution</h4>
                                    <div className="space-y-2">
                                        {data.demographics.privileges.slice(0, 5).map((privilege, index) => (
                                            <div key={privilege._id} className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-blue-500' :
                                                            index === 1 ? 'bg-green-500' :
                                                                index === 2 ? 'bg-purple-500' :
                                                                    index === 3 ? 'bg-orange-500' : 'bg-gray-500'
                                                        }`} />
                                                    <span className="text-sm">{privilege._id || 'No Privilege'}</span>
                                                </div>
                                                <Badge variant="outline">{privilege.count}</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {data.demographics.ageGroups.length > 0 && (
                                    <div>
                                        <h4 className="font-medium mb-3">Age Groups</h4>
                                        <div className="space-y-2">
                                            {data.demographics.ageGroups.map((group, index) => {
                                                const ageLabel =
                                                    group._id === 0 ? 'Under 18' :
                                                        group._id === 18 ? '18-29' :
                                                            group._id === 30 ? '30-44' :
                                                                group._id === 45 ? '45-59' :
                                                                    group._id === 60 ? '60+' : 'Unknown'

                                                return (
                                                    <div key={group._id} className="flex items-center justify-between">
                                                        <span className="text-sm">{ageLabel}</span>
                                                        <Badge variant="outline">{group.count}</Badge>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Activity Tab */}
                <TabsContent value="activity" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Star className="h-5 w-5 text-yellow-500" />
                                    Recent New Members
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {data.recentActivity.newMembers.length > 0 ? (
                                    <div className="space-y-3">
                                        {data.recentActivity.newMembers.map((member) => (
                                            <div key={member._id} className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                                        <UserPlus className="h-4 w-4 text-white" />
                                                    </div>
                                                    <span className="font-medium">{member.fullName}</span>
                                                </div>
                                                <span className="text-sm text-muted-foreground">
                                                    {format(new Date(member.createdAt), 'MMM dd')}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center text-muted-foreground py-8">No new members this week</p>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="h-5 w-5 text-blue-500" />
                                    Recent Reports
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {data.recentActivity.newReports.length > 0 ? (
                                    <div className="space-y-3">
                                        {data.recentActivity.newReports.slice(0, 5).map((report) => (
                                            <div key={report._id} className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                                        <FileText className="h-4 w-4 text-white" />
                                                    </div>
                                                    <span className="font-medium">{report.publisher.fullName}</span>
                                                </div>
                                                <span className="text-sm text-muted-foreground">
                                                    {format(new Date(report.createdAt), 'MMM dd')}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center text-muted-foreground py-8">No recent reports</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}