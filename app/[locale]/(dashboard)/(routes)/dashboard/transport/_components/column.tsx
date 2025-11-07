"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { DollarSign, Settings, Car } from "lucide-react"
import { updateMemberTransportStatus } from "@/lib/actions/transport.actions"
import { toast } from "sonner"

export type MemberTransport = {
    _id: string
    fullName: string
    transport: {
        carStatus: boolean
        payed: boolean
        amount: number
        balance: number
        cardNumber: number
    }
}

interface ColumnsProps {
    onAddPayment: (member: MemberTransport) => void
    onRefresh: () => void
}

export const createColumns = ({ onAddPayment, onRefresh }: ColumnsProps): ColumnDef<MemberTransport>[] => [
    {
        accessorKey: "fullName",
        header: "Member Name",
        cell: ({ row }) => {
            return <div className="font-medium">{row.getValue("fullName")}</div>
        },
    },
    {
        accessorKey: "transport.cardNumber",
        header: "Card #",
        cell: ({ row }) => {
            const member = row.original
            const cardNumber = member.transport.cardNumber
            const carStatus = member.transport.carStatus
            
            if (!carStatus || !cardNumber) {
                return <div className="text-muted-foreground">-</div>
            }
            
            return <div className="font-semibold text-blue-600">#{cardNumber}</div>
        },
    },
    {
        accessorKey: "transport.carStatus",
        header: "Participation",
        cell: ({ row }) => {
            const member = row.original
            const carStatus = member.transport.carStatus

            const handleToggle = async (checked: boolean) => {
                try {
                    await updateMemberTransportStatus(member._id, checked)
                    toast.success(`${member.fullName} ${checked ? 'joined' : 'left'} transport`)
                    onRefresh()
                } catch (error) {
                    toast.error("Failed to update status")
                    console.error(error)
                }
            }

            return (
                <div className="flex items-center space-x-2">
                    <Switch
                        checked={carStatus}
                        onCheckedChange={handleToggle}
                    />
                    <Badge
                        variant={carStatus ? "default" : "secondary"}
                        className={
                            carStatus
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                        }
                    >
                        {carStatus ? "Yes" : "No"}
                    </Badge>
                </div>
            )
        },
    },
    {
        accessorKey: "transport.amount",
        header: "Amount Paid",
        cell: ({ row }) => {
            const amount = row.getValue("transport.amount") as number
            return <div className="font-semibold">₵{amount || 0}</div>
        },
    },
    {
        accessorKey: "transport.balance",
        header: "Balance",
        cell: ({ row }) => {
            const balance = row.getValue("transport.balance") as number
            return (
                <div className={`font-semibold ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    ₵{balance || 0}
                </div>
            )
        },
    },
    {
        accessorKey: "transport.payed",
        header: "Payment Status",
        cell: ({ row }) => {
            const payed = row.getValue("transport.payed") as boolean
            const carStatus = row.original.transport.carStatus
            
            if (!carStatus) {
                return <Badge variant="secondary">Not Participating</Badge>
            }
            
            return (
                <Badge
                    variant={payed ? "default" : "destructive"}
                    className={
                        payed
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                    }
                >
                    {payed ? "Fully Paid" : "Pending"}
                </Badge>
            )
        },
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
            const member = row.original
            const carStatus = member.transport.carStatus
            const isPaid = member.transport.payed
            
            if (!carStatus) {
                return <div className="text-muted-foreground text-sm">No actions available</div>
            }
            
            if (isPaid) {
                return <div className="text-green-600 text-sm font-medium">Fully Paid</div>
            }
            
            return (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onAddPayment(member)}
                    className="h-8"
                >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Add Payment
                </Button>
            )
        },
    },
]