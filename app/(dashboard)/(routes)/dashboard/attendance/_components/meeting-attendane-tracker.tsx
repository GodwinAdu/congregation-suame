"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { CalendarDays, Users, TrendingUp, FileText, Download, Printer } from "lucide-react"
import { MeetingAttendanceExportView } from "./meeting-attendance-export-view"
import { updateMonthlyAttendance, fetchAttendanceByServiceYear } from "@/lib/actions/attendance.actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface MonthlyRecord {
    month: string
    numberOfMeetings: number
    totalAttendance: number
    averageAttendance: number
}

interface MeetingAttendanceTrackerProps {
    initialData: MonthlyRecord[]
    currentYear: number
}

export function MeetingAttendanceTracker({ initialData, currentYear }: MeetingAttendanceTrackerProps) {
    const [records, setRecords] = useState<MonthlyRecord[]>(initialData)
    const [showExport, setShowExport] = useState(false)
    const [editingIndex, setEditingIndex] = useState<number | null>(null)
    const [selectedYear, setSelectedYear] = useState(currentYear)
    const router = useRouter()

    const availableYears = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)

    const handleYearChange = (year: string) => {
        const newYear = parseInt(year)
        setSelectedYear(newYear)
        router.push(`/dashboard/attendance/attendance-tracker?year=${newYear}`)
    }

    useEffect(() => {
        const fetchYearData = async () => {
            if (selectedYear !== currentYear) {
                try {
                    const data = await fetchAttendanceByServiceYear(selectedYear)
                    setRecords(data)
                } catch (error) {
                    toast.error("Failed to fetch attendance data")
                }
            }
        }
        fetchYearData()
    }, [selectedYear, currentYear])

    const updateRecord = async (index: number, field: keyof MonthlyRecord, value: string) => {
        const newRecords = [...records]
        const numValue = Number.parseInt(value) || 0
        newRecords[index] = { ...newRecords[index], [field]: numValue }

        // Auto-calculate average when meetings or total attendance changes
        if (field === "numberOfMeetings" || field === "totalAttendance") {
            const meetings = field === "numberOfMeetings" ? numValue : newRecords[index].numberOfMeetings
            const total = field === "totalAttendance" ? numValue : newRecords[index].totalAttendance
            newRecords[index].averageAttendance = meetings > 0 ? Math.round(total / meetings) : 0
        }

        setRecords(newRecords)
        
        // Update in database
        try {
            await updateMonthlyAttendance(newRecords[index].month, selectedYear, {
                [field]: numValue
            })
            
            toast.success("Attendance updated successfully")
        } catch (error: any) {
            toast.error(error.message || "Failed to update attendance")
        }
    }

    const totalMeetings = records.reduce((sum, record) => sum + record.numberOfMeetings, 0)
    const totalAttendance = records.reduce((sum, record) => sum + record.totalAttendance, 0)
    const overallAverage = totalMeetings > 0 ? Math.round(totalAttendance / totalMeetings) : 0
    const monthlyAverage = Math.round(records.reduce((sum, record) => sum + record.averageAttendance, 0) / records.length)

    if (showExport) {
        return <MeetingAttendanceExportView records={records} onClose={() => setShowExport(false)} />
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold text-gray-900">Meeting Attendance Dashboard</h1>
                    <p className="text-lg text-gray-600">Track and manage congregation meeting attendance</p>
                    
                    {/* Year Selector */}
                    <div className="flex items-center justify-center gap-2">
                        <Label htmlFor="year-select" className="text-sm font-medium">Service Year:</Label>
                        <Select value={selectedYear.toString()} onValueChange={handleYearChange}>
                            <SelectTrigger className="w-32">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {availableYears.map((year) => (
                                    <SelectItem key={year} value={year.toString()}>
                                        {year}-{year + 1}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-white/80 backdrop-blur-sm border-blue-200">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Total Meetings</CardTitle>
                            <CalendarDays className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">{totalMeetings}</div>
                            <p className="text-xs text-gray-500">This service year</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/80 backdrop-blur-sm border-blue-200">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Total Attendance</CardTitle>
                            <Users className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">{totalAttendance}</div>
                            <p className="text-xs text-gray-500">Cumulative count</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/80 backdrop-blur-sm border-blue-200">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Overall Average</CardTitle>
                            <TrendingUp className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">{overallAverage}</div>
                            <p className="text-xs text-gray-500">Per meeting</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/80 backdrop-blur-sm border-blue-200">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Monthly Average</CardTitle>
                            <TrendingUp className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">{monthlyAverage}</div>
                            <p className="text-xs text-gray-500">Per month</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Attendance Table */}
                <Card className="bg-white/90 backdrop-blur-sm border-blue-200">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-xl text-gray-900">Midweek Meeting Attendance Record</CardTitle>
                            <CardDescription>Click on any cell to edit attendance data</CardDescription>
                        </div>
                        <Button onClick={() => setShowExport(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                            <FileText className="w-4 h-4 mr-2" />
                            Export Report
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="border-b-2 border-blue-200">
                                        <th className="text-left p-3 font-semibold text-gray-700">Service Year</th>
                                        <th className="text-center p-3 font-semibold text-gray-700">Number of Meetings</th>
                                        <th className="text-center p-3 font-semibold text-gray-700">Total Attendance</th>
                                        <th className="text-center p-3 font-semibold text-gray-700">Average Attendance Each Week</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {records.map((record, index) => (
                                        <tr key={record.month} className="border-b border-gray-200 hover:bg-blue-50/50 transition-colors">
                                            <td className="p-3 font-medium text-gray-900">{record.month}</td>
                                            <td className="p-3 text-center">
                                                {editingIndex === index ? (
                                                    <Input
                                                        type="number"
                                                        value={record.numberOfMeetings}
                                                        onChange={(e) => updateRecord(index, "numberOfMeetings", e.target.value)}
                                                        onBlur={() => setEditingIndex(null)}
                                                        className="w-20 text-center"
                                                        autoFocus
                                                    />
                                                ) : (
                                                    <span
                                                        className="cursor-pointer hover:bg-blue-100 px-2 py-1 rounded"
                                                        onClick={() => setEditingIndex(index)}
                                                    >
                                                        {record.numberOfMeetings}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-3 text-center">
                                                {editingIndex === index ? (
                                                    <Input
                                                        type="number"
                                                        value={record.totalAttendance}
                                                        onChange={(e) => updateRecord(index, "totalAttendance", e.target.value)}
                                                        onBlur={() => setEditingIndex(null)}
                                                        className="w-20 text-center"
                                                    />
                                                ) : (
                                                    <span
                                                        className="cursor-pointer hover:bg-blue-100 px-2 py-1 rounded"
                                                        onClick={() => setEditingIndex(index)}
                                                    >
                                                        {record.totalAttendance}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-3 text-center">
                                                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                                    {record.averageAttendance}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                    <tr className="border-t-2 border-blue-300 bg-blue-50/50 font-semibold">
                                        <td className="p-3 text-gray-900">Average Attendance Each Month</td>
                                        <td className="p-3 text-center text-gray-900">{Math.round(totalMeetings / 12)}</td>
                                        <td className="p-3 text-center text-gray-900">{Math.round(totalAttendance / 12)}</td>
                                        <td className="p-3 text-center">
                                            <Badge className="bg-blue-600 text-white">{monthlyAverage}</Badge>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <div className="flex justify-center space-x-4">
                    <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50 bg-transparent">
                        <Download className="w-4 h-4 mr-2" />
                        Download Data
                    </Button>
                    <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50 bg-transparent">
                        <Printer className="w-4 h-4 mr-2" />
                        Print Summary
                    </Button>
                </div>
            </div>
        </div>
    )
}
