"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, TrendingUp, Users, BookOpen, AlertTriangle, Eye, RefreshCw } from 'lucide-react'
import { format, addMonths } from 'date-fns'
import { getOverseerAnalytics, getOverallMemberAnalytics } from '@/lib/actions/overseer.actions'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface MemberData {
    id: string
    name: string
    present: boolean
    hasStudy: boolean
    participatesInMinistry: boolean
}

interface AnalyticsData {
    _id: string
    groupName: string
    month: string
    visitDate: string
    presentCount: number
    totalMembers: number
    studyCount: number
    ministryActive: number
    followUpNeeded: boolean
    meetingAttendance: string
    generalObservations: string
    encouragement: string
    recommendations: string
    members: MemberData[]
}

interface OverallAnalytics {
    totalMembers: number
    presentMembers: any[]
    absentMembers: any[]
    membersWithStudy: any[]
    membersWithoutStudy: any[]
    membersInMinistry: any[]
    membersNotInMinistry: any[]
}

const OverseerAnalyticsGrid = () => {
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([])
    const [overallData, setOverallData] = useState<OverallAnalytics | null>(null)
    const [loading, setLoading] = useState(true)
    const [selectedReport, setSelectedReport] = useState<AnalyticsData | null>(null)
    const [selectedMonth, setSelectedMonth] = useState(new Date())
    const [showOverall, setShowOverall] = useState(false)

    const fetchAnalytics = useCallback(async (monthDate: Date) => {
        setLoading(true)
        try {
            const monthStr = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`
            const [monthlyData, overallAnalytics] = await Promise.all([
                getOverseerAnalytics(monthStr),
                getOverallMemberAnalytics(monthStr)
            ])
            setAnalyticsData(monthlyData)
            setOverallData(overallAnalytics)
        } catch (error) {
            console.error('Error fetching analytics:', error)
        } finally {
            setLoading(false)
        }
    }, [])



    useEffect(() => {
        fetchAnalytics(selectedMonth)
    }, [selectedMonth, fetchAnalytics])

    const handleMonthChange = (date: Date) => {
        setSelectedMonth(date)
    }

    const handleRefresh = () => {
        fetchAnalytics(selectedMonth)
    }

    const getAttendanceColor = (attendance: string) => {
        switch (attendance) {
            case 'excellent': return 'bg-green-100 text-green-800'
            case 'good': return 'bg-blue-100 text-blue-800'
            case 'fair': return 'bg-yellow-100 text-yellow-800'
            case 'poor': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    console.log('Analytics Data:', analyticsData)

    const totalReports = analyticsData.length
    const avgAttendance = analyticsData.length > 0 ? 
        analyticsData.reduce((sum, report) => sum + report.presentCount, 0) / analyticsData.length : 0
    const totalStudies = analyticsData.reduce((sum, report) => sum + report.studyCount, 0)
    const followUpNeeded = analyticsData.filter(report => report.followUpNeeded).length
    
    // Additional overall statistics for selected month
    const uniqueGroups = new Set(analyticsData.map(r => r.groupName)).size
    const totalMembers = analyticsData.reduce((sum, report) => sum + report.totalMembers, 0)
    const ministryActive = analyticsData.reduce((sum, report) => sum + report.ministryActive, 0)
    const excellentAttendance = analyticsData.filter(r => r.meetingAttendance === 'excellent').length

    if (loading) {
        return (
            <div className="space-y-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-32 bg-gray-100 rounded animate-pulse" />
                ))}
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Overseer Analytics Dashboard
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                        <div className="flex gap-4 items-center">
                            <div className="flex gap-2">
                                <Button 
                                    variant={!showOverall ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setShowOverall(false)}
                                >
                                    Monthly View
                                </Button>
                                <Button 
                                    variant={showOverall ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setShowOverall(true)}
                                >
                                    Overall Report
                                </Button>
                            </div>
                            
                            <Select 
                                value={format(selectedMonth, 'yyyy-MM')} 
                                onValueChange={(value) => {
                                    const [year, month] = value.split('-')
                                    const newDate = new Date(parseInt(year), parseInt(month) - 1, 1)
                                    handleMonthChange(newDate)
                                }}
                            >
                                <SelectTrigger className="w-48">
                                    <SelectValue placeholder="Select month" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.from({ length: 12 }, (_, i) => {
                                        const date = addMonths(new Date(), i - 6)
                                        const value = format(date, 'yyyy-MM')
                                        const label = format(date, 'MMMM yyyy')
                                        return (
                                            <SelectItem key={value} value={value}>
                                                {label}
                                            </SelectItem>
                                        )
                                    })}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleRefresh}
                            disabled={loading}
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <Card>
                    <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">{totalReports}</div>
                        <div className="text-sm text-muted-foreground">Total Reports</div>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">{Math.round(avgAttendance)}</div>
                        <div className="text-sm text-muted-foreground">Avg Attendance</div>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-purple-600">{totalStudies}</div>
                        <div className="text-sm text-muted-foreground">Bible Studies</div>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-orange-600">{followUpNeeded}</div>
                        <div className="text-sm text-muted-foreground">Follow-ups Needed</div>
                    </CardContent>
                </Card>
                
                {showOverall && (
                    <>
                        <Card>
                            <CardContent className="p-4 text-center">
                                <div className="text-2xl font-bold text-indigo-600">{uniqueGroups}</div>
                                <div className="text-sm text-muted-foreground">Groups Visited</div>
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardContent className="p-4 text-center">
                                <div className="text-2xl font-bold text-teal-600">{ministryActive}</div>
                                <div className="text-sm text-muted-foreground">Ministry Active</div>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>

            {/* Reports List */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        {showOverall ? `Overall Report - ${selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}` : `Reports for ${selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {showOverall && overallData && (
                        <div className="mb-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Card className="p-4 bg-green-50">
                                    <div className="text-center">
                                        <div className="text-xl font-bold text-green-600">{overallData.presentMembers.length}</div>
                                        <div className="text-sm text-green-700">Members Present</div>
                                        <div className="text-xs text-muted-foreground">
                                            {overallData.totalMembers > 0 ? Math.round((overallData.presentMembers.length / overallData.totalMembers) * 100) : 0}% of all members
                                        </div>
                                    </div>
                                </Card>
                                
                                <Card className="p-4 bg-blue-50">
                                    <div className="text-center">
                                        <div className="text-xl font-bold text-blue-600">{overallData.membersWithStudy.length}</div>
                                        <div className="text-sm text-blue-700">Have Bible Studies</div>
                                        <div className="text-xs text-muted-foreground">
                                            {overallData.totalMembers > 0 ? Math.round((overallData.membersWithStudy.length / overallData.totalMembers) * 100) : 0}% of all members
                                        </div>
                                    </div>
                                </Card>
                                
                                <Card className="p-4 bg-purple-50">
                                    <div className="text-center">
                                        <div className="text-xl font-bold text-purple-600">{overallData.membersInMinistry.length}</div>
                                        <div className="text-sm text-purple-700">In Ministry</div>
                                        <div className="text-xs text-muted-foreground">
                                            {overallData.totalMembers > 0 ? Math.round((overallData.membersInMinistry.length / overallData.totalMembers) * 100) : 0}% of all members
                                        </div>
                                    </div>
                                </Card>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card className="p-4">
                                    <h4 className="font-medium mb-3 text-red-600">Members Needing Help</h4>
                                    <div className="space-y-3">
                                        <div>
                                            <h5 className="text-sm font-medium mb-2">Never Present ({overallData.absentMembers.length})</h5>
                                            <div className="text-xs space-y-1 max-h-32 overflow-y-auto">
                                                {overallData.absentMembers.map(member => (
                                                    <div key={member.id} className="flex items-center gap-2">
                                                        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                                        <span>{member.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <h5 className="text-sm font-medium mb-2">No Bible Studies ({overallData.membersWithoutStudy.length})</h5>
                                            <div className="text-xs space-y-1 max-h-32 overflow-y-auto">
                                                {overallData.membersWithoutStudy.map(member => (
                                                    <div key={member.id} className="flex items-center gap-2">
                                                        <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                                                        <span>{member.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <h5 className="text-sm font-medium mb-2">Not in Ministry ({overallData.membersNotInMinistry.length})</h5>
                                            <div className="text-xs space-y-1 max-h-32 overflow-y-auto">
                                                {overallData.membersNotInMinistry.map(member => (
                                                    <div key={member.id} className="flex items-center gap-2">
                                                        <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                                                        <span>{member.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                                
                                <Card className="p-4">
                                    <h4 className="font-medium mb-3 text-green-600">Active Members</h4>
                                    <div className="space-y-3">
                                        <div>
                                            <h5 className="text-sm font-medium mb-2">Present in Visits ({overallData.presentMembers.length})</h5>
                                            <div className="text-xs space-y-1 max-h-32 overflow-y-auto">
                                                {overallData.presentMembers.map(member => (
                                                    <div key={member.id} className="flex items-center gap-2">
                                                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                                        <span>{member.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <h5 className="text-sm font-medium mb-2">Have Bible Studies ({overallData.membersWithStudy.length})</h5>
                                            <div className="text-xs space-y-1 max-h-32 overflow-y-auto">
                                                {overallData.membersWithStudy.map(member => (
                                                    <div key={member.id} className="flex items-center gap-2">
                                                        <BookOpen className="w-3 h-3 text-blue-500" />
                                                        <span>{member.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <h5 className="text-sm font-medium mb-2">Active in Ministry ({overallData.membersInMinistry.length})</h5>
                                            <div className="text-xs space-y-1 max-h-32 overflow-y-auto">
                                                {overallData.membersInMinistry.map(member => (
                                                    <div key={member.id} className="flex items-center gap-2">
                                                        <Users className="w-3 h-3 text-purple-500" />
                                                        <span>{member.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    )}
                    
                    {!showOverall && (
                        <div className="space-y-4">
                            {analyticsData.map((report) => (
                                <Card key={report._id} className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div>
                                                <h3 className="font-medium">{report.name}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {format(new Date(report.month), 'MMMM yyyy')} - {format(new Date(report.visitDate), 'MMM dd')}
                                                </p>
                                            </div>
                                            
                                            <div className="flex gap-2">
                                                <Badge className={getAttendanceColor(report.meetingAttendance)}>
                                                    {report.meetingAttendance}
                                                </Badge>
                                                
                                                <div className="flex items-center gap-1 text-sm">
                                                    <Users className="h-3 w-3" />
                                                    {report.presentCount}/{report.totalMembers}
                                                </div>
                                                
                                                <div className="flex items-center gap-1 text-sm">
                                                    {report.studyCount}
                                                </div>
                                                
                                                {report.followUpNeeded && (
                                                    <Badge variant="outline" className="gap-1">
                                                        <AlertTriangle className="h-3 w-3" />
                                                        Follow-up
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => setSelectedReport(report)}
                                        >
                                            <Eye className="h-3 w-3 mr-1" />
                                            View Details
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Report Detail Modal */}
            {selectedReport && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>{selectedReport.groupName} - {format(new Date(selectedReport.month), 'MMM yyyy')}</span>
                                <Button variant="ghost" size="sm" onClick={() => setSelectedReport(null)}>
                                    ×
                                </Button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="font-medium mb-2">Visit Information</h4>
                                <p><strong>Date:</strong> {format(new Date(selectedReport.visitDate), 'MMM dd, yyyy')}</p>
                                <p><strong>Attendance:</strong> {selectedReport.presentCount}/{selectedReport.totalMembers}</p>
                                <p><strong>Meeting Attendance:</strong> {selectedReport.meetingAttendance}</p>
                                <p><strong>Bible Studies:</strong> {selectedReport.studyCount}</p>
                                <p><strong>Ministry Active:</strong> {selectedReport.ministryActive}</p>
                            </div>
                            
                            {/* Member Details */}
                            <div>
                                <h4 className="font-medium mb-2">Member Details</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <h5 className="text-sm font-medium text-green-600 mb-1">Present ({selectedReport.members.filter(m => m.present).length})</h5>
                                        <div className="text-xs space-y-1">
                                            {selectedReport.members.filter(m => m.present).map(member => (
                                                <div key={member.id} className="flex items-center gap-2">
                                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                                    <span>{member.name}</span>
                                                    {member.hasStudy && <Badge variant="outline" className="text-xs">Study</Badge>}
                                                    {member.participatesInMinistry && <Badge variant="outline" className="text-xs">Ministry</Badge>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <h5 className="text-sm font-medium text-red-600 mb-1">Absent ({selectedReport.members.filter(m => !m.present).length})</h5>
                                        <div className="text-xs space-y-1">
                                            {selectedReport.members.filter(m => !m.present).map(member => (
                                                <div key={member.id} className="flex items-center gap-2">
                                                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                                    <span>{member.name}</span>
                                                    {member.hasStudy && <Badge variant="outline" className="text-xs">Study</Badge>}
                                                    {member.participatesInMinistry && <Badge variant="outline" className="text-xs">Ministry</Badge>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                    <div>
                                        <h5 className="text-sm font-medium text-blue-600 mb-1">Bible Studies ({selectedReport.studyCount})</h5>
                                        <div className="text-xs space-y-1">
                                            {selectedReport.members.filter(m => m.hasStudy).map(member => (
                                                <div key={member.id} className="flex items-center gap-2">
                                                    <BookOpen className="w-3 h-3 text-blue-500" />
                                                    <span>{member.name}</span>
                                                    <Badge variant={member.present ? "default" : "secondary"} className="text-xs">
                                                        {member.present ? "Present" : "Absent"}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <h5 className="text-sm font-medium text-purple-600 mb-1">Ministry Active ({selectedReport.ministryActive})</h5>
                                        <div className="text-xs space-y-1">
                                            {selectedReport.members.filter(m => m.participatesInMinistry).map(member => (
                                                <div key={member.id} className="flex items-center gap-2">
                                                    <Users className="w-3 h-3 text-purple-500" />
                                                    <span>{member.name}</span>
                                                    <Badge variant={member.present ? "default" : "secondary"} className="text-xs">
                                                        {member.present ? "Present" : "Absent"}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <h4 className="font-medium mb-2">General Observations</h4>
                                <p className="text-sm">{selectedReport.generalObservations}</p>
                            </div>
                            
                            <div>
                                <h4 className="font-medium mb-2">Encouragement Given</h4>
                                <p className="text-sm">{selectedReport.encouragement}</p>
                            </div>
                            
                            <div>
                                <h4 className="font-medium mb-2">Recommendations</h4>
                                <p className="text-sm">{selectedReport.recommendations}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}

export default OverseerAnalyticsGrid