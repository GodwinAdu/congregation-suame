"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Eye, Edit } from "lucide-react"

export type MemberWithReportStatus = {
    _id: string
    fullName: string
    hasReported: boolean
    month: string
    privileges: Array<{ _id: string; name: string }>
    groupId?: { _id: string; name: string } | null
    reportId?: string | null
}

interface ColumnsProps {
    onAddReport: (member: MemberWithReportStatus) => void
    onViewReport: (reportId: string) => void
    onEditReport?: (reportId: string) => void
}

export const createColumns = ({ onAddReport, onViewReport, onEditReport }: ColumnsProps): ColumnDef<MemberWithReportStatus>[] => [
    {
        accessorKey: "groupId",
        header: "Group",
        cell: ({ row }) => {
            const group = row.original.groupId;
            return group?.name || "No Group";
        },
        filterFn: (row, id, value) => {
            if (!value) return true;
            const groupId = row.original.groupId?._id;
            return groupId === value;
        },
    },
    {
        accessorKey: "fullName",
        header: "Full Name",
        cell: ({ row }) => {
            return <div className="font-medium">{row.getValue("fullName")}</div>
        },
    },
    {
        accessorKey: "hasReported",
        header: "Report Status",
        cell: ({ row }) => {
            const hasReported = row.getValue("hasReported") as boolean
            return (
                <Badge
                    variant={hasReported ? "default" : "destructive"}
                    className={
                        hasReported
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-red-100 text-red-800 hover:bg-red-200"
                    }
                >
                    {hasReported ? "Reported" : "Not Reported"}
                </Badge>
            )
        },
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
            const member = row.original
            const hasReported = member.hasReported
            
            return (
                <div className="flex gap-2">
                    {hasReported && member.reportId ? (
                        <>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onViewReport(member.reportId!)}
                                className="h-8"
                            >
                                <Eye className="w-4 h-4 mr-2" />
                                View Report
                            </Button>
                            {onEditReport && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onEditReport(member.reportId!)}
                                    className="h-8"
                                >
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit
                                </Button>
                            )}
                        </>
                    ) : (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onAddReport(member)}
                            className="h-8"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Report
                        </Button>
                    )}
                </div>
            )
        },
    },
]