"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Check, X } from "lucide-react"
import { updateFieldServiceReport } from "@/lib/actions/field-service.actions"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ReportTableProps {
    reportData: any[]
    selectedMonth: string
    onRefresh: () => void
}

export function ReportTable({ reportData, selectedMonth, onRefresh }: ReportTableProps) {
    const [loading, setLoading] = useState(false)

    const handleToggleCheck = async (id: string, currentCheck: boolean) => {
        setLoading(true)
        try {
            await updateFieldServiceReport(id, { check: !currentCheck })
            toast.success(`Report ${!currentCheck ? 'approved' : 'unapproved'}`)
            onRefresh()
        } catch (error) {
            toast.error("Failed to update report")
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const getMonthName = (monthStr: string) => {
        if (!monthStr) return 'All Reports'
        const [year, month] = monthStr.split('-')
        return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { 
            month: 'long', 
            year: 'numeric' 
        })
    }

    const getTotalHours = () => {
        return reportData.reduce((sum, report) => sum + (report.hours || 0), 0)
    }

    const getTotalBibleStudents = () => {
        return reportData.reduce((sum, report) => sum + (report.bibleStudents || 0), 0)
    }

    const getApprovedCount = () => {
        return reportData.filter(report => report.check).length
    }

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-primary">{reportData.length}</div>
                        <div className="text-sm text-muted-foreground">Total Reports</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-green-600">{getApprovedCount()}</div>
                        <div className="text-sm text-muted-foreground">Approved</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-blue-600">{getTotalHours()}</div>
                        <div className="text-sm text-muted-foreground">Total Hours</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-purple-600">{getTotalBibleStudents()}</div>
                        <div className="text-sm text-muted-foreground">Bible Students</div>
                    </CardContent>
                </Card>
            </div>

            {/* Reports Table */}
            <Card className="bg-card border-border">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-card-foreground">
                        Field Service Reports - {getMonthName(selectedMonth)}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {reportData.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No field service reports found for the selected period.
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-lg border border-border bg-card">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-muted/50">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Publisher</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Month</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Hours</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Bible Students</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Status</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Comments</th>
                                            <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {reportData.map((report, index) => (
                                            <tr
                                                key={report._id}
                                                className={`hover:bg-muted/30 transition-colors ${index % 2 === 0 ? "bg-background" : "bg-muted/10"}`}
                                            >
                                                <td className="px-6 py-4 text-sm font-medium text-foreground">
                                                    {report.publisher?.firstName} {report.publisher?.lastName}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-foreground">
                                                    {new Date(report.month + '-01').toLocaleDateString('en-US', { 
                                                        month: 'short', 
                                                        year: 'numeric' 
                                                    })}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-foreground">
                                                    {report.hours || 0}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-foreground">
                                                    {report.bibleStudents || 0}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge
                                                        variant={report.check ? "default" : "secondary"}
                                                        className={
                                                            report.check
                                                                ? "bg-green-100 text-green-800 hover:bg-green-200"
                                                                : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                                                        }
                                                    >
                                                        {report.check ? "Approved" : "Pending"}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-foreground max-w-xs truncate">
                                                    {report.comments || "-"}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleToggleCheck(report._id, report.check)}
                                                            className={`h-8 w-8 p-0 ${
                                                                report.check 
                                                                    ? "text-red-600 hover:text-red-700" 
                                                                    : "text-green-600 hover:text-green-700"
                                                            }`}
                                                            disabled={loading}
                                                        >
                                                            {report.check ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}