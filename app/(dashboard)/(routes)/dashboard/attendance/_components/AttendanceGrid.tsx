"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar, RefreshCw, AlertCircle } from 'lucide-react'
import { AttendanceStats } from './attendance-stat'
import { AttendanceTracker } from './attendance-tracker'
import { fetchAttendanceByMonth, fetchAllAttendance } from '@/lib/actions/attendance.actions'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import MonthSelection from '@/components/commons/MonthSelection'



const AttendanceGrid = () => {
    const [attendanceData, setAttendanceData] = useState([])
    const [selectedMonth, setSelectedMonth] = useState(new Date())
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchData = useCallback(async (monthDate?: Date) => {
        setLoading(true)
        setError(null)
        
        try {
            let data
            if (monthDate) {
                const month = monthDate.getMonth() + 1
                const year = monthDate.getFullYear()
                data = await fetchAttendanceByMonth(month, year)
            } else {
                data = await fetchAllAttendance()
            }
            setAttendanceData(data)
        } catch (err) {
            setError('Failed to fetch attendance data. Please try again.')
            console.error('Error fetching attendance:', err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchData(selectedMonth)
    }, [selectedMonth, fetchData])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const handleMonthChange = (date: Date) => {
        setSelectedMonth(date)
    }

    const handleRefresh = () => {
        fetchData(selectedMonth)
    }

    const LoadingSkeleton = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="pb-2">
                            <Skeleton className="h-4 w-24" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-16 mb-2" />
                            <Skeleton className="h-3 w-32" />
                        </CardContent>
                    </Card>
                ))}
            </div>
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center space-x-4">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-4 w-24" />
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
                        Attendance Overview
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                        <div className="flex gap-4 items-center">
                            <Label className="font-bold text-sm hidden lg:block">Select Month</Label>
                            <MonthSelection
                                selectedMonth={handleMonthChange}
                                // disabled={loading}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => fetchData()}
                                disabled={loading}
                                className="whitespace-nowrap"
                            >
                                Show All
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

            {/* Loading State */}
            {loading ? (
                <LoadingSkeleton />
            ) : (
                <div className="space-y-6">
                    <AttendanceStats attendanceData={attendanceData} />
                    <AttendanceTracker 
                        initialAttendanceData={attendanceData}
                        selectedMonth={selectedMonth.toISOString().slice(0, 7)}
                    />
                </div>
            )}
        </div>
    )
}

export default AttendanceGrid