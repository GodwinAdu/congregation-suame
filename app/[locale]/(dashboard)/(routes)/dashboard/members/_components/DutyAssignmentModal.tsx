"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { 
    Users, 
    Award, 
    Calendar, 
    Mic, 
    BookOpen, 
    Settings,
    Star,
    Plus,
    X,
    CheckCircle
} from 'lucide-react'
import { getAllDuties, assignDutyToMember, removeDutyFromMember, getMemberDuties } from '@/lib/actions/duty.actions'

interface DutyAssignmentModalProps {
    open: boolean
    onClose: () => void
    member: any
}

interface Duty {
    _id: string
    name: string
    category: string
    description: string
    requirements: {
        gender: string
        privileges: string[]
        minimumAge: number
        baptized: boolean
    }
}

interface Assignment {
    _id: string
    dutyId: Duty
    assignedDate: string
    notes?: string
    assignedBy: {
        fullName: string
    }
}

const categoryIcons = {
    midweek_meeting: Mic,
    weekend_meeting: BookOpen,
    field_service: Users,
    administrative: Settings,
    special_events: Star
}

const categoryColors = {
    midweek_meeting: "bg-blue-100 text-blue-800",
    weekend_meeting: "bg-purple-100 text-purple-800", 
    field_service: "bg-green-100 text-green-800",
    administrative: "bg-orange-100 text-orange-800",
    special_events: "bg-red-100 text-red-800"
}

