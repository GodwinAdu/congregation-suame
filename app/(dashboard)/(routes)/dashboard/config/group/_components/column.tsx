"use client"

import { ColumnDef } from "@tanstack/react-table"
import { CellAction } from "@/components/table/cell-action";
import { Edit, Trash2 } from "lucide-react";



const handleDelete = async (id: string): Promise<void> => {
    try {
        // await deleteBuilding(id)
        console.log("Item deleted successfully")
    } catch (error) {
        console.error("Delete error:", error)
        throw error // Re-throw to let CellAction handle the error
    }
}


export const columns: ColumnDef<any>[] = [
    {
        accessorKey: "name",
        header: "Group Name",
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
                        type: "edit",
                        href: `/dashboard/config/group/${row.original._id}`,
                        icon: <Edit className="h-4 w-4" />,
                        // permissionKey: "editBuilding",
                    },
                    {
                        label: "Delete",
                        type: "delete",
                        icon: <Trash2 className="h-4 w-4" />,
                        // permissionKey: "deleteBuilding",
                    },
                ]}
            />
    },
];
