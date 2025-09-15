"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    Edit,
    Trash2,
    Eye,
    UserX,
    UserCheck,
    Key,
    Mail,
    Shield,
    Clock,
    MapPin
} from "lucide-react";
import { CellAction } from "@/components/table/cell-action";
import { MemberDetailsModal } from "@/components/table/MemberDetailsModal";
import { toast } from "sonner";




const handleDelete = async (id: string): Promise<void> => {
    try {
        // await deleteStaff(id)
    } catch (error) {
        console.error("Delete error:", error)
        throw error
    }
}



const handleResetPassword = async (staff: any) => {
    try {
        // const result = await resetUserPassword(staff._id)
        // if (result.success) {
        //     toast.success(`Password reset email sent to ${staff.email}`)
        // }
    } catch (error) {
        toast.error("Failed to send password reset")
    }
}

const handleSendInvite = async (staff: any) => {
    try {
        // const result = await sendInviteEmail(staff._id)
        // if (result.success) {
        //     toast.success(`Invitation sent to ${staff.email}`)
        // }
    } catch (error) {
        toast.error("Failed to send invitation")
    }
}

const handleViewActivity = (staff: any) => {
    window.open(`/dashboard/hr/staffs/${staff._id}/activity`, '_blank')
}


export const columns: ColumnDef<any>[] = [
    {
        accessorKey: "fullName",
        header: "Staff Member",
        cell: ({ row }) => {
            const name = row.original.fullName;
            const role = row.original.role || "Staff";
            const status = row.original.status || "active";
            return (
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={row.original.avatar} alt={name} />
                        <AvatarFallback className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold">
                            {name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-medium text-slate-900">{name}</p>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">{role}</Badge>
                            <Badge
                                variant={status === 'active' ? 'default' : 'secondary'}
                                className={`text-xs ${status === 'active'
                                    ? 'bg-green-100 text-green-700 border-green-200'
                                    : 'bg-red-100 text-red-700 border-red-200'
                                    }`}
                            >
                                {status}
                            </Badge>
                        </div>
                    </div>
                </div>
            );
        }
    },
    {
        accessorKey: "phone",
        header: "Contact Info",
        cell: ({ row }) => {
            const email = row.original.email;
            const phone = row.original.phone;
            return (
                <div className="space-y-1">
                    <p className="text-sm font-medium">{email}</p>
                    <p className="text-xs text-slate-500">{phone}</p>
                </div>
            );
        }
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
            const staff = row.original
            return (
                <CellAction
                    data={staff}
                    onDelete={handleDelete}
                    actions={[
                        {
                            label: "View Details",
                            type: "custom",
                            onClick: () => {},
                            icon: <Eye className="h-4 w-4" />,
                            customComponent: <MemberDetailsModal member={staff} />
                        },
                        {
                            label: "Edit Profile",
                            type: "edit",
                            href: `/dashboard/hr/staffs/${staff._id}/edit`,
                            icon: <Edit className="h-4 w-4" />,
                        },
                        {
                            label: "Delete Staff",
                            type: "delete",
                            icon: <Trash2 className="h-4 w-4" />,
                        },
                    ]}
                />
            )
        }
    },
];
