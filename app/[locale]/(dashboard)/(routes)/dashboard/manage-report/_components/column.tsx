"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Eye, Edit, Phone, MessageSquare } from "lucide-react"

export type MemberWithReportStatus = {
    _id: string
    fullName: string
    phone: string
    hasReported: boolean
    month: string
    privileges: Array<{ _id: string; name: string }>
    groupId?: { _id: string; name: string } | null
    reportId?: string | null
    smsCount?: number
}

interface ColumnsProps {
    onAddReport: (member: MemberWithReportStatus) => void
    onViewReport: (reportId: string) => void
    onEditReport?: (reportId: string) => void
    onSendSMS?: (member: MemberWithReportStatus) => void
}

const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
};

export const createColumns = ({ onAddReport, onViewReport, onEditReport, onSendSMS }: ColumnsProps): ColumnDef<MemberWithReportStatus>[] => [
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
            const hasReported = row.original.hasReported;
            const smsCount = row.original.smsCount || 0;
            return (
                <div className="flex items-center gap-2">
                    <span className="font-medium">{row.getValue("fullName")}</span>
                    {!hasReported && (
                        <Badge variant="destructive" className="text-xs">!</Badge>
                    )}
                    {smsCount > 0 && (
                        <Badge variant="secondary" className="text-xs">{smsCount} SMS</Badge>
                    )}
                </div>
            );
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
            const monthName = new Date(member.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            
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
                                View
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
                        <>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onAddReport(member)}
                                className="h-8"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add
                            </Button>
                            {member.phone && (
                                <>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleCall(member.phone)}
                                        className="h-8"
                                        title="Call member"
                                    >
                                        <Phone className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onSendSMS?.(member)}
                                        className="h-8"
                                        title="Send SMS reminder"
                                    >
                                        <MessageSquare className="w-4 h-4" />
                                    </Button>
                                </>
                            )}
                        </>
                    )}
                </div>
            )
        },
    },
]