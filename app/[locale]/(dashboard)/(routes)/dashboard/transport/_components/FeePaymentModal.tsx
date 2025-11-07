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
import { addFeePayment } from "@/lib/actions/transport-fee.actions"

const formSchema = z.object({
    amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
})

interface FeePaymentModalProps {
    open: boolean
    onClose: () => void
    member: any
    fee: any
    onSuccess: () => void
}

export function FeePaymentModal({ open, onClose, member, fee, onSuccess }: FeePaymentModalProps) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            amount: 0,
        },
    })

    const { isSubmitting } = form.formState

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!member || !fee) return

        try {
            await addFeePayment(member._id, fee._id, values.amount)

            toast.success(`Payment of ₵${values.amount} recorded successfully`)
            form.reset()
            onClose()
            onSuccess()
        } catch (error: any) {
            toast.error(error.message || "Failed to record payment")
        }
    }

    if (!member || !fee) return null

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle>Add Payment</DialogTitle>
                    <DialogDescription>
                        Record payment for {member.fullName} - {fee.name}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="bg-muted p-4 rounded-lg space-y-2">
                        <div className="flex justify-between">
                            <span className="text-sm">Fee Amount:</span>
                            <span className="font-medium">₵{fee.amount}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm">Already Paid:</span>
                            <span className="font-medium">₵{member.amountPaid}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm">Remaining Balance:</span>
                            <span className="font-medium text-red-600">₵{member.balance}</span>
                        </div>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Payment Amount (₵)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                placeholder="0.00"
                                                max={member.balance}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                        <p className="text-xs text-muted-foreground">
                                            Maximum: ₵{member.balance}
                                        </p>
                                    </FormItem>
                                )}
                            />

                            <div className="flex gap-2 pt-4">
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
                                    {isSubmitting ? "Recording..." : "Record Payment"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    )
}