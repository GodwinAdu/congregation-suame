"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Shield, Users, Eye } from "lucide-react"
import { format } from "date-fns"

export type RoleType = {
    _id: string
    name: string
    permissions: {
        dashboard: boolean
        manageGroupMembers: boolean
        manageAllReport: boolean
        manageGroupReport: boolean
        manageAllMembers: boolean
        manageUser: boolean
        manageAttendance: boolean
        transport: boolean
        history: boolean
        trash: boolean
    }
    createdAt: string
    updatedAt: string
}

interface ColumnsProps {
    onEdit: (role: RoleType) => void
    onDelete: (role: RoleType) => void
}

export const createColumns = ({ onEdit, onDelete }: ColumnsProps): ColumnDef<RoleType>[] => [
    {
        accessorKey: "name",
        header: "Role Name",
        cell: ({ row }) => {
            const role = row.original
            const isAdmin = role.permissions.manageAllMembers || role.permissions.manageUser
            
            return (
                <div className="flex items-center gap-2">
                    {isAdmin ? (
                        <Shield className="w-4 h-4 text-purple-600" />
                    ) : (
                        <Users className="w-4 h-4 text-blue-600" />
                    )}
                    <div>
                        <div className="font-medium">{role.name}</div>
                        <div className="text-sm text-muted-foreground">
                            {isAdmin ? "Administrative Role" : "Standard Role"}
                        </div>
                    </div>
                </div>
            )
        },
    },
    {
        accessorKey: "permissions",
        header: "Permissions",
        cell: ({ row }) => {
            const permissions = row.original.permissions
            const activePermissions = Object.entries(permissions)
                .filter(([_, value]) => value)
                .length
            const totalPermissions = Object.keys(permissions).length
            
            return (
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                        {activePermissions}/{totalPermissions}
                    </Badge>
                    <div className="text-sm text-muted-foreground">
                        permissions active
                    </div>
                </div>
            )
        },
    },
    {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }) => {
            const date = new Date(row.getValue("createdAt"))
            return (
                <div className="text-sm">
                    <div>{format(date, "MMM dd, yyyy")}</div>
                    <div className="text-muted-foreground">{format(date, "HH:mm")}</div>
                </div>
            )
        },
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
            const role = row.original
            
            return (
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(role)}
                        className="h-8"
                    >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete(role)}
                        className="h-8 text-destructive hover:text-destructive"
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                    </Button>
                </div>
            )
        },
    },
]