"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
    FileText, 
    Clock, 
    BookOpen, 
    Calendar, 
    Car, 
    Activity, 
    Plus,
    TrendingUp,
    Award,
    Target,
    CheckCircle,
    AlertCircle,
    User,
    Mail,
    Phone,
    MapPin,
    Users,
    Presentation,
    Mic,
    CalendarDays
} from 'lucide-react'
import { FieldServiceReportModal } from './field-service-report-modal'
import { format, startOfWeek, endOfWeek, isWithinInterval, subMonths } from 'date-fns'

interface User {
    _id: string
    fullName: string
    email: string
    phone: string
    address?: string
    role: string
    privileges: Array<{ name: string }>
    groupId: { name: string }
}

interface PublisherData {
    reports: Array<{
        _id: string
        month: string
        hours?: number
        bibleStudents: number
        auxiliaryPioneer?: boolean
        comments?: string
        check: boolean
        createdAt: string
    }>
    statistics: {
        totalReports: number
        totalHours: number
        totalStudies: number
        averageHours: number
    }
    thisMonth: {
        hasReport: boolean
        report?: any
        month: string
    }
    transport: {
        active: Array<{
            feeId: { name: string; amount: number }
            amountPaid: number
            isPaid: boolean
            balance: number
        }>
        totalPaid: number
        participating: boolean
    }
    assignments: {
        all: Array<{
            _id: string
            week: string
            meetingType: string
            assignmentType: string
            title: string
            description?: string
            duration?: number
            source?: string
        }>
        upcoming: Array<{
            _id: string
            week: string
            meetingType: string
            assignmentType: string
            title: string
            description?: string
            duration?: number
            source?: string
        }>
        total: number
    }
    attendance: {
        totalMeetings: number
        averageAttendance: number
        weeklyMeetings: number
        weekendMeetings: number
    }
    activities: Array<{
        _id: string
        type: string
        action: string
        createdAt: string
        success: boolean
    }>
}

interface PublisherDashboardProps {
    user: User
    data: PublisherData
}

