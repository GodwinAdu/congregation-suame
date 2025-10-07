"use client"

import React from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { createTransportFee, updateTransportFee } from "@/lib/actions/transport-fee.actions"

const formSchema = z.object({
    name: z.string().min(1, "Fee name is required"),
    description: z.string().optional(),
    amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
    dueDate: z.string().optional(),
})

interface CreateFeeModalProps {
    open: boolean
    onClose: () => void
    onSuccess: () => void
    editFee?: any
    mode?: "create" | "edit"
}

export function CreateFeeModal({ open, onClose, onSuccess, editFee, mode = "create" }: CreateFeeModalProps) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            description: "",
            amount: 0,
            dueDate: "",
        },
    })

    React.useEffect(() => {
        if (editFee && mode === "edit") {
            form.reset({
                name: editFee.name,
                description: editFee.description || "",
                amount: editFee.amount,
                dueDate: editFee.dueDate ? editFee.dueDate.split('T')[0] : "",
            })
        } else if (mode === "create") {
            form.reset({
                name: "",
                description: "",
                amount: 0,
                dueDate: "",
            })
        }
    }, [editFee, mode, form])

    const { isSubmitting } = form.formState

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            if (mode === "edit" && editFee) {
                await updateTransportFee(editFee._id, {
                    name: values.name,
                    description: values.description,
                    amount: values.amount,
                    dueDate: values.dueDate ? new Date(values.dueDate) : undefined,
                })
                toast.success("Transport fee updated successfully")
            } else {
                await createTransportFee({
                    name: values.name,
                    description: values.description,
                    amount: values.amount,
                    dueDate: values.dueDate ? new Date(values.dueDate) : undefined,
                })
                toast.success("Transport fee created successfully")
            }

            form.reset()
            onClose()
            onSuccess()
        } catch (error: any) {
            toast.error(error.message || `Failed to ${mode} transport fee`)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{mode === "edit" ? "Edit" : "Create"} Transport Fee</DialogTitle>
                    <DialogDescription>
                        {mode === "edit" ? "Edit the" : "Create a new"} transport fee that will be applied to all members.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Fee Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="e.g., Convention Fees, Execution Fees"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Additional details about this fee..."
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Amount (₵)</FormLabel>
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

                        <FormField
                            control={form.control}
                            name="dueDate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Due Date (Optional)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="date"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
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
                                {isSubmitting ? (mode === "edit" ? "Updating..." : "Creating...") : (mode === "edit" ? "Update Fee" : "Create Fee")}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}