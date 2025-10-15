"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Loader2, Megaphone } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"
import { createAnnouncement } from "@/lib/actions/communication.actions"

interface Member {
    _id: string
    fullName: string
}

interface CreateAnnouncementModalProps {
    open: boolean
    onClose: () => void
    members: Member[]
    onSuccess: (announcement: any) => void
}

export function CreateAnnouncementModal({ open, onClose, members, onSuccess }: CreateAnnouncementModalProps) {
    const [formData, setFormData] = useState({
        title: "",
        content: "",
        targetAudience: {
            type: "all" as "all" | "elders" | "servants" | "publishers" | "group",
            groups: [] as string[],
            roles: [] as string[]
        },
        priority: "medium" as "low" | "medium" | "high" | "urgent",
        expiresAt: undefined as Date | undefined
    })
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.title || !formData.content) {
            toast.error("Please fill in all required fields")
            return
        }

        setLoading(true)
        try {
            const announcement = await createAnnouncement(formData)
            toast.success("Announcement created successfully")
            onSuccess(announcement)
            setFormData({
                title: "",
                content: "",
                targetAudience: { type: "all", groups: [], roles: [] },
                priority: "medium",
                expiresAt: undefined
            })
        } catch (error) {
            toast.error("Failed to create announcement")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Megaphone className="h-5 w-5" />
                        Create Announcement
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium">Title</label>
                        <Input
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="Enter announcement title"
                            required
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium">Content</label>
                        <Textarea
                            value={formData.content}
                            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                            placeholder="Enter announcement content"
                            rows={4}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium">Target Audience</label>
                            <Select 
                                value={formData.targetAudience.type} 
                                onValueChange={(value: any) => setFormData(prev => ({ 
                                    ...prev, 
                                    targetAudience: { ...prev.targetAudience, type: value }
                                }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Members</SelectItem>
                                    <SelectItem value="elders">Elders</SelectItem>
                                    <SelectItem value="servants">Ministerial Servants</SelectItem>
                                    <SelectItem value="publishers">Publishers</SelectItem>
                                    <SelectItem value="group">Specific Groups</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="text-sm font-medium">Priority</label>
                            <Select 
                                value={formData.priority} 
                                onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="urgent">Urgent</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium">Expiration Date (Optional)</label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-start text-left font-normal">
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {formData.expiresAt ? format(formData.expiresAt, "PPP") : "Select expiration date"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={formData.expiresAt}
                                    onSelect={(date) => setFormData(prev => ({ ...prev, expiresAt: date }))}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Megaphone className="h-4 w-4" />}
                            Create Announcement
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}