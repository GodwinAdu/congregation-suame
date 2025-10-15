"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, Send, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { sendMessage } from "@/lib/actions/communication.actions"

interface Member {
    _id: string
    fullName: string
}

interface ComposeMessageModalProps {
    open: boolean
    onClose: () => void
    members: Member[]
    onSuccess: (message: any) => void
}

export function ComposeMessageModal({ open, onClose, members, onSuccess }: ComposeMessageModalProps) {
    const [formData, setFormData] = useState({
        to: [] as string[],
        subject: "",
        content: "",
        priority: "medium" as "low" | "medium" | "high" | "urgent"
    })
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.to.length || !formData.subject || !formData.content) {
            toast.error("Please fill in all required fields")
            return
        }

        setLoading(true)
        try {
            const message = await sendMessage({
                ...formData,
                type: "direct"
            })
            toast.success("Message sent successfully")
            onSuccess(message)
            setFormData({ to: [], subject: "", content: "", priority: "medium" })
        } catch (error) {
            toast.error("Failed to send message")
        } finally {
            setLoading(false)
        }
    }

    const addRecipient = (memberId: string) => {
        if (!formData.to.includes(memberId)) {
            setFormData(prev => ({ ...prev, to: [...prev.to, memberId] }))
        }
    }

    const removeRecipient = (memberId: string) => {
        setFormData(prev => ({ ...prev, to: prev.to.filter(id => id !== memberId) }))
    }

    const selectedMembers = members.filter(m => formData.to.includes(m._id))

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Compose Message</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium">To</label>
                        <Select onValueChange={addRecipient}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select recipients" />
                            </SelectTrigger>
                            <SelectContent>
                                {members.map(member => (
                                    <SelectItem key={member._id} value={member._id}>
                                        {member.fullName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        
                        {selectedMembers.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {selectedMembers.map(member => (
                                    <Badge key={member._id} variant="secondary" className="gap-1">
                                        {member.fullName}
                                        <X 
                                            className="h-3 w-3 cursor-pointer" 
                                            onClick={() => removeRecipient(member._id)}
                                        />
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="text-sm font-medium">Priority</label>
                        <Select value={formData.priority} onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}>
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

                    <div>
                        <label className="text-sm font-medium">Subject</label>
                        <Input
                            value={formData.subject}
                            onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                            placeholder="Enter subject"
                            required
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium">Message</label>
                        <Textarea
                            value={formData.content}
                            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                            placeholder="Enter your message"
                            rows={6}
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            Send Message
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}