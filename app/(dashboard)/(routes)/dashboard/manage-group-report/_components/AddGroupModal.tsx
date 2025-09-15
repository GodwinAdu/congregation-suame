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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { createFieldServiceReport } from "@/lib/actions/field-service.actions"

const formSchema = z.object({
    hours: z.coerce.number().min(0, "Hours must be 0 or greater").optional(),
    bibleStudents: z.coerce.number().min(0, "Bible students must be 0 or greater"),
    comments: z.string().optional(),
    check: z.boolean().optional(),
})

interface AddReportModalProps {
    open: boolean
    onClose: () => void
    member: any
    selectedMonth: string
    onSuccess: () => void
}

export function AddGroupModal({ open, onClose, member, selectedMonth, onSuccess }: AddReportModalProps) {
    const isPioneer = member?.privileges?.some((privilege: any) =>
        privilege.name === "Regular Pioneer" || privilege.name === "Auxiliary Pioneer"
    )

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            hours: 0,
            bibleStudents: 0,
            comments: "",
            check: false,
        },
    })

    const { isSubmitting } = form.formState

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            await createFieldServiceReport({
                publisher: member?._id,
                month: selectedMonth,
                hours: values.hours || 0,
                bibleStudents: values.bibleStudents,
                comments: values.comments,
                check: values.check || false,
            })

            toast.success("Field service report added successfully")
            form.reset()
            onClose()
            onSuccess()
        } catch (error: any) {
            toast.error(error.message || "Failed to add report")
            console.error("Error adding report:", error)
        }
    }

    const getMonthName = (monthStr: string) => {
        const [year, month] = monthStr.split('-')
        return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric'
        })
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] w-[96%]">
                <DialogHeader>
                    <DialogTitle>Add Field Service Report</DialogTitle>
                    <DialogDescription>
                        Add a field service report for {member?.fullName} - {getMonthName(selectedMonth)}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">


                            <div className={`grid ${isPioneer ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
                                {isPioneer && (
                                    <FormField
                                        control={form.control}
                                        name="hours"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Hours</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        placeholder="0"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}

                                <FormField
                                    control={form.control}
                                    name="bibleStudents"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Bible Students</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="0"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="comments"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Comments (Optional)</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Any additional comments..."
                                                className="resize-none"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="check"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>
                                                Mark as approved
                                            </FormLabel>
                                        </div>
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
                                    {isSubmitting ? "Adding..." : "Add Report"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    )
}