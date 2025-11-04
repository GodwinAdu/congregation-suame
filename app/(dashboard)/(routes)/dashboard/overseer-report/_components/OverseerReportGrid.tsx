"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, RefreshCw, AlertCircle, Plus } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import MonthSelection from '@/components/commons/MonthSelection'
import { DataTable } from '@/components/table/data-table'
import { createOverseerColumns, OverseerReportData } from './columns'
import { OverseerReportModal } from './OverseerReportModal'
import { OverseerScheduleModal } from './OverseerScheduleModal'
import { getAllGroups } from '@/lib/actions/overseer.actions'
import { getOverseerReportsForGrid } from '@/lib/actions/overseer.actions'

const OverseerReportGrid = () => {
    const [reportsData, setReportsData] = useState<OverseerReportData[]>([])
    const [selectedMonth, setSelectedMonth] = useState(new Date())
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showReportModal, setShowReportModal] = useState(false)
    const [showScheduleModal, setShowScheduleModal] = useState(false)
    const [selectedGroupForReport, setSelectedGroupForReport] = useState<{groupId: string, month: string, scheduledDate?: string} | null>(null)

    const fetchData = useCallback(async (monthDate: Date) => {
        setLoading(true)
        setError(null)
        
        try {
            const monthStr = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`
            const data = await getOverseerReportsForGrid(monthStr as string)
            setReportsData(data)
        } catch (err) {
            setError('Failed to fetch overseer reports. Please try again.')
            console.error('Error fetching reports:', err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchData(selectedMonth)
    }, [selectedMonth, fetchData])
    
    // Listen for create report events
    useEffect(() => {
        const handleCreateReport = (event: any) => {
            const { groupId, month, scheduledDate } = event.detail
            setSelectedGroupForReport({ groupId, month, scheduledDate })
            setShowReportModal(true)
        }
        
        window.addEventListener('createReport', handleCreateReport)
        return () => window.removeEventListener('createReport', handleCreateReport)
    }, [])

    const handleMonthChange = (date: Date) => {
        setSelectedMonth(date)
    }

    const handleRefresh = () => {
        fetchData(selectedMonth)
    }

    const LoadingSkeleton = () => (
        <div className="space-y-3 sm:space-y-6">
            <Card>
                <CardHeader className="pb-2 sm:pb-6">
                    <Skeleton className="h-4 sm:h-6 w-32 sm:w-48" />
                    <Skeleton className="h-3 sm:h-4 w-48 sm:w-64" />
                </CardHeader>
                <CardContent className="pt-2 sm:pt-6">
                    <div className="space-y-2 sm:space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center space-x-2 sm:space-x-4">
                                <Skeleton className="h-3 sm:h-4 w-24 sm:w-32" />
                                <Skeleton className="h-3 sm:h-4 w-16 sm:w-24" />
                                <Skeleton className="h-3 sm:h-4 w-12 sm:w-16" />
                                <Skeleton className="h-3 sm:h-4 w-14 sm:w-20" />
                                <Skeleton className="h-3 sm:h-4 w-20 sm:w-32" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )

    return (
        <div className="space-y-3 sm:space-y-6">
            {/* Filter Controls */}
            <Card className="bg-card border-border">
                <CardHeader className="pb-2 sm:pb-6">
                    <CardTitle className="flex items-center gap-2 text-card-foreground text-base sm:text-lg">
                        <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                        <span className="truncate">Field Service Overseer Reports</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-2 sm:pt-6">
                    <div className="flex flex-col gap-3 sm:gap-4">
                        <div className="w-full">
                            <MonthSelection selectedMonth={handleMonthChange} />
                        </div>
                        <div className="grid grid-cols-2 sm:flex gap-2">
                            <Button
                                onClick={() => setShowScheduleModal(true)}
                                variant="outline"
                                className="gap-1 sm:gap-2 text-xs sm:text-sm"
                                size="sm"
                            >
                                <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="hidden xs:inline">Schedule</span>
                                <span className="xs:hidden">Sched</span>
                            </Button>
                            <Button
                                onClick={() => setShowReportModal(true)}
                                className="gap-1 sm:gap-2 text-xs sm:text-sm"
                                size="sm"
                            >
                                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="hidden xs:inline">New Report</span>
                                <span className="xs:hidden">New</span>
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleRefresh}
                                disabled={loading}
                                className="col-span-2 sm:col-span-1 sm:w-auto"
                            >
                                <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 ${loading ? 'animate-spin' : ''}`} />
                                <span className="ml-1 sm:ml-2 text-xs sm:text-sm">Refresh</span>
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Error State */}
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Data Table */}
            {loading ? (
                <LoadingSkeleton />
            ) : (
                <Card>
                    <CardHeader className="pb-2 sm:pb-6">
                        <CardTitle className="text-sm sm:text-base lg:text-lg">
                            <span className="hidden sm:inline">
                                Overseer Reports - {selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </span>
                            <span className="sm:hidden">
                                {selectedMonth.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} Reports
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2 sm:pt-6 px-2 sm:px-6">
                        <div className="overflow-x-auto">
                            <DataTable
                                columns={createOverseerColumns()}
                                data={reportsData}
                                searchKey="groupName"
                            />
                        </div>
                    </CardContent>
                </Card>
            )}

            <OverseerReportModal
                open={showReportModal}
                onClose={() => {
                    setShowReportModal(false)
                    setSelectedGroupForReport(null)
                    handleRefresh()
                }}
                selectedGroup={selectedGroupForReport?.groupId}
                selectedMonth={selectedGroupForReport?.month}
                scheduledDate={selectedGroupForReport?.scheduledDate}
            />
            
            <OverseerScheduleModal
                open={showScheduleModal}
                onClose={() => {
                    setShowScheduleModal(false)
                    handleRefresh()
                }}
            />
        </div>
    )
}

export default OverseerReportGrid