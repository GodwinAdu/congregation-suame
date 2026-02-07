"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { createShepherdingCall, updateShepherdingCall } from "@/lib/actions/shepherding.actions"
import { useEffect, useState } from "react"

const formSchema = z.object({
    memberId: z.string().min(1, "Member is required"),
    shepherds: z.array(z.string()).min(1, "At least one shepherd is required"),
    visitDate: z.string().min(1, "Visit date is required"),
    visitType: z.string().min(1, "Visit type is required"),
    location: z.string().min(1, "Location is required"),
    duration: z.string().optional(),
    notes: z.string().optional(),
    scriptures: z.string().optional(),
    concerns: z.string().optional(),
    actionItems: z.string().optional(),
    followUpNeeded: z.boolean().default(false),
    followUpDate: z.string().optional(),
    followUpNotes: z.string().optional(),
    status: z.string().min(1, "Status is required"),
    outcome: z.string().optional(),
    isConfidential: z.boolean().default(false)
})

interface ShepherdingCallModalProps {
    open: boolean
    onClose: () => void
    call: any
    members: any[]
    shepherds: any[]
    onSuccess: () => void
}

export function ShepherdingCallModal({ open, onClose, call, members, shepherds, onSuccess }: ShepherdingCallModalProps) {
    const [memberOpen, setMemberOpen] = useState(false)
    
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            memberId: "",
            shepherds: [],
            visitDate: new Date().toISOString().slice(0, 10),
            visitType: "routine",
            location: "home",
            duration: "",
            notes: "",
            scriptures: "",
            concerns: "",
            actionItems: "",
            followUpNeeded: false,
            followUpDate: "",
            followUpNotes: "",
            status: "scheduled",
            outcome: "",
            isConfidential: false
        }
    })

    useEffect(() => {
        if (call) {
            form.reset({
                memberId: call.memberId?._id || call.memberId || "",
                shepherds: call.shepherds ? call.shepherds.map((s: any) => s._id || s) : [],
                visitDate: call.visitDate ? new Date(call.visitDate).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
                visitType: call.visitType || "routine",
                location: call.location || "home",
                duration: call.duration?.toString() || "",
                notes: call.notes || "",
                scriptures: call.scriptures?.join(", ") || "",
                concerns: call.concerns?.join(", ") || "",
                actionItems: call.actionItems?.join(", ") || "",
                followUpNeeded: call.followUpNeeded || false,
                followUpDate: call.followUpDate ? new Date(call.followUpDate).toISOString().slice(0, 10) : "",
                followUpNotes: call.followUpNotes || "",
                status: call.status || "scheduled",
                outcome: call.outcome || "",
                isConfidential: call.isConfidential || false
            })
        } else {
            form.reset()
        }
    }, [call, form])

    const { isSubmitting } = form.formState

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            const data = {
                ...values,
                duration: values.duration ? parseInt(values.duration) : undefined,
                scriptures: values.scriptures ? values.scriptures.split(",").map(s => s.trim()).filter(Boolean) : [],
                concerns: values.concerns ? values.concerns.split(",").map(s => s.trim()).filter(Boolean) : [],
                actionItems: values.actionItems ? values.actionItems.split(",").map(s => s.trim()).filter(Boolean) : []
            }

            if (call?._id) {
                await updateShepherdingCall(call._id, data)
                toast.success("Shepherding call updated successfully")
            } else {
                await createShepherdingCall(data)
                toast.success("Shepherding call created successfully")
            }

            form.reset()
            onClose()
            onSuccess()
        } catch (error: any) {
            toast.error(error.message || "Failed to save shepherding call")
        }
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{call ? "Edit Shepherding Call" : "New Shepherding Call"}</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="memberId"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Member</FormLabel>
                                    <Popover open={memberOpen} onOpenChange={setMemberOpen}>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    className={cn(
                                                        "w-full justify-between",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value
                                                        ? members.find((member) => (member._id || member.id) === field.value)?.fullName ||
                                                          members.find((member) => (member._id || member.id) === field.value)?.firstName + ' ' +
                                                          members.find((member) => (member._id || member.id) === field.value)?.lastName
                                                        : "Select member"}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-full p-0">
                                            <Command>
                                                <CommandInput placeholder="Search member..." />
                                                <CommandList>
                                                    <CommandEmpty>No member found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {members && members.length > 0 ? (
                                                            members.map((member) => {
                                                                const memberId = member._id || member.id;
                                                                const memberName = member.fullName || member.firstName + ' ' + member.lastName;
                                                                return (
                                                                    <CommandItem
                                                                        key={memberId}
                                                                        value={memberName}
                                                                        onSelect={() => {
                                                                            field.onChange(memberId)
                                                                            setMemberOpen(false)
                                                                        }}
                                                                    >
                                                                        <Check
                                                                            className={cn(
                                                                                "mr-2 h-4 w-4",
                                                                                field.value === memberId ? "opacity-100" : "opacity-0"
                                                                            )}
                                                                        />
                                                                        {memberName}
                                                                    </CommandItem>
                                                                )
                                                            })
                                                        ) : (
                                                            <CommandItem disabled>No members available</CommandItem>
                                                        )}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="shepherds"
                            render={() => (
                                <FormItem>
                                    <FormLabel>Shepherds</FormLabel>
                                    <div className="grid grid-cols-2 gap-2">
                                        {shepherds && shepherds.length > 0 ? (
                                            shepherds.map(shepherd => (
                                                <FormField
                                                    key={shepherd._id || shepherd.id}
                                                    control={form.control}
                                                    name="shepherds"
                                                    render={({ field }) => (
                                                        <FormItem className="flex items-center space-x-2 space-y-0">
                                                            <FormControl>
                                                                <Checkbox
                                                                    checked={field.value?.includes(shepherd._id || shepherd.id)}
                                                                    onCheckedChange={(checked) => {
                                                                        const shepherdId = shepherd._id || shepherd.id;
                                                                        return checked
                                                                            ? field.onChange([...field.value, shepherdId])
                                                                            : field.onChange(field.value?.filter(id => id !== shepherdId))
                                                                    }}
                                                                />
                                                            </FormControl>
                                                            <FormLabel className="text-sm font-normal">{shepherd.fullName || shepherd.firstName + ' ' + shepherd.lastName}</FormLabel>
                                                        </FormItem>
                                                    )}
                                                />
                                            ))
                                        ) : (
                                            <p className="text-sm text-muted-foreground col-span-2">No shepherds available</p>
                                        )}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="visitDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Visit Date</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="duration"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Duration (minutes)</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="60" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="visitType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Visit Type</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="routine">Routine</SelectItem>
                                                <SelectItem value="encouragement">Encouragement</SelectItem>
                                                <SelectItem value="counsel">Counsel</SelectItem>
                                                <SelectItem value="illness">Illness</SelectItem>
                                                <SelectItem value="family_issue">Family Issue</SelectItem>
                                                <SelectItem value="spiritual_concern">Spiritual Concern</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="location"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Location</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="home">Home</SelectItem>
                                                <SelectItem value="kingdom_hall">Kingdom Hall</SelectItem>
                                                <SelectItem value="phone">Phone</SelectItem>
                                                <SelectItem value="video_call">Video Call</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="scheduled">Scheduled</SelectItem>
                                                <SelectItem value="completed">Completed</SelectItem>
                                                <SelectItem value="cancelled">Cancelled</SelectItem>
                                                <SelectItem value="rescheduled">Rescheduled</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="outcome"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Outcome</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select outcome" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="positive">Positive</SelectItem>
                                                <SelectItem value="neutral">Neutral</SelectItem>
                                                <SelectItem value="needs_attention">Needs Attention</SelectItem>
                                                <SelectItem value="urgent">Urgent</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notes</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Visit notes..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="scriptures"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Scriptures (comma separated)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="John 3:16, Romans 8:28" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="concerns"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Concerns (comma separated)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Health, Family" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="actionItems"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Action Items (comma separated)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Follow up in 2 weeks, Provide literature" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="followUpNeeded"
                            render={({ field }) => (
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                    <FormControl>
                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                    <FormLabel>Follow-up Needed</FormLabel>
                                </FormItem>
                            )}
                        />

                        {form.watch("followUpNeeded") && (
                            <>
                                <FormField
                                    control={form.control}
                                    name="followUpDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Follow-up Date</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="followUpNotes"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Follow-up Notes</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Follow-up notes..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </>
                        )}

                        <FormField
                            control={form.control}
                            name="isConfidential"
                            render={({ field }) => (
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                    <FormControl>
                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                    <FormLabel>Confidential</FormLabel>
                                </FormItem>
                            )}
                        />

                        <div className="flex gap-2 pt-4">
                            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                                Cancel
                            </Button>
                            <Button disabled={isSubmitting} type="submit" className="flex-1">
                                {isSubmitting ? "Saving..." : "Save"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
