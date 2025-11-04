"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Calendar, Users, BookOpen, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { submitOverseerReport, getAllGroups, getGroupMembers } from '@/lib/actions/overseer.actions'
import { useEffect } from 'react'

interface OverseerReportModalProps {
    open: boolean
    onClose: () => void
    selectedGroup?: string
    selectedMonth?: string
    scheduledDate?: string
}

interface GroupMember {
    id: string
    name: string
    hasStudy: boolean
    participatesInMinistry: boolean
    present: boolean
    fieldServiceHours?: number
    submittedReport?: boolean
}

interface Group {
    _id: string
    name: string
}

export function OverseerReportModal({ open, onClose, selectedGroup, selectedMonth, scheduledDate }: OverseerReportModalProps) {
    const [formData, setFormData] = useState({
        groupId: '',
        month: format(new Date(), 'yyyy-MM'),
        visitDate: '',
        meetingAttendance: '',
        fieldServiceParticipation: '',
        generalObservations: '',
        encouragement: '',
        recommendations: '',
        followUpNeeded: false,
        followUpNotes: ''
    })
    
    // Update form data when selectedGroup, selectedMonth, or scheduledDate changes
    useEffect(() => {
        if (selectedGroup && selectedMonth) {
            setFormData(prev => ({
                ...prev,
                groupId: selectedGroup,
                month: selectedMonth,
                visitDate: scheduledDate ? new Date(scheduledDate).toISOString().slice(0, 10) : ''
            }))
        } else if (open) {
            // Reset form when opening without pre-selected values
            setFormData({
                groupId: '',
                month: format(new Date(), 'yyyy-MM'),
                visitDate: '',
                meetingAttendance: '',
                fieldServiceParticipation: '',
                generalObservations: '',
                encouragement: '',
                recommendations: '',
                followUpNeeded: false,
                followUpNotes: ''
            })
        }
    }, [selectedGroup, selectedMonth, scheduledDate, open])
    
    const [members, setMembers] = useState<GroupMember[]>([])
    const [groups, setGroups] = useState<Group[]>([])
    const [loading, setLoading] = useState(false)
    const [loadingMembers, setLoadingMembers] = useState(false)
    
    // Fetch groups on mount
    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const result = await getAllGroups()
                if (result.success) {
                    setGroups(result.groups)
                }
            } catch (error) {
                console.error('Error fetching groups:', error)
            }
        }
        
        if (open) {
            fetchGroups()
        }
    }, [open])
    
    // Fetch members when group changes
    useEffect(() => {
        const fetchMembers = async () => {
            if (!formData.groupId || !formData.month) return
            
            setLoadingMembers(true)
            try {
                const result = await getGroupMembers(formData.groupId, formData.month)
                if (result.success) {
                    setMembers(result.members)
                }
            } catch (error) {
                console.error('Error fetching members:', error)
                toast.error('Failed to load group members')
            } finally {
                setLoadingMembers(false)
            }
        }
        
        fetchMembers()
    }, [formData.groupId, formData.month])

    const handleMemberUpdate = (memberId: string, field: keyof GroupMember, value: boolean) => {
        setMembers(prev => prev.map(member => 
            member.id === memberId ? { ...member, [field]: value } : member
        ))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        // Validate required fields
        if (!formData.groupId) {
            toast.error('Please select a service group')
            return
        }
        if (!formData.visitDate) {
            toast.error('Please select a visit date')
            return
        }
        if (!formData.meetingAttendance) {
            toast.error('Please select meeting attendance level')
            return
        }
        if (!formData.fieldServiceParticipation.trim()) {
            toast.error('Please provide field service participation details')
            return
        }
        if (!formData.generalObservations.trim()) {
            toast.error('Please provide general observations')
            return
        }
        if (!formData.encouragement.trim()) {
            toast.error('Please provide encouragement details')
            return
        }
        if (!formData.recommendations.trim()) {
            toast.error('Please provide recommendations')
            return
        }
        
        setLoading(true)
        
        try {
            const reportData = {
                ...formData,
                members: members.map(member => ({
                    id: member.id,
                    name: member.name,
                    present: member.present,
                    hasStudy: member.hasStudy,
                    participatesInMinistry: member.participatesInMinistry
                }))
            }
            
            const result = await submitOverseerReport(reportData)
            
            if (result.success) {
                toast.success('Overseer report submitted successfully')
                onClose()
            } else {
                toast.error('Failed to submit report')
            }
        } catch (error) {
            console.error('Error submitting report:', error)
            toast.error(error instanceof Error ? error.message : 'Failed to submit report')
        } finally {
            setLoading(false)
        }
    }

    const presentCount = members.filter(m => m.present).length
    const studyCount = members.filter(m => m.hasStudy).length
    const ministryCount = members.filter(m => m.participatesInMinistry).length

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="w-[95vw] max-w-4xl h-[95vh] max-h-[95vh] overflow-y-auto p-3 sm:p-6">
                <DialogHeader className="pb-3">
                    <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
                        <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span className="truncate">Field Service Overseer Report</span>
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Visit Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <div>
                                <Label htmlFor="group">Service Group</Label>
                                <Select 
                                    value={formData.groupId} 
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, groupId: value }))}
                                    disabled={!!selectedGroup}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select group" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {groups.map((group) => (
                                            <SelectItem key={group._id} value={group._id}>
                                                {group.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {selectedGroup && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Pre-selected from schedule
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="month">Report Month</Label>
                                <Input
                                    id="month"
                                    type="month"
                                    value={formData.month}
                                    onChange={(e) => setFormData(prev => ({ ...prev, month: e.target.value }))}
                                    disabled={!!selectedMonth}
                                    required
                                />
                                {selectedMonth && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Pre-selected from schedule
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="visitDate">Visit Date</Label>
                                <Input
                                    id="visitDate"
                                    type="date"
                                    value={formData.visitDate}
                                    onChange={(e) => setFormData(prev => ({ ...prev, visitDate: e.target.value }))}
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="meetingAttendance">Meeting Attendance *</Label>
                                <Select value={formData.meetingAttendance} onValueChange={(value) => setFormData(prev => ({ ...prev, meetingAttendance: value }))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select attendance level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="excellent">Excellent (90-100%)</SelectItem>
                                        <SelectItem value="good">Good (70-89%)</SelectItem>
                                        <SelectItem value="fair">Fair (50-69%)</SelectItem>
                                        <SelectItem value="poor">Poor (Below 50%)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Member Tracking */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Group Members Assessment
                            </CardTitle>
                            <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
                                <Badge variant="outline" className="gap-1">
                                    <CheckCircle className="h-3 w-3" />
                                    <span className="hidden sm:inline">Present: </span>{presentCount}/{members.length}
                                </Badge>
                                <Badge variant="outline" className="gap-1">
                                    <BookOpen className="h-3 w-3" />
                                    <span className="hidden sm:inline">Bible Studies: </span>{studyCount}
                                </Badge>
                                <Badge variant="outline" className="gap-1">
                                    <Clock className="h-3 w-3" />
                                    <span className="hidden sm:inline">Ministry Active: </span>{ministryCount}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {loadingMembers ? (
                                <div className="space-y-3">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
                                    ))}
                                </div>
                            ) : members.length > 0 ? (
                                <div className="space-y-3">
                                    {members.map((member) => (
                                        <Card key={member.id} className="p-3 sm:p-4">
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${member.present ? 'bg-green-500' : 'bg-red-500'}`} />
                                                    <div className="min-w-0 flex-1">
                                                        <span className="font-medium text-sm sm:text-base truncate block">{member.name}</span>
                                                        {member.submittedReport && (
                                                            <div className="text-xs text-green-600">✓ Report submitted ({member.fieldServiceHours}h)</div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={`present-${member.id}`}
                                                            checked={member.present}
                                                            onCheckedChange={(checked) => 
                                                                handleMemberUpdate(member.id, 'present', checked as boolean)
                                                            }
                                                            className="h-3 w-3 sm:h-4 sm:w-4"
                                                        />
                                                        <Label htmlFor={`present-${member.id}`} className="text-xs sm:text-sm">Present</Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={`study-${member.id}`}
                                                            checked={member.hasStudy}
                                                            onCheckedChange={(checked) => 
                                                                handleMemberUpdate(member.id, 'hasStudy', checked as boolean)
                                                            }
                                                            className="h-3 w-3 sm:h-4 sm:w-4"
                                                        />
                                                        <Label htmlFor={`study-${member.id}`} className="text-xs sm:text-sm">Study</Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={`ministry-${member.id}`}
                                                            checked={member.participatesInMinistry}
                                                            onCheckedChange={(checked) => 
                                                                handleMemberUpdate(member.id, 'participatesInMinistry', checked as boolean)
                                                            }
                                                            className="h-3 w-3 sm:h-4 sm:w-4"
                                                        />
                                                        <Label htmlFor={`ministry-${member.id}`} className="text-xs sm:text-sm">Ministry</Label>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    {formData.groupId ? 'No members found in this group' : 'Select a group to view members'}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Observations and Recommendations */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Observations & Recommendations</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="fieldServiceParticipation">Field Service Participation *</Label>
                                <Textarea
                                    id="fieldServiceParticipation"
                                    placeholder="Describe the group's participation in field service activities..."
                                    value={formData.fieldServiceParticipation}
                                    onChange={(e) => setFormData(prev => ({ ...prev, fieldServiceParticipation: e.target.value }))}
                                    rows={3}
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="generalObservations">General Observations *</Label>
                                <Textarea
                                    id="generalObservations"
                                    placeholder="Share your general observations about the group's spiritual progress..."
                                    value={formData.generalObservations}
                                    onChange={(e) => setFormData(prev => ({ ...prev, generalObservations: e.target.value }))}
                                    rows={3}
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="encouragement">Encouragement Given *</Label>
                                <Textarea
                                    id="encouragement"
                                    placeholder="Describe the encouragement and counsel provided to the group..."
                                    value={formData.encouragement}
                                    onChange={(e) => setFormData(prev => ({ ...prev, encouragement: e.target.value }))}
                                    rows={3}
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="recommendations">Recommendations *</Label>
                                <Textarea
                                    id="recommendations"
                                    placeholder="Provide recommendations for improvement or areas of focus..."
                                    value={formData.recommendations}
                                    onChange={(e) => setFormData(prev => ({ ...prev, recommendations: e.target.value }))}
                                    rows={3}
                                    required
                                />
                            </div>

                            <Separator />

                            <div className="space-y-3">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="followUpNeeded"
                                        checked={formData.followUpNeeded}
                                        onCheckedChange={(checked) => 
                                            setFormData(prev => ({ ...prev, followUpNeeded: checked as boolean }))
                                        }
                                    />
                                    <Label htmlFor="followUpNeeded" className="flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4" />
                                        Follow-up visit needed
                                    </Label>
                                </div>

                                {formData.followUpNeeded && (
                                    <div>
                                        <Label htmlFor="followUpNotes">Follow-up Notes</Label>
                                        <Textarea
                                            id="followUpNotes"
                                            placeholder="Specify what needs follow-up attention..."
                                            value={formData.followUpNotes}
                                            onChange={(e) => setFormData(prev => ({ ...prev, followUpNotes: e.target.value }))}
                                            rows={2}
                                        />
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Submit Buttons */}
                    <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                            {loading ? 'Submitting...' : 'Submit Report'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}