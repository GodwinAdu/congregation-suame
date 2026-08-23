"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
    Users, FileText, Clock, BookOpen, TrendingUp, AlertTriangle,
    Download, Loader2, BarChart3, MapPin, UserCheck, CalendarDays
} from 'lucide-react'
import { getCOVisitPreparation } from '@/lib/actions/co-visit-prep.actions'
import { toast } from 'sonner'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export function COVisitPrepClient() {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [exporting, setExporting] = useState(false)

    useEffect(() => {
        const loadData = async () => {
            try {
                const result = await getCOVisitPreparation(6)
                setData(result)
            } catch (error) {
                toast.error('Failed to load preparation data')
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [])

    const exportPDF = () => {
        if (!data) return
        setExporting(true)

        try {
            const doc = new jsPDF()

            // Title
            doc.setFontSize(18)
            doc.text('CO Visit Preparation Summary', 14, 15)
            doc.setFontSize(10)
            doc.text('Suame Congregation', 14, 22)
            doc.text(`Generated: ${new Date().toLocaleDateString()} | Period: Last ${data.periodMonths} months`, 14, 28)

            // Congregation Overview
            doc.setFontSize(13)
            doc.text('Congregation Overview', 14, 38)
            autoTable(doc, {
                startY: 42,
                head: [['Metric', 'Value']],
                body: [
                    ['Total Publishers', String(data.overview.totalMembers)],
                    ['Field Service Groups', String(data.overview.totalGroups)],
                    ['Regular Pioneers', String(data.overview.regularPioneers)],
                    ['Auxiliary Pioneers (unique)', String(data.overview.auxiliaryPioneersUnique)],
                    ['Inactive (3+ months)', String(data.overview.inactiveCount)],
                ],
                headStyles: { fillColor: [59, 130, 246] },
                styles: { fontSize: 9 },
            })

            // Field Service
            let y = (doc as any).lastAutoTable?.finalY + 10 || 90
            doc.setFontSize(13)
            doc.text('Field Service Summary', 14, y)
            autoTable(doc, {
                startY: y + 4,
                head: [['Month', 'Reports', 'Hours', 'Bible Studies', 'Rate']],
                body: data.fieldService.monthlyTrends.map((t: any) => [
                    t.month,
                    String(t.reports),
                    String(t.hours),
                    String(t.studies),
                    `${t.reportingRate}%`
                ]),
                headStyles: { fillColor: [16, 185, 129] },
                styles: { fontSize: 8 },
            })

            // Attendance
            y = (doc as any).lastAutoTable?.finalY + 10 || 150
            doc.setFontSize(13)
            doc.text('Meeting Attendance', 14, y)
            autoTable(doc, {
                startY: y + 4,
                head: [['Metric', 'Value']],
                body: [
                    ['Average Midweek', String(data.attendance.avgMidweek)],
                    ['Average Weekend', String(data.attendance.avgWeekend)],
                    ['Total Meetings Recorded', String(data.attendance.totalMeetings)],
                ],
                headStyles: { fillColor: [139, 92, 246] },
                styles: { fontSize: 9 },
            })

            // Members needing shepherding
            if (data.shepherding.membersNotReporting.length > 0) {
                y = (doc as any).lastAutoTable?.finalY + 10 || 180
                if (y > 250) {
                    doc.addPage()
                    y = 15
                }
                doc.setFontSize(13)
                doc.text('Members Needing Shepherding', 14, y)
                autoTable(doc, {
                    startY: y + 4,
                    head: [['Name', 'Group', 'Phone']],
                    body: data.shepherding.membersNotReporting.map((m: any) => [
                        m.fullName,
                        m.groupId?.name || 'Unassigned',
                        m.phone || '—'
                    ]),
                    headStyles: { fillColor: [239, 68, 68] },
                    styles: { fontSize: 8 },
                })
            }

            // Pioneers
            if (data.pioneers.regularPioneers.length > 0) {
                y = (doc as any).lastAutoTable?.finalY + 10 || 200
                if (y > 250) {
                    doc.addPage()
                    y = 15
                }
                doc.setFontSize(13)
                doc.text('Regular Pioneers', 14, y)
                autoTable(doc, {
                    startY: y + 4,
                    head: [['Name', 'Phone']],
                    body: data.pioneers.regularPioneers.map((p: any) => [
                        p.fullName,
                        p.phone || '—'
                    ]),
                    headStyles: { fillColor: [245, 158, 11] },
                    styles: { fontSize: 9 },
                })
            }

            doc.save(`co-visit-preparation-${new Date().toISOString().split('T')[0]}.pdf`)
            toast.success('CO Visit preparation exported as PDF')
        } catch (error) {
            toast.error('Failed to export PDF')
        } finally {
            setExporting(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span className="text-muted-foreground">Compiling CO visit data...</span>
            </div>
        )
    }

    if (!data) return null

    return (
        <div className="space-y-6">
            {/* Export Button */}
            <div className="flex justify-end">
                <Button onClick={exportPDF} disabled={exporting}>
                    {exporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                    Export Full Summary (PDF)
                </Button>
            </div>

            {/* Congregation Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                <Card>
                    <CardContent className="pt-4 pb-3 px-4">
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-blue-500" />
                            <div>
                                <p className="text-lg font-bold">{data.overview.totalMembers}</p>
                                <p className="text-xs text-muted-foreground">Publishers</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4 pb-3 px-4">
                        <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-green-500" />
                            <div>
                                <p className="text-lg font-bold">{data.overview.totalGroups}</p>
                                <p className="text-xs text-muted-foreground">Groups</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4 pb-3 px-4">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-purple-500" />
                            <div>
                                <p className="text-lg font-bold">{data.overview.regularPioneers}</p>
                                <p className="text-xs text-muted-foreground">Regular Pioneers</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4 pb-3 px-4">
                        <div className="flex items-center gap-2">
                            <UserCheck className="h-4 w-4 text-orange-500" />
                            <div>
                                <p className="text-lg font-bold">{data.overview.auxiliaryPioneersUnique}</p>
                                <p className="text-xs text-muted-foreground">Aux Pioneers</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4 pb-3 px-4">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                            <div>
                                <p className="text-lg font-bold">{data.overview.inactiveCount}</p>
                                <p className="text-xs text-muted-foreground">Inactive</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Field Service & Attendance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <FileText className="h-5 w-5" />
                            Field Service (Last {data.periodMonths} Months)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-3 bg-muted/50 rounded-lg">
                                <p className="text-2xl font-bold">{data.fieldService.totalHours}</p>
                                <p className="text-xs text-muted-foreground">Total Hours</p>
                            </div>
                            <div className="text-center p-3 bg-muted/50 rounded-lg">
                                <p className="text-2xl font-bold">{data.fieldService.totalStudies}</p>
                                <p className="text-xs text-muted-foreground">Bible Studies</p>
                            </div>
                            <div className="text-center p-3 bg-muted/50 rounded-lg">
                                <p className="text-2xl font-bold">{data.fieldService.avgReportsPerMonth}</p>
                                <p className="text-xs text-muted-foreground">Avg Reports/Month</p>
                            </div>
                            <div className="text-center p-3 bg-muted/50 rounded-lg">
                                <p className="text-2xl font-bold">{data.fieldService.reportingRate}%</p>
                                <p className="text-xs text-muted-foreground">Reporting Rate</p>
                            </div>
                        </div>
                        <Separator />
                        <div className="space-y-2">
                            <p className="text-sm font-medium">Monthly Breakdown</p>
                            {data.fieldService.monthlyTrends.map((trend: any) => (
                                <div key={trend.month} className="flex items-center justify-between text-sm py-1">
                                    <span className="text-muted-foreground">{trend.month}</span>
                                    <div className="flex gap-3">
                                        <Badge variant="secondary">{trend.reports} rpts</Badge>
                                        <Badge variant="outline">{trend.hours}h</Badge>
                                        <Badge variant="outline">{trend.studies} studies</Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <CalendarDays className="h-5 w-5" />
                            Meeting Attendance
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="text-center p-3 bg-muted/50 rounded-lg">
                                <p className="text-2xl font-bold">{data.attendance.avgMidweek}</p>
                                <p className="text-xs text-muted-foreground">Avg Midweek</p>
                            </div>
                            <div className="text-center p-3 bg-muted/50 rounded-lg">
                                <p className="text-2xl font-bold">{data.attendance.avgWeekend}</p>
                                <p className="text-xs text-muted-foreground">Avg Weekend</p>
                            </div>
                            <div className="text-center p-3 bg-muted/50 rounded-lg">
                                <p className="text-2xl font-bold">{data.attendance.totalMeetings}</p>
                                <p className="text-xs text-muted-foreground">Meetings</p>
                            </div>
                        </div>

                        <Separator />

                        <div>
                            <p className="text-sm font-medium mb-2">Groups ({data.groups.length})</p>
                            <div className="space-y-1.5">
                                {data.groups.map((group: any) => (
                                    <div key={group._id} className="flex items-center justify-between text-sm">
                                        <span>{group.name}</span>
                                        <Badge variant="secondary">{group.memberCount} members</Badge>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Separator />

                        <div>
                            <p className="text-sm font-medium mb-2">Regular Pioneers ({data.pioneers.regularPioneers.length})</p>
                            <div className="space-y-1">
                                {data.pioneers.regularPioneers.map((p: any) => (
                                    <div key={p._id} className="flex items-center justify-between text-sm">
                                        <span>{p.fullName}</span>
                                        <span className="text-xs text-muted-foreground">{p.phone || '—'}</span>
                                    </div>
                                ))}
                                {data.pioneers.regularPioneers.length === 0 && (
                                    <p className="text-sm text-muted-foreground">No regular pioneers</p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Members Needing Shepherding */}
            {data.shepherding.totalNeedingAttention > 0 && (
                <Card className="border-orange-200 dark:border-orange-800/30">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <AlertTriangle className="h-5 w-5 text-orange-500" />
                            Members Needing Shepherding ({data.shepherding.totalNeedingAttention})
                        </CardTitle>
                        <CardDescription>
                            Members who haven&apos;t reported in 3+ months
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {data.shepherding.membersNotReporting.map((member: any) => (
                                <div key={member._id} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg text-sm">
                                    <div>
                                        <p className="font-medium">{member.fullName}</p>
                                        <p className="text-xs text-muted-foreground">{member.groupId?.name || 'No group'}</p>
                                    </div>
                                    {member.phone && (
                                        <span className="text-xs text-muted-foreground">{member.phone}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
