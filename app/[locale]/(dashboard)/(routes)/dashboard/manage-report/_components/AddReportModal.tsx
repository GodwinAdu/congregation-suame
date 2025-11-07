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
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { createFieldServiceReport, updateFieldServiceReport, fetchReportById } from "@/lib/actions/field-service.actions"

const formSchema = z.object({
    hours: z.coerce.number().min(0, "Hours must be 0 or greater").optional(),
    bibleStudents: z.coerce.number().min(0, "Bible students must be 0 or greater"),
    auxiliaryPioneer: z.boolean(),
    comments: z.string().optional(),
    check: z.boolean().optional(),
})

interface AddReportModalProps {
    open: boolean
    onClose: () => void
    member: any
    selectedMonth: string
    onSuccess: () => void
    editMode?: boolean
    reportId?: string | null
}

export function AddReportModal({ open, onClose, member, selectedMonth, onSuccess, editMode = false, reportId }: AddReportModalProps) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            hours: 0,
            bibleStudents: 0,
            auxiliaryPioneer: false,
            comments: "",
            check: false,
        },
    })

    // Load existing report data when in edit mode
    React.useEffect(() => {
        if (editMode && reportId && open) {
            const loadReport = async () => {
                try {
                    const report = await fetchReportById(reportId)
                    form.reset({
                        hours: report.hours || 0,
                        bibleStudents: report.bibleStudents || 0,
                        auxiliaryPioneer: report.auxiliaryPioneer || false,
                        comments: report.comments || "",
                        check: report.check || false,
                    })
                } catch (error) {
                    toast.error("Failed to load report data")
                }
            }
            loadReport()
        } else if (!editMode) {
            form.reset({
                hours: 0,
                bibleStudents: 0,
                auxiliaryPioneer: false,
                comments: "",
                check: false,
            })
        }
    }, [editMode, reportId, open, form])

    const { isSubmitting } = form.formState
    const isAuxiliaryPioneer = form.watch("auxiliaryPioneer")
    const isPioneer = member?.privileges?.some((privilege: any) =>
        privilege.name === "Regular Pioneer"
    )

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            if (editMode && reportId) {
                await updateFieldServiceReport(reportId, {
                    hours: values.hours || 0,
                    bibleStudents: values.bibleStudents,
                    auxiliaryPioneer: values.auxiliaryPioneer || false,
                    comments: values.comments,
                    check: values.check || false,
                })
                toast.success("Field service report updated successfully")
            } else {
                await createFieldServiceReport({
                    publisher: member?._id,
                    month: selectedMonth,
                    hours: values.hours || 0,
                    bibleStudents: values.bibleStudents,
                    auxiliaryPioneer: values.auxiliaryPioneer || false,
                    comments: values.comments,
                    check: values.check || false,
                })
                toast.success("Field service report added successfully")
            }
            
            form.reset()
            onClose()
            onSuccess()
        } catch (error: any) {
            toast.error(error.message || `Failed to ${editMode ? 'update' : 'add'} report`)
            console.error(`Error ${editMode ? 'updating' : 'adding'} report:`, error)
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
                    <DialogTitle>{editMode ? 'Edit' : 'Add'} Field Service Report</DialogTitle>
                    <DialogDescription>
                        {editMode ? 'Edit' : 'Add'} a field service report for {member?.fullName} - {getMonthName(selectedMonth)}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">


                            <div className={`grid ${isPioneer || isAuxiliaryPioneer ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
                                {(isPioneer || isAuxiliaryPioneer) && (
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
                                name="auxiliaryPioneer"
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
                                                Auxiliary Pioneer this month
                                            </FormLabel>
                                        </div>
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
                                                Check
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
                                    {isSubmitting ? (editMode ? "Updating..." : "Adding...") : (editMode ? "Update Report" : "Add Report")}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    )
}