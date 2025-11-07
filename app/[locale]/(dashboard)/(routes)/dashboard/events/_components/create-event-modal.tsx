"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { createEvent } from "@/lib/actions/event.actions"

interface CreateEventModalProps {
    open: boolean
    onClose: () => void
    onSuccess: (event: any) => void
}

export function CreateEventModal({ open, onClose, onSuccess }: CreateEventModalProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        type: "meeting" as 'meeting' | 'assembly' | 'convention' | 'memorial' | 'co-visit' | 'special-talk' | 'other',
        startDate: "",
        endDate: "",
        location: "",
        maxAttendees: "",
        registrationRequired: false,
        registrationDeadline: ""
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!formData.title.trim() || !formData.startDate) {
            toast.error("Title and start date are required")
            return
        }

        setIsLoading(true)
        try {
            const eventData = {
                title: formData.title,
                description: formData.description || undefined,
                type: formData.type,
                startDate: new Date(formData.startDate),
                endDate: formData.endDate ? new Date(formData.endDate) : undefined,
                location: formData.location || undefined,
                maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : undefined,
                registrationRequired: formData.registrationRequired,
                registrationDeadline: formData.registrationDeadline ? new Date(formData.registrationDeadline) : undefined
            }

            const event = await createEvent(eventData)
            onSuccess(event)
            toast.success("Event created successfully")
            
            // Reset form
            setFormData({
                title: "",
                description: "",
                type: "meeting",
                startDate: "",
                endDate: "",
                location: "",
                maxAttendees: "",
                registrationRequired: false,
                registrationDeadline: ""
            })
        } catch (error: any) {
            toast.error(error.message || "Failed to create event")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Event</DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Event Title *</Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="e.g., Circuit Assembly"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Event description..."
                            rows={3}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Event Type</Label>
                        <Select 
                            value={formData.type} 
                            onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="meeting">Meeting</SelectItem>
                                <SelectItem value="assembly">Assembly</SelectItem>
                                <SelectItem value="convention">Convention</SelectItem>
                                <SelectItem value="memorial">Memorial</SelectItem>
                                <SelectItem value="co-visit">CO Visit</SelectItem>
                                <SelectItem value="special-talk">Special Talk</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="startDate">Start Date *</Label>
                            <Input
                                id="startDate"
                                type="datetime-local"
                                value={formData.startDate}
                                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="endDate">End Date</Label>
                            <Input
                                id="endDate"
                                type="datetime-local"
                                value={formData.endDate}
                                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                            id="location"
                            value={formData.location}
                            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                            placeholder="e.g., Kingdom Hall, Assembly Hall"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="maxAttendees">Max Attendees</Label>
                        <Input
                            id="maxAttendees"
                            type="number"
                            value={formData.maxAttendees}
                            onChange={(e) => setFormData(prev => ({ ...prev, maxAttendees: e.target.value }))}
                            placeholder="Leave empty for unlimited"
                        />
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="registrationRequired"
                            checked={formData.registrationRequired}
                            onCheckedChange={(checked) => 
                                setFormData(prev => ({ ...prev, registrationRequired: checked as boolean }))
                            }
                        />
                        <Label htmlFor="registrationRequired">Registration Required</Label>
                    </div>

                    {formData.registrationRequired && (
                        <div className="space-y-2">
                            <Label htmlFor="registrationDeadline">Registration Deadline</Label>
                            <Input
                                id="registrationDeadline"
                                type="datetime-local"
                                value={formData.registrationDeadline}
                                onChange={(e) => setFormData(prev => ({ ...prev, registrationDeadline: e.target.value }))}
                            />
                        </div>
                    )}

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Creating..." : "Create Event"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}