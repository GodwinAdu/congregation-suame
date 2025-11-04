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
import { CalendarIcon, Plus, X } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { createPublicWitnessing, updatePublicWitnessing } from '@/lib/actions/public-witnessing.actions'
import { fetchAllMembers } from '@/lib/actions/user.actions'
import { toast } from 'sonner'

interface Member {
    _id: string
    fullName: string
}

interface PublicWitnessingModalProps {
    open: boolean
    onClose: () => void
    onSuccess: () => void
    schedule?: {
        _id: string
        location: string
        date: string
        startTime: string
        endTime: string
        participants: Array<{
            memberId: string
            memberName: string
            role: string
        }>
        notes?: string
    }
}

const PublicWitnessingModal = ({ open, onClose, onSuccess, schedule }: PublicWitnessingModalProps) => {
    const [loading, setLoading] = useState(false)
    const [members, setMembers] = useState<Member[]>([])
    const [formData, setFormData] = useState({
        location: '',
        date: new Date(),
        startTime: '',
        endTime: '',
        notes: ''
    })
    const [participants, setParticipants] = useState<Array<{
        memberId: string
        memberName: string
        role: string
    }>>([])

    useEffect(() => {
        if (open) {
            fetchMembersList()
            if (schedule) {
                setFormData({
                    location: schedule.location,
                    date: new Date(schedule.date),
                    startTime: schedule.startTime,
                    endTime: schedule.endTime,
                    notes: schedule.notes || ''
                })
                setParticipants(schedule.participants)
            } else {
                setFormData({ location: '', date: new Date(), startTime: '', endTime: '', notes: '' })
                setParticipants([])
            }
        }
    }, [open, schedule])

    const fetchMembersList = async () => {
        try {
            const data = await fetchAllMembers()
            console.log("Fetched members:", data)
            setMembers(data)
        } catch (error) {
            console.error('Error fetching members:', error)
        }
    }

    const addParticipant = () => {
        setParticipants([...participants, { memberId: '', memberName: '', role: 'participant' }])
    }

    const removeParticipant = (index: number) => {
        setParticipants(participants.filter((_, i) => i !== index))
    }

    const updateParticipant = (index: number, field: string, value: string) => {
        const updated = [...participants]
        if (field === 'memberId') {
            const member = members.find(m => m._id === value)
            updated[index] = { ...updated[index], memberId: value, memberName: member?.fullName || '' }
        } else {
            updated[index] = { ...updated[index], [field]: value }
        }
        setParticipants(updated)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.location || !formData.startTime || !formData.endTime) {
            toast.error('Please fill in all required fields')
            return
        }

        setLoading(true)
        try {
            if (schedule) {
                await updatePublicWitnessing(schedule._id, {
                    ...formData,
                    participants: participants.filter(p => p.memberId)
                })
                toast.success('Public witnessing updated successfully')
            } else {
                await createPublicWitnessing({
                    ...formData,
                    participants: participants.filter(p => p.memberId)
                })
                toast.success('Public witnessing scheduled successfully')
            }
            onSuccess()
            onClose()
        } catch (error) {
            toast.error(schedule ? 'Failed to update schedule' : 'Failed to schedule public witnessing')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{schedule ? 'Edit' : 'Schedule'} Public Witnessing</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="location">Location *</Label>
                            <Input
                                id="location"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                placeholder="e.g., Market Square, Bus Station"
                                required
                            />
                        </div>

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

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Label>Participants</Label>
                            <Button type="button" variant="outline" size="sm" onClick={addParticipant}>
                                <Plus className="w-4 h-4 mr-2" />
                                Add Participant
                            </Button>
                        </div>

                        {participants.map((participant, index) => (
                            <div key={index} className="flex gap-2 items-end">
                                <div className="flex-1">
                                    <Select
                                        value={participant.memberId}
                                        onValueChange={(value) => updateParticipant(index, 'memberId', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select member" />
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
                                <div className="w-32">
                                    <Select
                                        value={participant.role}
                                        onValueChange={(value) => updateParticipant(index, 'role', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="participant">Participant</SelectItem>
                                            <SelectItem value="coordinator">Coordinator</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeParticipant(index)}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                            id="notes"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Additional notes or instructions"
                            rows={3}
                        />
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Saving...' : (schedule ? 'Update' : 'Schedule')}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default PublicWitnessingModal