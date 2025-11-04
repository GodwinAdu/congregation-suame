"use client"

import React, { useState } from "react"
import { Edit, Eye, Loader2, MoreHorizontal } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { DeleteDialog } from "@/components/commons/DeleteDialog"
import useClientRole from "@/lib/helpers/client-role"
import { RoleDialog } from "./RoleModal"
import { GroupDialog } from "./GroupModal"
import { PrivilegeDialog } from "./PrivilegeModal"
import { SimpleDutyModal } from "../../app/(dashboard)/(routes)/dashboard/members/_components/SimpleDutyModal"

interface ActionOption<T> {
    label: string
    icon?: React.ReactNode
    type: "view" | "edit" | "delete" | "custom" | "assignRole" | "assignGroup" | "assignPrivileges" | "assignDuties"
    permissionKey?: string
    onClick?: (item: T) => void
    href?: string
    disabled?: boolean
    hidden?: boolean
    customComponent?: React.ReactNode
}

interface AdvancedCellActionProps<T> {
    data: T & { _id: string }
    actions: ActionOption<T>[]
    onDelete?: (id: string) => Promise<void>
}

export function CellAction<T extends Record<string, unknown>>({
    data,
    actions,
    onDelete,
}: AdvancedCellActionProps<T>) {
    const [loading, setLoading] = useState(false)
    const [showDutyModal, setShowDutyModal] = useState(false)
    const { isLoading, role } = useClientRole()
    const router = useRouter()

    const handleDelete = async () => {
        if (!onDelete) return
        try {
            setLoading(true)
            await onDelete(data._id)
            router.refresh()
            toast.success("Deleted successfully")
        } catch (err) {
            console.log(err)
            toast.error("Delete failed", {
                description: "An error occurred while deleting.",
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>

                {actions
                    .filter((action) => !action.hidden)
                    .map((action, index) => {
                        const hasPermission =
                            !action.permissionKey || role?.permissions?.[action.permissionKey]

                        if (!hasPermission) return null

                                if (action.type === "delete") {
                                    return (
                                        <DropdownMenuItem
                                            key={index}
                                            onSelect={(e) => e.preventDefault()}
                                            className="bg-red-500 hover:bg-red-800 text-white"
                                            disabled={loading || action.disabled}
                                        >
                                            <DeleteDialog
                                                id={data._id}
                                                onContinue={handleDelete}
                                                isLoading={loading}
                                            />

                                        </DropdownMenuItem>
                                    )
                                }

                                if (action.type === "assignGroup") {
                                    return (
                                        <DropdownMenuItem
                                            key={index}
                                            onSelect={(e) => e.preventDefault()}
                                            disabled={loading || action.disabled}
                                        >
                                            <GroupDialog 
                                                memberId={data._id}
                                                currentGroup={(data as any).groupName || (data as any).group}
                                                memberName={(data as any).fullName || (data as any).name}
                                            />
                                        </DropdownMenuItem>
                                    )
                                }

                                if (action.type === "assignRole") {
                                    return (
                                        <DropdownMenuItem
                                            key={index}
                                            onSelect={(e) => e.preventDefault()}
                                            disabled={loading || action.disabled}
                                        >
                                            <RoleDialog 
                                                memberId={data._id}
                                                currentRole={(data as any).roleName || (data as any).role}
                                                memberName={(data as any).fullName || (data as any).name}
                                            />
                                        </DropdownMenuItem>
                                    )
                                }

                                if (action.type === "assignPrivileges") {
                                    return (
                                        <DropdownMenuItem
                                            key={index}
                                            onSelect={(e) => e.preventDefault()}
                                            disabled={loading || action.disabled}
                                        >
                                            <PrivilegeDialog 
                                                memberId={data._id}
                                                currentPrivileges={(data as any).privileges || []}
                                                memberName={(data as any).fullName || (data as any).name}
                                            />
                                        </DropdownMenuItem>
                                    )
                                }

                                if (action.type === "assignDuties") {
                                    return (
                                        <DropdownMenuItem
                                            key={index}
                                            onSelect={() => setShowDutyModal(true)}
                                            disabled={loading || action.disabled}
                                        >
                                            <div className="flex items-center space-x-2">
                                                {action.icon}
                                                <span>{action.label}</span>
                                            </div>
                                        </DropdownMenuItem>
                                    )
                                }

                                if (action.href) {
                                    return (
                                        <DropdownMenuItem asChild key={index} disabled={action.disabled}>
                                            <Link href={action.href}>
                                                <div className="flex items-center space-x-2">
                                                    {action.icon ?? (action.type === "edit" ? <Edit className="h-4 w-4" /> : <Eye className="h-4 w-4" />)}
                                                    <span>{action.label}</span>
                                                </div>
                                            </Link>
                                        </DropdownMenuItem>
                                    )
                                }

                                if (action.customComponent) {
                                    return (
                                        <DropdownMenuItem
                                            key={index}
                                            onSelect={(e) => e.preventDefault()}
                                            disabled={action.disabled}
                                        >
                                            {action.customComponent}
                                        </DropdownMenuItem>
                                    )
                                }

                                return (
                                    <DropdownMenuItem
                                        key={index}
                                        onSelect={() => action.onClick?.(data)}
                                        disabled={action.disabled}
                                    >
                                        <div className="flex items-center space-x-2">
                                            {action.icon}
                                            <span>{action.label}</span>
                                        </div>
                                    </DropdownMenuItem>
                                )
                    })}
            </DropdownMenuContent>
            <SimpleDutyModal
                open={showDutyModal}
                onClose={() => setShowDutyModal(false)}
                member={data}
            />
        </DropdownMenu>
    )
}
