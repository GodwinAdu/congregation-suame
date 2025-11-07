"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Award, X, Plus } from 'lucide-react'
import { assignDutyToMember, removeDutyFromMember, getMemberDuties, getAllAvailableDuties } from '@/lib/actions/member-duties.actions'

interface SimpleDutyModalProps {
    open: boolean
    onClose: () => void
    member: any
}

export function SimpleDutyModal({ open, onClose, member }: SimpleDutyModalProps) {
    const [duties, setDuties] = useState<any>({})
    const [memberDuties, setMemberDuties] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [selectedDuty, setSelectedDuty] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('')
    const [notes, setNotes] = useState('')

    useEffect(() => {
        if (open && member) {
            fetchData()
        }
    }, [open, member])

    const fetchData = async () => {
        setLoading(true)
        try {
            const [dutiesResult, memberDutiesResult] = await Promise.all([
                getAllAvailableDuties(),
                getMemberDuties(member._id)
            ])
            
            if (dutiesResult.success) {
                setDuties(dutiesResult.duties)
            }
            
            if (memberDutiesResult.success) {
                setMemberDuties(memberDutiesResult.duties)
            }
        } catch (error) {
            console.error('Error fetching data:', error)
            toast.error('Failed to load duties')
        } finally {
            setLoading(false)
        }
    }

    const handleAssignDuty = async () => {
        if (!selectedDuty || !selectedCategory) {
            toast.error('Please select a duty')
            return
        }
        
        setLoading(true)
        try {
            const result = await assignDutyToMember(member._id, selectedDuty, selectedCategory, notes)
            
            if (result.success) {
                toast.success('Duty assigned successfully')
                setSelectedDuty('')
                setSelectedCategory('')
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

    const handleRemoveDuty = async (dutyName: string) => {
        setLoading(true)
        try {
            const result = await removeDutyFromMember(member._id, dutyName)
            
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

    const categoryColors = {
        midweek_meeting: "bg-blue-100 text-blue-800",
        weekend_meeting: "bg-purple-100 text-purple-800", 
        field_service: "bg-green-100 text-green-800",
        administrative: "bg-orange-100 text-orange-800",
        special_events: "bg-red-100 text-red-800"
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5" />
                        Duty Assignments - {member?.fullName}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Current Duties */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3">Current Duties ({memberDuties.length})</h3>
                        {memberDuties.length > 0 ? (
                            <div className="space-y-2">
                                {memberDuties.map((duty, index) => (
                                    <Card key={index}>
                                        <CardContent className="p-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-medium">{duty.name}</span>
                                                        <Badge className={categoryColors[duty.category as keyof typeof categoryColors]}>
                                                            {duty.category?.replace('_', ' ')}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">
                                                        Assigned {new Date(duty.assignedDate).toLocaleDateString()}
                                                    </p>
                                                    {duty.notes && (
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            Note: {duty.notes}
                                                        </p>
                                                    )}
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleRemoveDuty(duty.name)}
                                                    disabled={loading}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
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

                    {/* Assign New Duty */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3">Assign New Duty</h3>
                        <Card>
                            <CardContent className="p-4 space-y-4">
                                <div>
                                    <Label>Category</Label>
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => {
                                            setSelectedCategory(e.target.value)
                                            setSelectedDuty('')
                                        }}
                                        className="w-full mt-1 p-2 border rounded-md"
                                    >
                                        <option value="">Choose category...</option>
                                        {Object.keys(duties).map((category) => (
                                            <option key={category} value={category}>
                                                {category.replace('_', ' ').toUpperCase()}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {selectedCategory && (
                                    <div>
                                        <Label>Duty</Label>
                                        <select
                                            value={selectedDuty}
                                            onChange={(e) => setSelectedDuty(e.target.value)}
                                            className="w-full mt-1 p-2 border rounded-md"
                                        >
                                            <option value="">Choose duty...</option>
                                            {duties[selectedCategory]?.map((duty: string) => (
                                                <option key={duty} value={duty}>
                                                    {duty}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

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