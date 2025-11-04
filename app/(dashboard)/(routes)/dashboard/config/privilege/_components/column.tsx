"use client"

import { ColumnDef } from "@tanstack/react-table"
import { CellAction } from "@/components/table/cell-action";
import { Edit, Trash2 } from "lucide-react";
import { deletePrivilege } from "@/lib/actions/privilege.actions";
import { toast } from "sonner";
import { PrivilegeModal } from "./PrivilegeModal";

const handleDelete = async (id: string): Promise<void> => {
    try {
        await deletePrivilege(id)
        toast.success("Privilege deleted successfully")
        window.location.reload()
    } catch (error) {
        console.error("Delete error:", error)
        toast.error("Failed to delete privilege")
        throw error
    }
}

export const columns: ColumnDef<any>[] = [
    {
        accessorKey: "name",
        header: "Privilege Name",
    },
    {
        accessorKey: "createdBy",
        header: "Created By",
    },
    {
        id: "actions",
        cell: ({ row }) =>
            <CellAction
                data={row.original}
                onDelete={handleDelete}
                actions={[
                    {
                        label: "Edit",
                        type: "custom",
                        icon: <Edit className="h-4 w-4" />,
                        customComponent: <PrivilegeModal privilege={row.original} />
                    },
                    {
                        label: "Delete",
                        type: "delete",
                        icon: <Trash2 className="h-4 w-4" />,
                    },
                ]}
            />
    },
];
