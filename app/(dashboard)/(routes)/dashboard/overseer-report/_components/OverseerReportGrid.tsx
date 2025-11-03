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
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center space-x-4">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )

    return (
        <div className="space-y-6">
            {/* Filter Controls */}
            <Card className="bg-card border-border">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-card-foreground">
                        <Calendar className="w-5 h-5 text-primary" />
                        Field Service Overseer Reports
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                        <div className="flex gap-4 items-center">
                            <MonthSelection selectedMonth={handleMonthChange} />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                onClick={() => setShowScheduleModal(true)}
                                variant="outline"
                                className="gap-2"
                            >
                                <Calendar className="w-4 h-4" />
                                Schedule
                            </Button>
                            <Button
                                onClick={() => setShowReportModal(true)}
                                className="gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                New Report
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handleRefresh}
                                disabled={loading}
                                className="shrink-0"
                            >
                                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
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
                    <CardHeader>
                        <CardTitle>
                            Overseer Reports - {selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            columns={createOverseerColumns()}
                            data={reportsData}
                            searchKey="groupName"
                        />
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