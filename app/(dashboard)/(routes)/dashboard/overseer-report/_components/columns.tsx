"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Calendar, Users, BookOpen, AlertTriangle } from "lucide-react"
import { format } from "date-fns"

export interface OverseerReportData {
    _id: string
    groupName: string
    month: string
    visitDate: string
    status: 'completed' | 'scheduled' | 'pending'
    presentCount: number
    totalMembers: number
    studyCount: number
    ministryActive: number
    followUpNeeded: boolean
    createdAt: string
    scheduledDate?: string
}

export const createOverseerColumns = (): ColumnDef<OverseerReportData>[] => [
    {
        accessorKey: "groupName",
        header: "Group",
        cell: ({ row }) => (
            <div className="flex items-center gap-1 sm:gap-2 min-w-0">
                <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                <span className="font-medium text-xs sm:text-sm truncate">{row.getValue("groupName")}</span>
            </div>
        ),
    },
    {
        accessorKey: "month",
        header: "Month",
        cell: ({ row }) => {
            const month = row.getValue("month") as string
            return (
                <span className="text-xs sm:text-sm">
                    <span className="hidden sm:inline">{format(new Date(month), 'MMMM yyyy')}</span>
                    <span className="sm:hidden">{format(new Date(month), 'MMM yy')}</span>
                </span>
            )
        },
    },
    {
        accessorKey: "visitDate",
        header: "Date",
        cell: ({ row }) => {
            const visitDate = row.getValue("visitDate") as string
            const scheduledDate = row.original.scheduledDate
            
            if (visitDate) {
                return (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-1">
                        <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-green-600" />
                            <span className="text-green-600 font-medium text-xs sm:text-sm">
                                <span className="hidden sm:inline">{format(new Date(visitDate), 'MMM dd, yyyy')}</span>
                                <span className="sm:hidden">{format(new Date(visitDate), 'MMM dd')}</span>
                            </span>
                        </div>
                    </div>
                )
            } else if (scheduledDate) {
                return (
                    <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-blue-600" />
                            <span className="text-blue-600 text-xs sm:text-sm">
                                <span className="hidden sm:inline">{format(new Date(scheduledDate), 'MMM dd, yyyy')}</span>
                                <span className="sm:hidden">{format(new Date(scheduledDate), 'MMM dd')}</span>
                            </span>
                        </div>
                        <Badge variant="outline" className="text-xs w-fit">Scheduled</Badge>
                    </div>
                )
            }
            
            return <span className="text-muted-foreground text-xs sm:text-sm">Not scheduled</span>
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string
            const statusConfig = {
                completed: { label: "Completed", short: "Done", className: "bg-green-100 text-green-800" },
                scheduled: { label: "Scheduled", short: "Sched", className: "bg-blue-100 text-blue-800" },
                pending: { label: "Pending", short: "Pend", className: "bg-yellow-100 text-yellow-800" }
            }
            const config = statusConfig[status as keyof typeof statusConfig]
            return (
                <Badge className={`${config.className} text-xs`}>
                    <span className="hidden sm:inline">{config.label}</span>
                    <span className="sm:hidden">{config.short}</span>
                </Badge>
            )
        },
    },
    {
        accessorKey: "presentCount",
        header: "Attend",
        cell: ({ row }) => {
            const present = row.getValue("presentCount") as number
            const total = row.original.totalMembers
            return (
                <div className="flex items-center gap-1">
                    <Users className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs sm:text-sm font-medium">{present}/{total}</span>
                </div>
            )
        },
    },
    {
        accessorKey: "studyCount",
        header: "Studies",
        cell: ({ row }) => (
            <div className="flex items-center gap-1">
                <BookOpen className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs sm:text-sm font-medium">{row.getValue("studyCount")}</span>
            </div>
        ),
    },
    {
        accessorKey: "ministryActive",
        header: "Active",
        cell: ({ row }) => (
            <span className="text-xs sm:text-sm font-medium">{row.getValue("ministryActive")}</span>
        ),
    },
    {
        accessorKey: "followUpNeeded",
        header: "F/Up",
        cell: ({ row }) => {
            const needsFollowUp = row.getValue("followUpNeeded") as boolean
            return needsFollowUp ? (
                <Badge variant="outline" className="gap-1 text-xs">
                    <AlertTriangle className="h-3 w-3" />
                    <span className="hidden sm:inline">Required</span>
                    <span className="sm:hidden">Yes</span>
                </Badge>
            ) : (
                <span className="text-muted-foreground text-xs sm:text-sm">No</span>
            )
        },
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
            const status = row.original.status
            
            return (
                <div className="flex gap-1">
                    {status === 'scheduled' ? (
                        <Button 
                            variant="default" 
                            size="sm" 
                            className="gap-1"
                            onClick={() => {
                                // Extract groupId from the scheduled ID format
                                const idParts = row.original._id.split('-')
                                const groupId = idParts[1] // scheduled-{groupId}-{month}-{index}
                                
                                const event = new CustomEvent('createReport', {
                                    detail: {
                                        groupId: groupId,
                                        groupName: row.original.groupName,
                                        month: row.original.month,
                                        scheduledDate: row.original.scheduledDate
                                    }
                                })
                                window.dispatchEvent(event)
                            }}
                        >
                            <Eye className="h-3 w-3" />
                            Create Report
                        </Button>
                    ) : (
                        <Button variant="ghost" size="sm" className="gap-1">
                            <Eye className="h-3 w-3" />
                            View
                        </Button>
                    )}
                </div>
            )
        },
    }
]