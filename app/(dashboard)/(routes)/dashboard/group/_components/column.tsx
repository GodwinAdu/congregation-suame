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
import { deleteMember } from "@/lib/actions/user.actions";

const handleDelete = async (id: string): Promise<void> => {
    try {
        await deleteMember(id);
        toast.success("Member deleted successfully");
        window.location.reload();
    } catch (error) {
        console.error("Delete error:", error);
        toast.error("Failed to delete member");
        throw error;
    }
}

const handleResetPassword = async (member: any) => {
    try {
        if (!member.email) {
            toast.error("Member has no email address");
            return;
        }
        if (confirm(`Reset password for ${member.fullName}? A new temporary password will be generated.`)) {
            const tempPassword = Math.random().toString(36).slice(-8);
            toast.success(`Temporary password for ${member.fullName}: ${tempPassword}`);
            toast.info("Please share this password securely with the member");
        }
    } catch (error) {
        toast.error("Failed to reset password");
    }
}

const handleSendInvite = async (member: any) => {
    try {
        if (!member.email) {
            toast.error("Member has no email address");
            return;
        }
        if (confirm(`Send invitation to ${member.fullName} at ${member.email}?`)) {
            toast.success(`Invitation would be sent to ${member.email}`);
            toast.info("Email invitation feature will be implemented soon");
        }
    } catch (error) {
        toast.error("Failed to send invitation");
    }
}

const handleViewActivity = (member: any) => {
    window.open(`/dashboard/history?member=${member._id}`, '_blank');
}


export const columns: ColumnDef<any>[] = [
    {
        accessorKey: "fullName",
        header: "Group Member",
        cell: ({ row }) => {
            const name = row.original.fullName;
            const role = row.original.role || "Publisher";
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
            const member = row.original
            return (
                <CellAction
                    data={member}
                    onDelete={handleDelete}
                    actions={[
                        {
                            label: "View Details",
                            type: "custom",
                            onClick: () => {},
                            icon: <Eye className="h-4 w-4" />,
                            customComponent: <MemberDetailsModal member={member} />
                        },
                        {
                            label: "Edit Profile",
                            type: "edit",
                            href: `/dashboard/group/${member._id}/edit`,
                            icon: <Edit className="h-4 w-4" />,
                        },
                        {
                            label: "Reset Password",
                            type: "custom",
                            onClick: handleResetPassword,
                            icon: <Key className="h-4 w-4" />,
                        },
                        {
                            label: "Send Invite",
                            type: "custom",
                            onClick: handleSendInvite,
                            icon: <Mail className="h-4 w-4" />,
                        },
                        {
                            label: "View Activity",
                            type: "custom",
                            onClick: handleViewActivity,
                            icon: <Shield className="h-4 w-4" />,
                        },
                        {
                            label: "Delete Member",
                            type: "delete",
                            icon: <Trash2 className="h-4 w-4" />,
                        },
                    ]}
                />
            )
        }
    },
];
