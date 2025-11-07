"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { setTransportAmount } from "@/lib/actions/transport.actions"
import { MemberTransport } from "./column"

const formSchema = z.object({
    totalAmount: z.coerce.number().min(0.01, "Total amount must be greater than 0"),
})

interface SetAmountModalProps {
    open: boolean
    onClose: () => void
    member: MemberTransport | null
    onSuccess: () => void
}

export function SetAmountModal({ open, onClose, member, onSuccess }: SetAmountModalProps) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            totalAmount: 0,
        },
    })

    const { isSubmitting } = form.formState

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!member) return

        try {
            await setTransportAmount(member._id, values.totalAmount)
            
            toast.success("Transport amount set successfully")
            form.reset()
            onClose()
            onSuccess()
        } catch (error: any) {
            toast.error(error.message || "Failed to set amount")
            console.error("Error setting amount:", error)
        }
    }

    if (!member) return null

    const currentPaid = member.transport.amount || 0
    const currentBalance = member.transport.balance || 0

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] w-[96%]">
                <DialogHeader>
                    <DialogTitle>Set Transport Amount</DialogTitle>
                    <DialogDescription>
                        Set the total transport amount for {member.fullName}
                    </DialogDescription>
                </DialogHeader>
                
                <div className="bg-muted/50 p-4 rounded-lg mb-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-muted-foreground">Already Paid:</span>
                            <p className="font-semibold text-green-600">₵{currentPaid}</p>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Current Balance:</span>
                            <p className="font-semibold text-red-600">₵{currentBalance}</p>
                        </div>
                    </div>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="totalAmount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Total Transport Amount</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="bg-blue-50 p-3 rounded-lg">
                            <p className="text-sm text-blue-800">
                                <strong>Note:</strong> This will recalculate the balance based on what has already been paid.
                                If the member has already paid more than this amount, they will be marked as fully paid.
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={onClose}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button 
                                disabled={isSubmitting} 
                                type="submit"
                                className="flex-1"
                            >
                                {isSubmitting ? "Setting..." : "Set Amount"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}