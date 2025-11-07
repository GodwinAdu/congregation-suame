"use client"

import { useState, useEffect } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { fetchReportById } from "@/lib/actions/field-service.actions"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar, Clock, Users, MessageSquare, CheckCircle, XCircle } from "lucide-react"

interface ReportDetailsModalProps {
    open: boolean
    onClose: () => void
    reportId: string | null
}

export function GroupDetailsModal({ open, onClose, reportId }: ReportDetailsModalProps) {
    const [report, setReport] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (open && reportId) {
            fetchReport()
        }
    }, [open, reportId])

    const fetchReport = async () => {
        if (!reportId) return

        setLoading(true)
        try {
            const reportData = await fetchReportById(reportId)
            setReport(reportData)
        } catch (error) {
            console.error("Error fetching report:", error)
        } finally {
            setLoading(false)
        }
    }

    const getMonthName = (monthStr: string) => {
        const [year, month] = monthStr.split('-')
        return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric'
        })
    }

    const isPioneer = report?.publisher?.privileges?.some((privilege: any) =>
        privilege.name === "Regular Pioneer" || privilege.name === "Auxiliary Pioneer"
    )

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] w-[96%] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Field Service Report Details</DialogTitle>
                    <DialogDescription>
                        View detailed information about the field service report
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-24 w-full" />
                    </div>
                ) : report ? (
                    <div className="space-y-6">
                        {/* Publisher Info */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Users className="w-5 h-5 text-primary" />
                                    Publisher Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-muted-foreground">Name:</span>
                                    <span className="font-semibold">{report.publisher?.fullName}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-muted-foreground">Month:</span>
                                    <span className="font-semibold">{getMonthName(report.month)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-muted-foreground">Status:</span>
                                    <Badge
                                        variant={report.check ? "default" : "secondary"}
                                        className={
                                            report.check
                                                ? "bg-green-100 text-green-800"
                                                : "bg-yellow-100 text-yellow-800"
                                        }
                                    >
                                        {report.check ? (
                                            <>
                                                <CheckCircle className="w-3 h-3 mr-1" />
                                                Approved
                                            </>
                                        ) : (
                                            <>
                                                <XCircle className="w-3 h-3 mr-1" />
                                                Pending
                                            </>
                                        )}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Report Details */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-primary" />
                                    Report Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {isPioneer && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                            <Clock className="w-4 h-4" />
                                            Hours:
                                        </span>
                                        <span className="font-semibold text-lg">{report.hours || 0}</span>
                                    </div>
                                )}

                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                        <Users className="w-4 h-4" />
                                        Bible Students:
                                    </span>
                                    <span className="font-semibold text-lg">{report.bibleStudents || 0}</span>
                                </div>

                                {report.comments && (
                                    <>
                                        <Separator />
                                        <div className="space-y-2">
                                            <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                                <MessageSquare className="w-4 h-4" />
                                                Comments:
                                            </span>
                                            <div className="bg-muted/50 p-3 rounded-md">
                                                <p className="text-sm">{report.comments}</p>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Timestamps */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-muted-foreground">Created:</span>
                                        <p className="font-medium">
                                            {new Date(report.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Updated:</span>
                                        <p className="font-medium">
                                            {new Date(report.updatedAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">
                        No report data available
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}