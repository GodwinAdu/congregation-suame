"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, FileText, Download, User, Clock, BookOpen, Users } from "lucide-react"
import { PublisherExportView } from "./publisher-export-view"

interface Member {
    _id: string
    fullName: string
    email: string
    phone?: string
    gender?: string
    dob?: string
    address?: string
    emergencyContact?: string
    role: string
    groupId?: { name: string }
    privileges?: Array<{ name: string }>
    createdAt: string
}

interface Report {
    _id: string
    month: string
    hours: number
    bibleStudents: number
    auxiliaryPioneer?: boolean
    check: boolean
    comments?: string
    createdAt: string
}

interface PublisherRecordTrackerProps {
    member: Member
    reports: Report[]
}

const months = [
    "September",
    "October",
    "November",
    "December",
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
]

export function PublisherRecordTracker({ member, reports }: PublisherRecordTrackerProps) {
    const [showExport, setShowExport] = useState(false)
    const [selectedYear, setSelectedYear] = useState(() => {
        const currentDate = new Date()
        const currentMonth = currentDate.getMonth()
        return currentMonth >= 8 ? currentDate.getFullYear() : currentDate.getFullYear() - 1
    })

    const isRegularPioneer = member?.privileges?.some((privilege: any) =>
        privilege.name === "Regular Pioneer"
    )

    const availableYears = useMemo(() => {
        const years = new Set<number>()
        reports.forEach(report => {
            const [year, month] = report.month.split('-')
            const reportYear = parseInt(year)
            const reportMonth = parseInt(month)
            const serviceYear = reportMonth >= 9 ? reportYear : reportYear - 1
            years.add(serviceYear)
        })

        if (years.size === 0) {
            const currentDate = new Date()
            const currentMonth = currentDate.getMonth()
            const currentServiceYear = currentMonth >= 8 ? currentDate.getFullYear() : currentDate.getFullYear() - 1
            years.add(currentServiceYear)
        }

        return Array.from(years).sort((a, b) => b - a)
    }, [reports])

    const filteredReports = useMemo(() => {
        return reports.filter(report => {
            const [year, month] = report.month.split('-')
            const reportYear = parseInt(year)
            const reportMonth = parseInt(month)
            const serviceYear = reportMonth >= 9 ? reportYear : reportYear - 1
            return serviceYear === selectedYear
        })
    }, [reports, selectedYear])

    const getMonthName = (monthString: string) => {
        const [year, month] = monthString.split('-')
        const monthIndex = parseInt(month) - 1
        const serviceYearMonths = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ]
        return serviceYearMonths[monthIndex]
    }

    const monthlyRecords = useMemo(() => {
        const records: { [key: string]: { hours: number; bibleStudies: number; comments: string; hasReport: boolean; auxiliaryPioneer: boolean } } = {}

        months.forEach(month => {
            records[month] = { hours: 0, bibleStudies: 0, comments: '', hasReport: false, auxiliaryPioneer: false }
        })

        filteredReports.forEach(report => {
            const monthName = getMonthName(report.month)
            if (monthName && records[monthName]) {
                records[monthName] = {
                    hours: report.hours || 0,
                    bibleStudies: report.bibleStudents || 0,
                    comments: report.comments || '',
                    hasReport: true,
                    auxiliaryPioneer: report.auxiliaryPioneer || false
                }
            }
        })

        return records
    }, [filteredReports])




    const totals = useMemo(() => {
        const totals = {
            bibleStudies: 0,
            hours: 0,
            monthsActive: 0,
        }

        Object.values(monthlyRecords).forEach((record) => {
            totals.bibleStudies += record.bibleStudies
            totals.hours += record.hours
            if (record.hasReport) totals.monthsActive++
        })

        return totals
    }, [monthlyRecords])

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Not provided'
        return new Date(dateString).toLocaleDateString()
    }

    if (showExport) {
        // Transform monthlyRecords to match expected format
        const exportData = {
            name: member.fullName,
            dateOfBirth: member.dob || '',
            dateOfBaptism: '',
            gender: (member.gender === 'male' || member.gender === 'female') ? member.gender : '' as "male" | "female" | "",
            privileges: {
                elder: false,
                ministerialServant: false,
                regularPioneer: false,
                specialPioneer: false,
                otherSheep: false,
                anointed: false,
                fieldMissionary: false,
            },
            monthlyRecords: Object.fromEntries(
                Object.entries(monthlyRecords).map(([month, record]) => [
                    month,
                    {
                        sharedInMinistry: record.hasReport,
                        bibleStudies: record.bibleStudies,
                        auxiliaryPioneer: record.auxiliaryPioneer,
                        hours: record.hours,
                        remarks: record.comments,
                    }
                ])
            )
        }
        return <PublisherExportView data={exportData} onClose={() => setShowExport(false)} />
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background p-4">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="flex items-center justify-center gap-3">
                        <div className="p-3 bg-primary/10 rounded-full">
                            <User className="h-8 w-8 text-primary" />
                        </div>
                        <h1 className="text-4xl font-bold text-foreground">Publisher Service Record</h1>
                    </div>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Service record for {member.fullName}
                    </p>

                    {/* Year Selector */}
                    <div className="flex items-center justify-center gap-2">
                        <Label htmlFor="year-select" className="text-sm font-medium">Service Year:</Label>
                        <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
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

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <Clock className="h-8 w-8 text-primary" />
                                <div>
                                    <p className="text-2xl font-bold text-primary">{totals.hours}</p>
                                    <p className="text-sm text-muted-foreground">Total Hours</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-secondary/5 to-secondary/10 border-secondary/20">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <BookOpen className="h-8 w-8 text-secondary" />
                                <div>
                                    <p className="text-2xl font-bold text-secondary">{totals.bibleStudies}</p>
                                    <p className="text-sm text-muted-foreground">Bible Studies</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <Calendar className="h-8 w-8 text-accent" />
                                <div>
                                    <p className="text-2xl font-bold text-accent">{totals.monthsActive}</p>
                                    <p className="text-sm text-muted-foreground">Active Months</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-chart-4/5 to-chart-4/10 border-chart-4/20">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <Users className="h-8 w-8 text-chart-4" />
                                <div>
                                    <p className="text-2xl font-bold text-chart-4">{Math.round(totals.hours / 12)}</p>
                                    <p className="text-sm text-muted-foreground">Avg Hours/Month</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Personal Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Personal Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Full Name</Label>
                                <p className="text-sm py-2 font-medium">{member.fullName}</p>
                            </div>

                            <div className="space-y-2">
                                <Label>Email</Label>
                                <p className="text-sm py-2">{member.email}</p>
                            </div>

                            <div className="space-y-2">
                                <Label>Phone</Label>
                                <p className="text-sm py-2">{member.phone || 'Not provided'}</p>
                            </div>

                            <div className="space-y-2">
                                <Label>Gender</Label>
                                <p className="text-sm py-2 capitalize">{member.gender || 'Not provided'}</p>
                            </div>

                            <div className="space-y-2">
                                <Label>Date of Birth</Label>
                                <p className="text-sm py-2">{formatDate(member.dob)}</p>
                            </div>

                            <div className="space-y-2">
                                <Label>Role</Label>
                                <p className="text-sm py-2 font-medium">{member.role}</p>
                            </div>

                            {member.groupId && (
                                <div className="space-y-2">
                                    <Label>Group</Label>
                                    <p className="text-sm py-2">{member.groupId.name}</p>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label>Member Since</Label>
                                <p className="text-sm py-2">{formatDate(member.createdAt)}</p>
                            </div>
                        </div>

                        {member.privileges && member.privileges.length > 0 && (
                            <div className="space-y-3">
                                <Label>Privileges</Label>
                                <div className="flex flex-wrap gap-2">
                                    {member.privileges.map((privilege, index) => (
                                        <span key={index} className="px-2 py-1 bg-primary/10 text-primary rounded-md text-sm">
                                            {privilege.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Service Records */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Service Year Records
                        </CardTitle>
                        <Button onClick={() => setShowExport(true)} className="gap-2">
                            <Download className="h-4 w-4" />
                            Export Report
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="border-b-2 border-border">
                                        <th className="text-left p-3 font-semibold">Month</th>
                                        <th className="text-center p-3 font-semibold">Hours</th>
                                        <th className="text-center p-3 font-semibold">Bible Studies</th>
                                        <th className="text-left p-3 font-semibold">Comments</th>
                                        <th className="text-center p-3 font-semibold">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {months.map((month) => {
                                        const record = monthlyRecords[month]
                                        return (
                                            <tr key={month} className="border-b border-border hover:bg-muted/50 transition-colors">
                                                <td className="p-3 font-medium">{month}</td>
                                                <td className="p-3 text-center">
                                                    {record.hours}
                                                    {isRegularPioneer && (
                                                        <span className="ml-1 px-1.5 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded text-xs font-medium">
                                                            RP
                                                        </span>
                                                    )}
                                                    {record.auxiliaryPioneer && (
                                                        <span className="ml-1 px-1.5 py-0.5 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 rounded text-xs font-medium">
                                                            AP
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-3 text-center">{record.bibleStudies}</td>
                                                <td className="p-3">{record.comments || '-'}</td>
                                                <td className="p-3 text-center">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${record.hasReport
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                                                        }`}>
                                                        {record.hasReport ? 'Reported' : 'No Report'}
                                                    </span>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                    <tr className="border-t-2 border-primary bg-primary/5 font-semibold">
                                        <td className="p-3">Total</td>
                                        <td className="p-3 text-center">{totals.hours}</td>
                                        <td className="p-3 text-center">{totals.bibleStudies}</td>
                                        <td className="p-3">-</td>
                                        <td className="p-3 text-center">{totals.monthsActive} months</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