export function DutyAssignmentModal({ open, onClose, member }: DutyAssignmentModalProps) {
    const [duties, setDuties] = useState<Duty[]>([])
    const [assignments, setAssignments] = useState<Assignment[]>([])
    const [loading, setLoading] = useState(false)
    const [selectedDuty, setSelectedDuty] = useState<string>('')
    const [notes, setNotes] = useState('')

    useEffect(() => {
        if (open && member) {
            fetchData()
        }
    }, [open, member])

    const fetchData = async () => {
        setLoading(true)
        try {
            const [dutiesResult, assignmentsResult] = await Promise.all([
                getAllDuties(),
                getMemberDuties(member._id)
            ])
            
            if (dutiesResult.success) {
                setDuties(dutiesResult.duties)
            }
            
            if (assignmentsResult.success) {
                setAssignments(assignmentsResult.assignments)
            }
        } catch (error) {
            console.error('Error fetching data:', error)
            toast.error('Failed to load duties')
        } finally {
            setLoading(false)
        }
    }

    const checkEligibility = (duty: Duty) => {
        const issues = []
        
        // Gender check
        if (duty.requirements.gender !== 'both' && duty.requirements.gender !== member.gender) {
            issues.push(`Requires ${duty.requirements.gender}`)
        }
        
        // Baptism check
        if (duty.requirements.baptized && !member.baptizedDate) {
            issues.push('Requires baptism')
        }
        
        // Privileges check
        if (duty.requirements.privileges?.length > 0) {
            const memberPrivileges = member.privileges?.map((p: any) => p.name || p) || []
            const hasRequiredPrivilege = duty.requirements.privileges.some(req => 
                memberPrivileges.includes(req)
            )
            if (!hasRequiredPrivilege) {
                issues.push(`Requires: ${duty.requirements.privileges.join(' or ')}`)
            }
        }
        
        return issues
    }

    const handleAssignDuty = async () => {
        if (!selectedDuty) {
            toast.error('Please select a duty')
            return
        }
        
        setLoading(true)
        try {
            const result = await assignDutyToMember(member._id, selectedDuty, notes)
            
            if (result.success) {
                toast.success('Duty assigned successfully')
                setSelectedDuty('')
                setNotes('')
                fetchData()
            } else {
                toast.error(result.message)
            }
        } catch (error) {
            console.error('Error assigning duty:', error)
            toast.error('Failed to assign duty')
        } finally {
            setLoading(false)
        }
    }

    const handleRemoveDuty = async (dutyId: string) => {
        setLoading(true)
        try {
            const result = await removeDutyFromMember(member._id, dutyId)
            
            if (result.success) {
                toast.success('Duty removed successfully')
                fetchData()
            } else {
                toast.error(result.message)
            }
        } catch (error) {
            console.error('Error removing duty:', error)
            toast.error('Failed to remove duty')
        } finally {
            setLoading(false)
        }
    }

    const assignedDutyIds = assignments.map(a => a.dutyId._id)
    const availableDuties = duties.filter(d => !assignedDutyIds.includes(d._id))
    
    const groupedDuties = availableDuties.reduce((acc, duty) => {
        if (!acc[duty.category]) acc[duty.category] = []
        acc[duty.category].push(duty)
        return acc
    }, {} as Record<string, Duty[]>)

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5" />
                        Duty Assignments - {member?.fullName}
                    </DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Current Assignments */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            Current Assignments ({assignments.length})
                        </h3>
                        
                        {assignments.length > 0 ? (
                            <div className="space-y-3">
                                {assignments.map((assignment) => {
                                    const IconComponent = categoryIcons[assignment.dutyId.category as keyof typeof categoryIcons]
                                    return (
                                        <Card key={assignment._id} className="hover:shadow-md transition-shadow">
                                            <CardContent className="p-4">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-start gap-3 flex-1">
                                                        <IconComponent className="h-5 w-5 text-muted-foreground mt-0.5" />
                                                        <div className="flex-1">
                                                            <h4 className="font-medium">{assignment.dutyId.name}</h4>
                                                            <p className="text-sm text-muted-foreground mb-2">
                                                                {assignment.dutyId.description}
                                                            </p>
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <Badge className={categoryColors[assignment.dutyId.category as keyof typeof categoryColors]}>
                                                                    {assignment.dutyId.category.replace('_', ' ')}
                                                                </Badge>
                                                            </div>
                                                            <p className="text-xs text-muted-foreground">
                                                                Assigned {new Date(assignment.assignedDate).toLocaleDateString()} by {assignment.assignedBy.fullName}
                                                            </p>
                                                            {assignment.notes && (
                                                                <p className="text-xs text-muted-foreground mt-1">
                                                                    Note: {assignment.notes}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleRemoveDuty(assignment.dutyId._id)}
                                                        disabled={loading}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )
                                })}
                            </div>
                        ) : (
                            <Card>
                                <CardContent className="text-center py-8">
                                    <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <p className="text-muted-foreground">No duties assigned yet</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Available Duties */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Plus className="h-5 w-5 text-blue-600" />
                            Available Duties
                        </h3>

                        {/* Assignment Form */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Assign New Duty</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label>Select Duty</Label>
                                    <select
                                        value={selectedDuty}
                                        onChange={(e) => setSelectedDuty(e.target.value)}
                                        className="w-full mt-1 p-2 border rounded-md"
                                    >
                                        <option value="">Choose a duty...</option>
                                        {Object.entries(groupedDuties).map(([category, categoryDuties]) => (
                                            <optgroup key={category} label={category.replace('_', ' ').toUpperCase()}>
                                                {categoryDuties.map((duty) => {
                                                    const issues = checkEligibility(duty)
                                                    return (
                                                        <option 
                                                            key={duty._id} 
                                                            value={duty._id}
                                                            disabled={issues.length > 0}
                                                        >
                                                            {duty.name} {issues.length > 0 ? `(${issues.join(', ')})` : ''}
                                                        </option>
                                                    )
                                                })}
                                            </optgroup>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <Label htmlFor="notes">Notes (Optional)</Label>
                                    <Textarea
                                        id="notes"
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Add any notes about this assignment..."
                                        rows={3}
                                    />
                                </div>

                                <Button 
                                    onClick={handleAssignDuty}
                                    disabled={!selectedDuty || loading}
                                    className="w-full"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Assign Duty
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Duty Categories */}
                        <div className="space-y-3">
                            {Object.entries(groupedDuties).map(([category, categoryDuties]) => {
                                const IconComponent = categoryIcons[category as keyof typeof categoryIcons]
                                return (
                                    <Card key={category}>
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-sm flex items-center gap-2">
                                                <IconComponent className="h-4 w-4" />
                                                {category.replace('_', ' ').toUpperCase()}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-0">
                                            <div className="space-y-2">
                                                {categoryDuties.map((duty) => {
                                                    const issues = checkEligibility(duty)
                                                    const isEligible = issues.length === 0
                                                    
                                                    return (
                                                        <div 
                                                            key={duty._id}
                                                            className={`p-3 rounded-lg border ${
                                                                isEligible ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                                                            }`}
                                                        >
                                                            <div className="flex items-start justify-between">
                                                                <div className="flex-1">
                                                                    <h4 className="font-medium text-sm">{duty.name}</h4>
                                                                    <p className="text-xs text-muted-foreground mt-1">
                                                                        {duty.description}
                                                                    </p>
                                                                    {!isEligible && (
                                                                        <div className="mt-2">
                                                                            {issues.map((issue, index) => (
                                                                                <Badge key={index} variant="destructive" className="text-xs mr-1">
                                                                                    {issue}
                                                                                </Badge>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <Button
                                                                    variant={isEligible ? "outline" : "ghost"}
                                                                    size="sm"
                                                                    disabled={!isEligible}
                                                                    onClick={() => setSelectedDuty(duty._id)}
                                                                >
                                                                    {isEligible ? 'Select' : 'Ineligible'}
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}