export function PublisherDashboard({ user, data }: PublisherDashboardProps) {
    const [showReportModal, setShowReportModal] = useState(false)
    const [selectedMonth, setSelectedMonth] = useState('all')
    const [selectedReportMonth, setSelectedReportMonth] = useState('')
    
    const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
    const currentWeekEnd = endOfWeek(new Date(), { weekStartsOn: 1 })
    
    const currentWeekAssignments = data.assignments?.all?.filter(assignment => 
        isWithinInterval(new Date(assignment.week), {
            start: currentWeekStart,
            end: currentWeekEnd
        })
    ) || []
    
    const monthOptions = Array.from({ length: 12 }, (_, i) => {
        const date = subMonths(new Date(), 6 - i)
        return {
            value: format(date, 'yyyy-MM'),
            label: format(date, 'MMMM yyyy')
        }
    })
    
    // Get months without reports from last submitted report to current month
    const getMissingReports = () => {
        if (data.reports.length === 0) {
            // If no reports, show current month only
            const currentMonth = format(new Date(), 'yyyy-MM')
            return [{
                value: currentMonth,
                label: format(new Date(), 'MMMM yyyy')
            }]
        }
        
        // Find the most recent report month
        const sortedReports = [...data.reports].sort((a, b) => 
            new Date(b.month).getTime() - new Date(a.month).getTime()
        )
        const lastReportDate = new Date(sortedReports[0].month)
        const currentDate = new Date()
        
        const missingMonths = []
        let checkDate = new Date(lastReportDate)
        checkDate.setMonth(checkDate.getMonth() + 1) // Start from month after last report
        
        while (checkDate <= currentDate) {
            const monthStr = format(checkDate, 'yyyy-MM')
            const hasReport = data.reports.some(report => 
                format(new Date(report.month), 'yyyy-MM') === monthStr
            )
            
            if (!hasReport) {
                missingMonths.push({
                    value: monthStr,
                    label: format(checkDate, 'MMMM yyyy')
                })
            }
            
            checkDate.setMonth(checkDate.getMonth() + 1)
        }
        
        return missingMonths
    }
    
    const missingReports = getMissingReports()

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase()
    }

    const getMonthName = (monthStr: string) => {
        const [year, month] = monthStr.split('-')
        return format(new Date(parseInt(year), parseInt(month) - 1), 'MMMM yyyy')
    }

    return (
        <div className="container mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl sm:rounded-2xl p-4 sm:p-8 text-white">
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                    <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-4 border-white/20">
                        <AvatarFallback className="bg-white/20 text-white text-xl sm:text-2xl font-bold">
                            {getInitials(user.fullName)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-center sm:text-left">
                        <h1 className="text-xl sm:text-3xl font-bold mb-2">Welcome, {user.fullName.split(' ')[0]}</h1>
                        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-blue-100">
                            <Badge className="bg-white/20 text-white border-white/30 text-xs sm:text-sm">
                                {user.role.replace('_', ' ').toUpperCase()}
                            </Badge>
                            <span className="text-sm sm:text-base">{user.groupId?.name}</span>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 mt-3 text-xs sm:text-sm text-blue-100">
                            <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3 sm:h-4 sm:w-4" />
                                <span className="truncate max-w-[200px]">{user.email}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3 sm:h-4 sm:w-4" />
                                {user.phone}
                            </div>
                        </div>
                    </div>
                    <div className="text-center sm:text-right">
                        <div className="text-2xl sm:text-3xl font-bold">{data.statistics.totalHours}</div>
                        <div className="text-blue-100 text-sm sm:text-base">Total Hours</div>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white col-span-2 sm:col-span-1">
                    <CardContent className="p-3 sm:p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-xs sm:text-sm">This Month</p>
                                <p className="text-sm sm:text-2xl font-bold">
                                    {data.thisMonth.hasReport ? 'Submitted' : 'Pending'}
                                </p>
                            </div>
                            {data.thisMonth.hasReport ? 
                                <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-200" /> :
                                <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-200" />
                            }
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    <CardContent className="p-3 sm:p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-xs sm:text-sm">Reports</p>
                                <p className="text-lg sm:text-2xl font-bold">{data.statistics.totalReports}</p>
                            </div>
                            <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-blue-200" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                    <CardContent className="p-3 sm:p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-100 text-xs sm:text-sm">Studies</p>
                                <p className="text-lg sm:text-2xl font-bold">{data.statistics.totalStudies}</p>
                            </div>
                            <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-purple-200" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                    <CardContent className="p-3 sm:p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-orange-100 text-xs sm:text-sm">Avg Hours</p>
                                <p className="text-lg sm:text-2xl font-bold">{data.statistics.averageHours}</p>
                            </div>
                            <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-orange-200" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
                    <CardContent className="p-3 sm:p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-indigo-100 text-xs sm:text-sm">This Week</p>
                                <p className="text-lg sm:text-2xl font-bold">{currentWeekAssignments.length}</p>
                            </div>
                            <Presentation className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-200" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="reports" className="space-y-4 sm:space-y-6">
                <TabsList className="grid w-full grid-cols-6 h-auto p-1">
                    <TabsTrigger value="reports" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm">
                        <FileText className="h-4 w-4" />
                        <span className="hidden sm:inline">Reports</span>
                        <span className="sm:hidden">Reports</span>
                    </TabsTrigger>
                    <TabsTrigger value="assignments" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm">
                        <Presentation className="h-4 w-4" />
                        <span className="hidden sm:inline">Assignments</span>
                        <span className="sm:hidden">Tasks</span>
                    </TabsTrigger>
                    <TabsTrigger value="profile" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm">
                        <User className="h-4 w-4" />
                        <span>Profile</span>
                    </TabsTrigger>
                    <TabsTrigger value="transport" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm">
                        <Car className="h-4 w-4" />
                        <span className="hidden sm:inline">Transport</span>
                        <span className="sm:hidden">Car</span>
                    </TabsTrigger>
                    <TabsTrigger value="activity" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm">
                        <Activity className="h-4 w-4" />
                        <span>Activity</span>
                    </TabsTrigger>
                    <TabsTrigger value="overseer" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm">
                        <Users className="h-4 w-4" />
                        <span className="hidden sm:inline">Overseer</span>
                        <span className="sm:hidden">FSO</span>
                    </TabsTrigger>
                </TabsList>

                {/* Reports Tab */}
                <TabsContent value="reports" className="space-y-4 sm:space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
                        <h2 className="text-xl sm:text-2xl font-bold">Field Service Reports</h2>
                        <Button onClick={() => setShowReportModal(true)} className="gap-2 w-full sm:w-auto">
                            <Plus className="h-4 w-4" />
                            <span className="sm:inline">Submit Report</span>
                        </Button>
                    </div>

                    {/* Missing Reports Reminders */}
                    {missingReports.length > 0 && (
                        <Card className="border-orange-200 bg-orange-50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-orange-800">
                                    <AlertCircle className="h-5 w-5" />
                                    Missing Reports
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-orange-700 mb-4">
                                    You have {missingReports.length} missing report{missingReports.length > 1 ? 's' : ''} that need to be submitted:
                                </p>
                                <div className="grid gap-3">
                                    {missingReports.map((month) => (
                                        <div key={month.value} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-white rounded-lg border border-orange-200 gap-3 sm:gap-0">
                                            <div className="flex items-center gap-3 flex-1">
                                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                                                    <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-orange-800 text-sm sm:text-base">{month.label}</h4>
                                                    <p className="text-xs sm:text-sm text-orange-600">Report not submitted</p>
                                                </div>
                                            </div>
                                            <Button 
                                                onClick={() => {
                                                    setSelectedReportMonth(month.value)
                                                    setShowReportModal(true)
                                                }}
                                                size="sm"
                                                className="bg-orange-600 hover:bg-orange-700 w-full sm:w-auto"
                                            >
                                                Submit Now
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Report History */}
                    <Card>
                        <CardHeader>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                                    <TrendingUp className="h-5 w-5" />
                                    Report History & Progress
                                </CardTitle>
                                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                                    <SelectTrigger className="w-full sm:w-48">
                                        <SelectValue placeholder="Filter by month" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Reports</SelectItem>
                                        {monthOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4">
                                {data.reports.length > 0 ? (
                                    (selectedMonth === 'all' ? data.reports : 
                                     data.reports.filter(report => format(new Date(report.month), 'yyyy-MM') === selectedMonth)
                                    ).map((report) => (
                                        <Card key={report._id} className="hover:shadow-md transition-shadow">
                                            <CardContent className="p-4 sm:p-6">
                                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
                                                    <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                                                        <div className="text-center flex-shrink-0">
                                                            <div className="text-lg sm:text-2xl font-bold text-blue-600">
                                                                {report.hours || 0}
                                                            </div>
                                                            <div className="text-xs sm:text-sm text-muted-foreground">Hours</div>
                                                        </div>
                                                        <div className="text-center flex-shrink-0">
                                                            <div className="text-lg sm:text-2xl font-bold text-purple-600">
                                                                {report.bibleStudents}
                                                            </div>
                                                            <div className="text-xs sm:text-sm text-muted-foreground">Studies</div>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="font-semibold text-sm sm:text-base truncate">{getMonthName(report.month)}</h3>
                                                            <p className="text-xs sm:text-sm text-muted-foreground">
                                                                Submitted {format(new Date(report.createdAt), 'MMM dd, yyyy')}
                                                            </p>
                                                            {report.comments && (
                                                                <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">
                                                                    "{report.comments}"
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                                                        {report.auxiliaryPioneer && (
                                                            <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                                                                Auxiliary Pioneer
                                                            </Badge>
                                                        )}
                                                        <Badge variant={report.check ? "default" : "secondary"} className="text-xs">
                                                            {report.check ? "Approved" : "Pending"}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                                ) : (
                                    <Card>
                                        <CardContent className="text-center py-12">
                                            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                            <h3 className="text-lg font-semibold mb-2">No Reports Yet</h3>
                                            <p className="text-muted-foreground mb-4">
                                                Start by submitting your first field service report
                                            </p>
                                            <Button onClick={() => setShowReportModal(true)}>
                                                Submit Your First Report
                                            </Button>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Assignments Tab */}
                <TabsContent value="assignments" className="space-y-4 sm:space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
                        <h2 className="text-xl sm:text-2xl font-bold">This Week's Assignments</h2>
                        <Badge className="bg-blue-100 text-blue-800 text-xs sm:text-sm">
                            {format(currentWeekStart, 'MMM d')} - {format(currentWeekEnd, 'MMM d, yyyy')}
                        </Badge>
                    </div>

                    <div className="grid gap-4">
                        {currentWeekAssignments.length > 0 ? (
                            currentWeekAssignments.map((assignment) => (
                                <Card key={assignment._id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-4 sm:p-6">
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
                                            <div className="flex items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
                                                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                                                    assignment.meetingType === 'Midweek' ? 'bg-green-100' : 'bg-purple-100'
                                                }`}>
                                                    {assignment.assignmentType === 'Watchtower Reader' ? 
                                                        <BookOpen className={`h-5 w-5 sm:h-6 sm:w-6 ${
                                                            assignment.meetingType === 'Midweek' ? 'text-green-600' : 'text-purple-600'
                                                        }`} /> :
                                                        <Mic className={`h-5 w-5 sm:h-6 sm:w-6 ${
                                                            assignment.meetingType === 'Midweek' ? 'text-green-600' : 'text-purple-600'
                                                        }`} />
                                                    }
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-base sm:text-lg">{assignment.title}</h3>
                                                    <p className="text-muted-foreground text-sm sm:text-base">
                                                        {assignment.assignmentType} • Week of {format(new Date(assignment.week), 'MMM dd, yyyy')}
                                                    </p>
                                                    {assignment.description && (
                                                        <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">
                                                            {assignment.description}
                                                        </p>
                                                    )}
                                                    {assignment.source && (
                                                        <p className="text-xs sm:text-sm text-blue-600 mt-1">
                                                            Source: {assignment.source}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-left sm:text-right w-full sm:w-auto">
                                                <Badge variant={assignment.meetingType === 'Midweek' ? 'default' : 'secondary'} className="text-xs">
                                                    {assignment.meetingType}
                                                </Badge>
                                                {assignment.duration && (
                                                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                                                        Duration: {assignment.duration} minutes
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <Card>
                                <CardContent className="text-center py-12">
                                    <Presentation className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No Assignments This Week</h3>
                                    <p className="text-muted-foreground">
                                        You don't have any assignments for the current week
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </TabsContent>



                {/* Profile Tab */}
                <TabsContent value="profile" className="space-y-4 sm:space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                                <User className="h-5 w-5" />
                                Personal Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                <div>
                                    <label className="text-xs sm:text-sm font-medium text-muted-foreground">Full Name</label>
                                    <p className="text-sm sm:text-lg font-semibold">{user.fullName}</p>
                                </div>
                                <div>
                                    <label className="text-xs sm:text-sm font-medium text-muted-foreground">Role</label>
                                    <p className="text-sm sm:text-lg font-semibold capitalize">{user.role.replace('_', ' ')}</p>
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="text-xs sm:text-sm font-medium text-muted-foreground">Email</label>
                                    <p className="text-sm sm:text-lg break-all">{user.email}</p>
                                </div>
                                <div>
                                    <label className="text-xs sm:text-sm font-medium text-muted-foreground">Phone</label>
                                    <p className="text-sm sm:text-lg">{user.phone}</p>
                                </div>
                                <div>
                                    <label className="text-xs sm:text-sm font-medium text-muted-foreground">Group</label>
                                    <p className="text-sm sm:text-lg">{user.groupId?.name || 'Not assigned'}</p>
                                </div>
                                {user.address && (
                                    <div className="sm:col-span-2">
                                        <label className="text-xs sm:text-sm font-medium text-muted-foreground">Address</label>
                                        <p className="text-sm sm:text-lg">{user.address}</p>
                                    </div>
                                )}
                            </div>
                            
                            {user.privileges && user.privileges.length > 0 && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Privileges</label>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {user.privileges.map((privilege, index) => (
                                            <Badge key={index} variant="outline">
                                                {privilege.name}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Transport Tab */}
                <TabsContent value="transport" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Car className="h-5 w-5" />
                                Transport Management
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {data.transport.participating ? (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                                        <div>
                                            <h3 className="font-semibold text-green-800">Transport Status</h3>
                                            <p className="text-green-700">You are participating in transport arrangements</p>
                                        </div>
                                        <Badge className="bg-green-600">Active</Badge>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        {data.transport.active.map((payment, index) => (
                                            <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                                                <div>
                                                    <h4 className="font-medium">{payment.feeId.name}</h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        Amount: ₵{payment.feeId.amount}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold">₵{payment.amountPaid}</p>
                                                    <Badge variant={payment.isPaid ? "default" : "secondary"}>
                                                        {payment.isPaid ? "Paid" : `Balance: ₵${payment.balance}`}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="p-4 bg-blue-50 rounded-lg">
                                        <h4 className="font-semibold text-blue-800">Total Paid</h4>
                                        <p className="text-2xl font-bold text-blue-600">₵{data.transport.totalPaid}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No Transport Participation</h3>
                                    <p className="text-muted-foreground">
                                        You are not currently participating in any transport arrangements
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Overseer Visit Schedule Tab */}
                <TabsContent value="overseer" className="space-y-4 sm:space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
                        <h2 className="text-xl sm:text-2xl font-bold">Group Visit Schedule</h2>
                    </div>

                    {/* Next Visit Card */}
                    <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
                                <div>
                                    <h3 className="text-lg sm:text-xl font-bold mb-2">Next Group Visit</h3>
                                    <p className="text-blue-100 text-sm sm:text-base">
                                        Your group is scheduled to be visited by the Field Service Overseer
                                    </p>
                                </div>
                                <div className="text-center sm:text-right">
                                    <div className="text-2xl sm:text-3xl font-bold">Feb 15</div>
                                    <div className="text-blue-100 text-sm sm:text-base">2024</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Visit History */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                                <Calendar className="h-5 w-5" />
                                Visit History
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <Card className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-4 sm:p-6">
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
                                            <div className="flex items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
                                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-base sm:text-lg">January 2024 Visit</h3>
                                                    <p className="text-muted-foreground text-sm sm:text-base">
                                                        Visited on January 15, 2024
                                                    </p>
                                                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                                                        Good participation in field service. Continue the excellent work!
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-left sm:text-right w-full sm:w-auto">
                                                <Badge className="bg-green-600 text-white">Completed</Badge>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-dashed">
                                    <CardContent className="text-center py-8">
                                        <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold mb-2">Upcoming Visit</h3>
                                        <p className="text-muted-foreground mb-4">
                                            Your next group visit is scheduled for February 15, 2024
                                        </p>
                                        <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>
                                    </CardContent>
                                </Card>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Activity Tab */}
                <TabsContent value="activity" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5" />
                                Recent Activity
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {data.activities.length > 0 ? (
                                <div className="space-y-3">
                                    {data.activities.map((activity) => (
                                        <div key={activity._id} className="flex items-start gap-3 p-3 border rounded-lg">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                                activity.success ? 'bg-green-100' : 'bg-red-100'
                                            }`}>
                                                <Activity className={`h-4 w-4 ${
                                                    activity.success ? 'text-green-600' : 'text-red-600'
                                                }`} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium">{activity.action}</p>
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
                                <div className="text-center py-8">
                                    <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No Recent Activity</h3>
                                    <p className="text-muted-foreground">
                                        Your recent activities will appear here
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Quick Actions */}
            <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
                        <div>
                            <h3 className="text-lg sm:text-xl font-bold mb-2">Quick Actions</h3>
                            <p className="text-blue-100 text-sm sm:text-base">
                                Manage your congregation activities efficiently
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                            <Button 
                                onClick={() => setShowReportModal(true)}
                                className="bg-white/20 hover:bg-white/30 text-white border-white/30 w-full sm:w-auto"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Submit Report
                            </Button>
                            {currentWeekAssignments.length > 0 && (
                                <Button 
                                    variant="outline" 
                                    className="bg-white/10 hover:bg-white/20 text-white border-white/30 w-full sm:w-auto"
                                >
                                    <Calendar className="h-4 w-4 mr-2" />
                                    View Assignments
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <FieldServiceReportModal
                open={showReportModal}
                onClose={() => {
                    setShowReportModal(false)
                    setSelectedReportMonth('')
                }}
                currentMonth={selectedReportMonth || data.thisMonth.month}
                existingReport={data.thisMonth.report}
            />
        </div>
    )
}