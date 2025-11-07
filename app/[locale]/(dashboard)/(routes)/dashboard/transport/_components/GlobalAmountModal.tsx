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
import { setGlobalTransportAmount } from "@/lib/actions/transport.actions"
import { Car } from "lucide-react"

const formSchema = z.object({
    totalAmount: z.coerce.number().min(0.01, "Total amount must be greater than 0"),
})

interface GlobalAmountModalProps {
    open: boolean
    onClose: () => void
    participatingCount: number
    onSuccess: () => void
}

export function GlobalAmountModal({ open, onClose, participatingCount, onSuccess }: GlobalAmountModalProps) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            totalAmount: 0,
        },
    })

    const { isSubmitting } = form.formState

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            const result = await setGlobalTransportAmount(values.totalAmount)
            
            toast.success(`Transport amount set for ${result.updatedCount} participating members`)
            form.reset()
            onClose()
            onSuccess()
        } catch (error: any) {
            toast.error(error.message || "Failed to set global amount")
            console.error("Error setting global amount:", error)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] w-[96%]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Car className="w-5 h-5 text-primary" />
                        Set Global Transport Amount
                    </DialogTitle>
                    <DialogDescription>
                        Set the transport amount for all {participatingCount} participating members
                    </DialogDescription>
                </DialogHeader>
                
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                    <div className="text-sm text-blue-800">
                        <p className="font-semibold mb-2">This will:</p>
                        <ul className="list-disc list-inside space-y-1">
                            <li>Set the same transport amount for all participating members</li>
                            <li>Recalculate balances based on existing payments</li>
                            <li>Update payment status automatically</li>
                        </ul>
                    </div>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="totalAmount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Transport Amount (₵)</FormLabel>
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