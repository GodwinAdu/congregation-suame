"use client"

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { createFieldServiceMeeting, updateFieldServiceMeeting } from '@/lib/actions/field-service-meeting.actions'
import { fetchAllMembers } from '@/lib/actions/user.actions'
import { toast } from 'sonner'

interface Member {
    _id: string
    fullName: string
}

interface MeetingScheduleModalProps {
    open: boolean
    onClose: () => void
    onSuccess: () => void
    meeting?: {
        _id: string
        date: string
        startTime: string
        endTime: string
        location: string
        conductor: {
            memberId: string
            memberName: string
        }
        information?: string
    }
}

const MeetingScheduleModal = ({ open, onClose, onSuccess, meeting }: MeetingScheduleModalProps) => {
    const [loading, setLoading] = useState(false)
    const [members, setMembers] = useState<Member[]>([])
    const [formData, setFormData] = useState({
        date: new Date(),
        startTime: '',
        endTime: '',
        location: '',
        conductorId: '',
        information: ''
    })

    useEffect(() => {
        if (open) {
            fetchMembersList()
            if (meeting) {
                setFormData({
                    date: new Date(meeting.date),
                    startTime: meeting.startTime,
                    endTime: meeting.endTime,
                    location: meeting.location,
                    conductorId: meeting.conductor?.memberId || '',
                    information: meeting.information || ''
                })
            } else {
                setFormData({
                    date: new Date(),
                    startTime: '',
                    endTime: '',
                    location: '',
                    conductorId: '',
                    information: ''
                })
            }
        }
    }, [open, meeting])

    const fetchMembersList = async () => {
        try {
            const data = await fetchAllMembers()
            setMembers(data)
        } catch (error) {
            console.error('Error fetching members:', error)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.location || !formData.startTime || !formData.endTime) {
            toast.error('Please fill in all required fields')
            return
        }

        setLoading(true)
        try {
            const conductor = members.find(m => m._id === formData.conductorId)
            const meetingData = {
                ...formData,
                conductor: conductor ? {
                    memberId: conductor._id,
                    memberName: conductor.fullName
                } : undefined
            }

            if (meeting) {
                await updateFieldServiceMeeting(meeting._id, meetingData)
                toast.success('Meeting updated successfully')
            } else {
                await createFieldServiceMeeting(meetingData)
                toast.success('Meeting scheduled successfully')
            }
            onSuccess()
            onClose()
        } catch (error) {
            toast.error(meeting ? 'Failed to update meeting' : 'Failed to schedule meeting')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{meeting ? 'Edit' : 'Schedule'} Field Service Meeting</DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Date *</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !formData.date && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {formData.date ? format(formData.date, "PPP") : "Pick a date"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={formData.date}
                                        onSelect={(date) => date && setFormData({ ...formData, date })}
                                        disabled={(date) => date < new Date()}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="location">Location *</Label>
                            <Input
                                id="location"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                placeholder="Meeting location"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="startTime">Start Time *</Label>
                            <Input
                                id="startTime"
                                type="time"
                                value={formData.startTime}
                                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                required
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="endTime">End Time *</Label>
                            <Input
                                id="endTime"
                                type="time"
                                value={formData.endTime}
                                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Conductor</Label>
                        <Select
                            value={formData.conductorId}
                            onValueChange={(value) => setFormData({ ...formData, conductorId: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select conductor" />
                            </SelectTrigger>
                            <SelectContent>
                                {members.map((member) => (
                                    <SelectItem key={member._id} value={member._id}>
                                        {member.fullName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="information">Information</Label>
                        <Textarea
                            id="information"
                            value={formData.information}
                            onChange={(e) => setFormData({ ...formData, information: e.target.value })}
                            placeholder="Additional meeting information"
                            rows={3}
                        />
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Saving...' : (meeting ? 'Update' : 'Schedule')}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default MeetingScheduleModal