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
    systemHealth?: {
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
    activities: {
        recent: { _id: string; userId: { fullName: string }; type: string; action: string; createdAt: string; success: boolean }[]
        stats: { _id: string; count: number }[]
        todayCount: number
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
        ((data.systemHealth?.activeUsers || 0) / (data.systemHealth?.totalUsers || 1)) * 25 +
        (data.systemHealth?.completionRate || 0) * 0.25 +
        (data.systemHealth?.transportParticipation || 0) * 0.25 +
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
        <div className="space-y-4 sm:space-y-6">
            {/* Header with Refresh */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
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
                    className="flex items-center gap-2 w-full sm:w-auto"
                >
                    <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                    {refreshing ? 'Refreshing...' : 'Refresh'}
                </Button>
            </div>

            {/* System Health Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                <Card className="lg:col-span-2 bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-blue-800 text-lg sm:text-xl">
                            <Zap className="h-5 w-5" />
                            System Health Score
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0">
                                <svg className="w-20 h-20 sm:w-24 sm:h-24 transform -rotate-90" viewBox="0 0 100 100">
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
                                    <span className="text-xl sm:text-2xl font-bold text-blue-600">{healthScore}%</span>
                                </div>
                            </div>
                            <div className="flex-1 space-y-2 w-full">
                                <div className="flex justify-between text-xs sm:text-sm">
                                    <span>Active Members</span>
                                    <span className="font-medium">{data.systemHealth?.activeUsers}/{data.systemHealth?.totalUsers}</span>
                                </div>
                                <Progress value={((data.systemHealth?.activeUsers || 0) / (data.systemHealth?.totalUsers || 1)) * 100} className="h-2" />

                                <div className="flex justify-between text-xs sm:text-sm">
                                    <span>Report Completion</span>
                                    <span className="font-medium">{data.systemHealth?.completionRate}%</span>
                                </div>
                                <Progress value={data.systemHealth?.completionRate || 0} className="h-2" />

                                <div className="flex justify-between text-xs sm:text-sm">
                                    <span>Transport Participation</span>
                                    <span className="font-medium">{data.systemHealth?.transportParticipation}%</span>
                                </div>
                                <Progress value={data.systemHealth?.transportParticipation || 0} className="h-2" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-800 text-lg sm:text-xl">
                            <Heart className="h-5 w-5" />
                            Quick Stats
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 sm:space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs sm:text-sm text-green-700">New Members</span>
                            <Badge className="bg-green-600 text-xs">{data.members.newThisMonth}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs sm:text-sm text-green-700">Total Hours</span>
                            <Badge className="bg-green-600 text-xs">{data.fieldService?.totalHours || 0}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs sm:text-sm text-green-700">Bible Studies</span>
                            <Badge className="bg-green-600 text-xs">{data.fieldService?.totalBibleStudies || 0}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs sm:text-sm text-green-700">Meetings</span>
                            <Badge className="bg-green-600 text-xs">{data.attendance.totalMeetings}</Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Analytics Tabs */}
            <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6">
                <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 h-auto p-1">
                    <TabsTrigger value="overview" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm">
                        <BarChart3 className="h-4 w-4" />
                        <span className="hidden sm:inline">Overview</span>
                        <span className="sm:hidden">Overview</span>
                    </TabsTrigger>
                    <TabsTrigger value="members" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm">
                        <Users className="h-4 w-4" />
                        <span className="hidden sm:inline">Members</span>
                        <span className="sm:hidden">Members</span>
                    </TabsTrigger>
                    <TabsTrigger value="service" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm">
                        <FileText className="h-4 w-4" />
                        <span className="hidden sm:inline">Service</span>
                        <span className="sm:hidden">Service</span>
                    </TabsTrigger>
                    <TabsTrigger value="meetings" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm">
                        <Calendar className="h-4 w-4" />
                        <span className="hidden sm:inline">Meetings</span>
                        <span className="sm:hidden">Meetings</span>
                    </TabsTrigger>
                    <TabsTrigger value="trends" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm">
                        <TrendingUp className="h-4 w-4" />
                        <span className="hidden sm:inline">Trends</span>
                        <span className="sm:hidden">Trends</span>
                    </TabsTrigger>
                    <TabsTrigger value="activity" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm">
                        <Activity className="h-4 w-4" />
                        <span className="hidden sm:inline">Activity</span>
                        <span className="sm:hidden">Activity</span>
                    </TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                            <CardContent className="p-3 sm:p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-blue-100 text-xs sm:text-sm">Total Members</p>
                                        <p className="text-xl sm:text-3xl font-bold">{data.members.total}</p>
                                        <p className="text-xs text-blue-200">{data.members.active} active</p>
                                    </div>
                                    <Users className="h-6 w-6 sm:h-10 sm:w-10 text-blue-200" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                            <CardContent className="p-3 sm:p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-green-100 text-xs sm:text-sm">Service Hours</p>
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2">
                                            <p className="text-xl sm:text-3xl font-bold">{data.fieldService?.totalHours || 0}</p>
                                            <span className={`text-xs sm:text-sm ${getGrowthColor(data.systemHealth?.reportGrowth || 0)}`}>
                                                {getGrowthIcon(data.systemHealth?.reportGrowth || 0)} {Math.abs(data.systemHealth?.reportGrowth || 0)}%
                                            </span>
                                        </div>
                                        <p className="text-xs text-green-200">this month</p>
                                    </div>
                                    <Clock className="h-6 w-6 sm:h-10 sm:w-10 text-green-200" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                            <CardContent className="p-3 sm:p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-purple-100 text-xs sm:text-sm">Bible Studies</p>
                                        <p className="text-xl sm:text-3xl font-bold">{data.fieldService?.totalBibleStudies || 0}</p>
                                        <p className="text-xs text-purple-200">conducted</p>
                                    </div>
                                    <FileText className="h-6 w-6 sm:h-10 sm:w-10 text-purple-200" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white col-span-2 lg:col-span-1">
                            <CardContent className="p-3 sm:p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-orange-100 text-xs sm:text-sm">Avg Attendance</p>
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2">
                                            <p className="text-xl sm:text-3xl font-bold">{data.attendance.averageAttendance}</p>
                                            <span className={`text-xs sm:text-sm ${getGrowthColor(data.systemHealth?.attendanceGrowth || 0)}`}>
                                                {getGrowthIcon(data.systemHealth?.attendanceGrowth || 0)} {Math.abs(data.systemHealth?.attendanceGrowth || 0)}%
                                            </span>
                                        </div>
                                        <p className="text-xs text-orange-200">per meeting</p>
                                    </div>
                                    <Calendar className="h-6 w-6 sm:h-10 sm:w-10 text-orange-200" />
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
                                            <p className="text-2xl font-bold text-blue-600">{data.transport?.participating || 0}</p>
                                            <p className="text-xs text-muted-foreground">Participating</p>
                                        </div>
                                        <div className="p-3 bg-green-50 rounded-lg">
                                            <p className="text-2xl font-bold text-green-600">{data.transport?.fullyPaid || 0}</p>
                                            <p className="text-xs text-muted-foreground">Fully Paid</p>
                                        </div>
                                        <div className="p-3 bg-purple-50 rounded-lg">
                                            <p className="text-2xl font-bold text-purple-600">₵{data.transport?.totalPaid || 0}</p>
                                            <p className="text-xs text-muted-foreground">Collected</p>
                                        </div>
                                    </div>
                                    {(data.transport?.participating || 0) > 0 && (
                                        <div>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span>Payment Progress</span>
                                                <span>{Math.round(((data.transport?.fullyPaid || 0) / (data.transport?.participating || 1)) * 100)}%</span>
                                            </div>
                                            <Progress value={((data.transport?.fullyPaid || 0) / (data.transport?.participating || 1)) * 100} className="h-3" />
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
                                    {(data.groups?.memberCounts || []).slice(0, 4).map((group, index) => (
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
                                {(data.members?.roleDistribution || []).map((role, index) => (
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
                                    {(data.trends?.topPublishers || []).map((publisher, index) => (
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
                                        <p className="text-2xl font-bold text-blue-600">{data.fieldService?.totalReports || 0}</p>
                                        <p className="text-sm text-muted-foreground">Total Reports</p>
                                    </div>
                                    <div className="text-center p-4 bg-green-50 rounded-lg">
                                        <p className="text-2xl font-bold text-green-600">{data.fieldService?.approvedReports || 0}</p>
                                        <p className="text-sm text-muted-foreground">Approved</p>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span>Approval Rate</span>
                                        <span>{data.systemHealth?.completionRate || 0}%</span>
                                    </div>
                                    <Progress value={data.systemHealth?.completionRate || 0} className="h-3" />
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
                                            <p className={`text-2xl font-bold ${getGrowthColor(data.systemHealth?.memberGrowth || 0)}`}>
                                                {getGrowthIcon(data.systemHealth?.memberGrowth || 0)} {Math.abs(data.systemHealth?.memberGrowth || 0)}%
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                                        <div>
                                            <p className="font-medium">Report Growth</p>
                                            <p className="text-sm text-muted-foreground">vs last month</p>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-2xl font-bold ${getGrowthColor(data.systemHealth?.reportGrowth || 0)}`}>
                                                {getGrowthIcon(data.systemHealth?.reportGrowth || 0)} {Math.abs(data.systemHealth?.reportGrowth || 0)}%
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                                        <div>
                                            <p className="font-medium">Attendance Growth</p>
                                            <p className="text-sm text-muted-foreground">vs last month</p>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-2xl font-bold ${getGrowthColor(data.systemHealth?.attendanceGrowth || 0)}`}>
                                                {getGrowthIcon(data.systemHealth?.attendanceGrowth || 0)} {Math.abs(data.systemHealth?.attendanceGrowth || 0)}%
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
                                        {(data.demographics?.privileges || []).slice(0, 5).map((privilege, index) => (
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

                                {(data.demographics?.ageGroups || []).length > 0 && (
                                    <div>
                                        <h4 className="font-medium mb-3">Age Groups</h4>
                                        <div className="space-y-2">
                                            {(data.demographics?.ageGroups || []).map((group, index) => {
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
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Activity Stats */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="h-5 w-5 text-blue-500" />
                                    Activity Overview
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="text-center p-4 bg-blue-50 rounded-lg">
                                    <p className="text-2xl font-bold text-blue-600">{data.activities?.todayCount || 0}</p>
                                    <p className="text-sm text-muted-foreground">Activities Today</p>
                                </div>
                                
                                <div className="space-y-2">
                                    <h4 className="font-medium text-sm">Activity Types (Last 7 days)</h4>
                                    {data.activities?.stats?.slice(0, 5).map((stat, index) => (
                                        <div key={stat._id} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-3 h-3 rounded-full ${
                                                    index === 0 ? 'bg-blue-500' :
                                                    index === 1 ? 'bg-green-500' :
                                                    index === 2 ? 'bg-purple-500' :
                                                    index === 3 ? 'bg-orange-500' : 'bg-gray-500'
                                                }`} />
                                                <span className="text-sm capitalize">{stat._id.replace('_', ' ')}</span>
                                            </div>
                                            <Badge variant="outline">{stat.count}</Badge>
                                        </div>
                                    )) || <p className="text-sm text-muted-foreground">No activity data</p>}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Activities */}
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-green-500" />
                                    Recent System Activities
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {data.activities?.recent?.length > 0 ? (
                                    <div className="space-y-3 max-h-96 overflow-y-auto">
                                        {data.activities.recent.map((activity) => (
                                            <div key={activity._id} className="flex items-start gap-3 p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                                    activity.success ? 'bg-green-500' : 'bg-red-500'
                                                }`}>
                                                    {activity.type === 'login' ? <Users className="h-4 w-4 text-white" /> :
                                                     activity.type === 'profile_update' ? <UserPlus className="h-4 w-4 text-white" /> :
                                                     activity.type === 'report_generate' ? <FileText className="h-4 w-4 text-white" /> :
                                                     activity.type === 'system_access' ? <Shield className="h-4 w-4 text-white" /> :
                                                     <Activity className="h-4 w-4 text-white" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {activity.userId?.fullName || 'Unknown User'}
                                                    </p>
                                                    <p className="text-sm text-gray-600 truncate">
                                                        {activity.action}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Badge variant="outline" className="text-xs">
                                                            {activity.type.replace('_', ' ')}
                                                        </Badge>
                                                        <span className="text-xs text-muted-foreground">
                                                            {format(new Date(activity.createdAt), 'MMM dd, HH:mm')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center text-muted-foreground py-8">No recent activities</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                    
                    {/* Legacy Activity Cards */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Star className="h-5 w-5 text-yellow-500" />
                                    Recent New Members
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {(data.recentActivity?.newMembers || []).length > 0 ? (
                                    <div className="space-y-3">
                                        {(data.recentActivity?.newMembers || []).map((member) => (
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
                                    <FileText className="h-5 w-5 text-blue-500" />
                                    Recent Reports
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {(data.recentActivity?.newReports || []).length > 0 ? (
                                    <div className="space-y-3">
                                        {(data.recentActivity?.newReports || []).slice(0, 5).map((report) => (
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