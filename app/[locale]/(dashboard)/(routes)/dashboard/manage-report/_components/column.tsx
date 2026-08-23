"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Eye, Edit, Phone, MessageSquare, Trash2 } from "lucide-react"

export type MemberWithReportStatus = {
    _id: string
    fullName: string
    phone: string
    profileImage?: string
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
    onDeleteReport?: (reportId: string, memberName: string) => void
}

const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
};

export const createColumns = ({ onAddReport, onViewReport, onEditReport, onSendSMS, onDeleteReport }: ColumnsProps): ColumnDef<MemberWithReportStatus>[] => [
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
            const name = row.original.fullName;
            const hasReported = row.original.hasReported;
            const smsCount = row.original.smsCount || 0;
            const profileImage = row.original.profileImage;
            return (
                <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={profileImage || ''} alt={name} />
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                            {name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{name}</span>
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
        header: "Status",
        cell: ({ row }) => {
            const hasReported = row.getValue("hasReported") as boolean
            return (
                <Badge
                    variant={hasReported ? "default" : "destructive"}
                    className={
                        hasReported
                            ? "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300"
                            : "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300"
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
                <div className="flex flex-wrap gap-1">
                    {hasReported && member.reportId ? (
                        <>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onViewReport(member.reportId!)}
                                className="h-8 px-2 sm:px-3"
                            >
                                <Eye className="w-4 h-4 sm:mr-1" />
                                <span className="hidden sm:inline">View</span>
                            </Button>
                            {onEditReport && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onEditReport(member.reportId!)}
                                    className="h-8 px-2 sm:px-3"
                                >
                                    <Edit className="w-4 h-4 sm:mr-1" />
                                    <span className="hidden sm:inline">Edit</span>
                                </Button>
                            )}
                            {onDeleteReport && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onDeleteReport(member.reportId!, member.fullName)}
                                    className="h-8 px-2 sm:px-3 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                >
                                    <Trash2 className="w-4 h-4 sm:mr-1" />
                                    <span className="hidden sm:inline">Delete</span>
                                </Button>
                            )}
                        </>
                    ) : (
                        <>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onAddReport(member)}
                                className="h-8 px-2 sm:px-3"
                            >
                                <Plus className="w-4 h-4 sm:mr-1" />
                                <span className="hidden sm:inline">Add</span>
                            </Button>
                            {member.phone && (
                                <>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleCall(member.phone)}
                                        className="h-8 px-2"
                                        title="Call member"
                                    >
                                        <Phone className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onSendSMS?.(member)}
                                        className="h-8 px-2"
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