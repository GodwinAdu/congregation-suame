"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar, Users, Download, Search } from "lucide-react"
import { ExportView } from "./export-view"
import { AttendanceTable } from "./attendance-table"


interface AttendanceTrackerProps {
    initialAttendanceData: any[];
    selectedMonth?: string;
}

export function AttendanceTracker({ initialAttendanceData, selectedMonth = "" }: AttendanceTrackerProps) {
    const [congregationName, setCongregationName] = useState("Suame Twi")
    const [searchTerm, setSearchTerm] = useState("")
    const [showExportView, setShowExportView] = useState(false)

    const handleExport = () => {
        setShowExportView(true)
    }

    const handleCloseExport = () => {
        setShowExportView(false)
    }

    if (showExportView) {
        return <ExportView 
            congregationName={congregationName} 
            selectedMonth={selectedMonth} 
            attendanceData={initialAttendanceData}
            onClose={handleCloseExport} 
        />
    }

    return (
        <div className="container mx-auto p-6 space-y-8">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

                <div className="flex flex-col sm:flex-row gap-3">
                    <Button variant="outline" onClick={handleExport}>
                        <Download className="w-4 h-4 mr-2" />
                        Export Report
                    </Button>
                </div>
            </div>

            {/* Configuration Section */}
            <Card className="bg-card border-border">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-card-foreground">
                        <Calendar className="w-5 h-5 text-secondary" />
                        Meeting Configuration
                    </CardTitle>
                    <CardDescription>Set up your congregation details and reporting period</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="congregation" className="text-sm font-medium">
                                Congregation Name
                            </Label>
                            <Input
                                id="congregation"
                                placeholder="Enter congregation name..."
                                value={congregationName}
                                onChange={(e) => setCongregationName(e.target.value)}
                                className="bg-input border-border"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="search" className="text-sm font-medium">
                                Search Records
                            </Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    id="search"
                                    placeholder="Search by date, type, or notes..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 bg-input border-border"
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>



            {/* Main Attendance Table */}
            <Card className="bg-card border-border">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-card-foreground">
                        <Users className="w-5 h-5 text-secondary" />
                        Attendance Records
                    </CardTitle>
                    <CardDescription>Track attendance for midweek and weekend meetings with detailed analytics</CardDescription>
                </CardHeader>
                <CardContent>
                    <AttendanceTable searchTerm={searchTerm} attendanceData={initialAttendanceData} />
                </CardContent>
            </Card>

            {/* Instructions */}
            <Card className="bg-muted/50 border-border">
                <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-secondary mt-2 flex-shrink-0" />
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-foreground">Recording Instructions</p>
                            <p className="text-sm text-muted-foreground text-pretty">
                                Take attendance count once at the midpoint of each meeting. Remember to include any homebound or
                                isolated individuals who may be tied in remotely.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
