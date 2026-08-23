"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table'
import {
    Activity, Search, Loader2, RefreshCw, Calendar, User,
    FileText, Users, Shield, MapPin, Clock, CheckCircle2, XCircle
} from 'lucide-react'
import { getRecentActivities, getActivityStats } from '@/lib/actions/activity.actions'
import { formatDistanceToNow } from 'date-fns'

interface ActivityEntry {
    _id: string
    userId: { _id: string; fullName: string; email?: string }
    type: string
    action: string
    details?: {
        entityId?: string
        entityType?: string
        metadata?: any
    }
    success: boolean
    device?: string
    createdAt: string
}

interface Stats {
    todayCount: number
    weekCount: number
    totalCount: number
    typeStats: { _id: string; count: number }[]
}

export function ActivityLogClient() {
    const [activities, setActivities] = useState<ActivityEntry[]>([])
    const [stats, setStats] = useState<Stats | null>(null)
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [typeFilter, setTypeFilter] = useState('all')

    const loadData = async () => {
        setLoading(true)
        try {
            const [activityData, statsData] = await Promise.all([
                getRecentActivities(200),
                getActivityStats()
            ])
            setActivities(activityData)
            setStats(statsData)
        } catch (error) {
            console.error('Error loading activities:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [])

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'login': return <User className="h-3.5 w-3.5" />
            case 'report_submit':
            case 'report_update': return <FileText className="h-3.5 w-3.5" />
            case 'member_create':
            case 'member_delete':
            case 'profile_update': return <Users className="h-3.5 w-3.5" />
            case 'location_update': return <MapPin className="h-3.5 w-3.5" />
            case 'sms_sent':
            case 'bulk_sms_sent': return <Activity className="h-3.5 w-3.5" />
            default: return <Shield className="h-3.5 w-3.5" />
        }
    }

    const getTypeBadgeColor = (type: string) => {
        if (type.includes('delete')) return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
        if (type.includes('create') || type.includes('submit')) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
        if (type.includes('update')) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
        if (type.includes('login')) return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
        if (type.includes('sms')) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    }

    const uniqueTypes = Array.from(new Set(activities.map(a => a.type))).sort()

    const filteredActivities = activities.filter(a => {
        const matchesSearch = searchQuery === '' ||
            a.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.userId?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.type.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesType = typeFilter === 'all' || a.type === typeFilter
        return matchesSearch && matchesType
    })

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span className="text-muted-foreground">Loading activity log...</span>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Card>
                    <CardContent className="pt-4 pb-3 px-4">
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-blue-500" />
                            <div>
                                <p className="text-lg font-bold">{stats?.todayCount || 0}</p>
                                <p className="text-xs text-muted-foreground">Today</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4 pb-3 px-4">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-green-500" />
                            <div>
                                <p className="text-lg font-bold">{stats?.weekCount || 0}</p>
                                <p className="text-xs text-muted-foreground">This Week</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4 pb-3 px-4">
                        <div className="flex items-center gap-2">
                            <Activity className="h-4 w-4 text-purple-500" />
                            <div>
                                <p className="text-lg font-bold">{stats?.totalCount || 0}</p>
                                <p className="text-xs text-muted-foreground">All Time</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4 pb-3 px-4">
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-orange-500" />
                            <div>
                                <p className="text-lg font-bold">{stats?.typeStats?.length || 0}</p>
                                <p className="text-xs text-muted-foreground">Action Types</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-4 pb-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by action, user, or type..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="w-full sm:w-48">
                                <SelectValue placeholder="All Types" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                {uniqueTypes.map(type => (
                                    <SelectItem key={type} value={type}>
                                        {type.replace(/_/g, ' ')}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button variant="outline" size="sm" onClick={loadData} className="flex-shrink-0">
                            <RefreshCw className="h-4 w-4 mr-1.5" />
                            Refresh
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Activity Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Activity className="h-5 w-5" />
                        Recent Activity ({filteredActivities.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-10"></TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead>Action</TableHead>
                                    <TableHead className="hidden md:table-cell">Type</TableHead>
                                    <TableHead className="hidden lg:table-cell">Status</TableHead>
                                    <TableHead className="text-right">When</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredActivities.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                            No activities found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredActivities.map(activity => (
                                        <TableRow key={activity._id}>
                                            <TableCell>
                                                <div className="flex items-center justify-center">
                                                    {getTypeIcon(activity.type)}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-medium text-sm">
                                                    {activity.userId?.fullName || 'System'}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <p className="text-sm truncate max-w-[300px]" title={activity.action}>
                                                    {activity.action}
                                                </p>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">
                                                <Badge className={`text-xs ${getTypeBadgeColor(activity.type)}`}>
                                                    {activity.type.replace(/_/g, ' ')}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="hidden lg:table-cell">
                                                {activity.success ? (
                                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                ) : (
                                                    <XCircle className="h-4 w-4 text-red-500" />
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right text-xs text-muted-foreground whitespace-nowrap">
                                                {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
