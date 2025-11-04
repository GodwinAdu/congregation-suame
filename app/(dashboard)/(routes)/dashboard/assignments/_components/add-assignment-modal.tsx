"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { createAssignment } from "@/lib/actions/assignment.actions"
import { getEligibleMembersForAssignment } from "@/lib/actions/member-duties.actions"

const formSchema = z.object({
    meetingType: z.enum(["Midweek", "Weekend"]),
    assignmentType: z.enum(["Watchtower Reader", "Bible Student Reader", "Life and Ministry", "Public Talk Speaker"]),
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    duration: z.coerce.number().min(1, "Duration must be at least 1 minute"),
    source: z.string().optional(),
    assignedTo: z.string().optional(),
    assistant: z.string().optional()
})

interface AddAssignmentModalProps {
    open: boolean
    onClose: () => void
    week: string
    members: Array<{ _id: string; fullName: string }>
    onSuccess: () => void
}

interface EligibleMember {
    _id: string
    fullName: string
    role: string
    gender: string
}

export function AddAssignmentModal({ open, onClose, week, members, onSuccess }: AddAssignmentModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [eligibleMembers, setEligibleMembers] = useState<EligibleMember[]>([])
    const [eligibleAssistants, setEligibleAssistants] = useState<EligibleMember[]>([])

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            meetingType: "Midweek",
            assignmentType: "Life and Ministry",
            title: "",
            description: "",
            duration: 0,
            source: "",
            assignedTo: "",
            assistant: ""
        }
    })

    const assignmentType = form.watch("assignmentType")

    // Fetch eligible members when assignment type changes
    useEffect(() => {
        const fetchEligibleMembers = async () => {
            if (!assignmentType) return
            
            try {
                const result = await getEligibleMembersForAssignment(assignmentType)
                if (result.success) {
                    setEligibleMembers(result.members)
                    
                    // For Life and Ministry, also get eligible assistants
                    if (assignmentType === "Life and Ministry") {
                        // Assistants can be any publisher
                        setEligibleAssistants(members.filter(m => 
                            result.members.some(em => em._id === m._id) || 
                            members.includes(m)
                        ))
                    }
                }
            } catch (error) {
                console.error('Error fetching eligible members:', error)
                setEligibleMembers([])
                setEligibleAssistants([])
            }
        }

        fetchEligibleMembers()
    }, [assignmentType, members])

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            setIsSubmitting(true)
            
            await createAssignment({
                week,
                meetingType: values.meetingType,
                assignmentType: values.assignmentType,
                title: values.title,
                description: values.description,
                duration: values.duration,
                source: values.source,
                assignedTo: values.assignedTo || undefined,
                assistant: values.assistant || undefined
            })

            toast.success("Assignment created successfully")
            form.reset()
            onClose()
            onSuccess()
        } catch (error: any) {
            toast.error(error.message || "Failed to create assignment")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add Assignment</DialogTitle>
                </DialogHeader>
                
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="meetingType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Meeting Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Midweek">Midweek</SelectItem>
                                                <SelectItem value="Weekend">Weekend</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="assignmentType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Assignment Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Life and Ministry">Life and Ministry</SelectItem>
                                                <SelectItem value="Bible Student Reader">Bible Student Reader</SelectItem>
                                                <SelectItem value="Watchtower Reader">Watchtower Reader</SelectItem>
                                                <SelectItem value="Public Talk Speaker">Public Talk Speaker</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Assignment title" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="duration"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Duration (minutes)</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="0" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="source"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Source (optional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Scripture or publication" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description (optional)</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Assignment details" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="assignedTo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Assigned To (optional)</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select member" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {eligibleMembers.length > 0 ? (
                                                    eligibleMembers.map((member) => (
                                                        <SelectItem key={member._id} value={member._id}>
                                                            {member.fullName} ({member.role})
                                                        </SelectItem>
                                                    ))
                                                ) : (
                                                    <SelectItem value="no-members" disabled>
                                                        No eligible members found
                                                    </SelectItem>
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {assignmentType === "Life and Ministry" && (
                                <FormField
                                    control={form.control}
                                    name="assistant"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Assistant (optional)</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select assistant" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {eligibleAssistants.length > 0 ? (
                                                        eligibleAssistants.map((member) => (
                                                            <SelectItem key={member._id} value={member._id}>
                                                                {member.fullName}
                                                            </SelectItem>
                                                        ))
                                                    ) : (
                                                        members.map((member) => (
                                                            <SelectItem key={member._id} value={member._id}>
                                                                {member.fullName}
                                                            </SelectItem>
                                                        ))
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                        </div>

                        <div className="flex gap-2 pt-4">
                            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting} className="flex-1">
                                {isSubmitting ? "Creating..." : "Create Assignment"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}